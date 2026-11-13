// Isolated research runtime. It creates its own databases and never accepts a deployment URI.
const { MongoMemoryServer } = require('mongodb-memory-server');
const { MongoClient, ObjectId } = require('mongodb');
const { spawn, execFileSync } = require('node:child_process');
const { randomBytes, createHash } = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const { once } = require('node:events');
const http = require('node:http');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const ids = { restaurant: new ObjectId('100000000000000000000001'), table: new ObjectId('100000000000000000000002'), item: new ObjectId('100000000000000000000003'), owner: new ObjectId('100000000000000000000004') };
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function recordSource(output) {
    const hashes = {};
    async function scan(dir) {
        for (const entry of await fs.readdir(path.join(root, dir), { withFileTypes: true })) {
            const relative = path.join(dir, entry.name);
            if (entry.isDirectory()) await scan(relative);
            else if (/\.(js|jsx|json|mjs)$/.test(entry.name)) hashes[relative.replaceAll('\\','/')] = createHash('sha256').update(await fs.readFile(path.join(root,relative))).digest('hex');
        }
    }
    for (const dir of ['app','components','hooks','lib','models','scripts','research/order-recovery']) await scan(dir);
    hashes['package-lock.json'] = createHash('sha256').update(await fs.readFile(path.join(root,'package-lock.json'))).digest('hex');
    let commit=null,dirty=null;
    try {
        const git=process.env.GIT_EXECUTABLE||'git';
        commit=execFileSync(git,['rev-parse','HEAD'],{cwd:root,encoding:'utf8',windowsHide:true}).trim();
        dirty=execFileSync(git,['status','--porcelain'],{cwd:root,encoding:'utf8',windowsHide:true}).trim();
    } catch {}
    hashes['next.config.mjs'] = createHash('sha256').update(await fs.readFile(path.join(root,'next.config.mjs'))).digest('hex');
    await fs.writeFile(path.join(output,'source-manifest.json'),JSON.stringify({commit,dirty,buildId:(await fs.readFile(path.join(root,process.env.RESEARCH_DIST_DIR || '.next','BUILD_ID'),'utf8')).trim(),hashes},null,2));
}

async function createEnvironment(output, options = {}) {
    await fs.mkdir(output, { recursive: true });
    const mongo = await MongoMemoryServer.create({ binary: { version: '8.0.17' } });
    const client = await MongoClient.connect(mongo.getUri());
    const apps = {}, proxies = {}, drops = [];
    const bases = { baseline: 'http://127.0.0.1:3041', recovery: 'http://127.0.0.1:3042' };
    const proxyBases = { baseline: 'http://127.0.0.1:3043', recovery: 'http://127.0.0.1:3044' };
    const database = mode => client.db(`dinethread_${mode}_research`);
    const logPath = mode => path.join(output, `server-${mode}.jsonl`);
    const reset = async mode => {
        const db = database(mode);
        for (const collection of ['orders', 'restaurants', 'tables', 'categories', 'menuitems']) await db.collection(collection).deleteMany({});
        await db.collection('restaurants').insertOne({ _id: ids.restaurant, name: 'Order Research Cafe', restaurantId: 'order-research', owner: ids.owner, brandColor: '#18181b', plan: 'free', experienceConfig: {}, businessProfile: {} });
        await db.collection('tables').insertOne({ _id: ids.table, restaurant: ids.restaurant, label: 'Table 1', isActive: true });
        await db.collection('categories').insertOne({ restaurant: ids.restaurant, name: 'Lunch', sortOrder: 0 });
        await db.collection('menuitems').insertOne({ _id: ids.item, restaurant: ids.restaurant, name: 'Test soup', description: 'Synthetic research dish', category: 'Lunch', price: 8, isAvailable: true, variants: [], modifiers: [] });
    };
    const stop = async mode => {
        const app = apps[mode];
        if (app && app.exitCode === null) { const closed = once(app, 'exit'); app.kill(); await closed; }
        delete apps[mode];
    };
    const start = async mode => {
        await stop(mode);
        const app = spawn(process.execPath, [path.join(root, 'node_modules/next/dist/bin/next'), 'start', '-p', new URL(bases[mode]).port, '-H', '127.0.0.1'], {
            cwd: root, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'],
            env: { ...process.env, ORDER_SUBMISSION_MODE: mode, CATALOGUE_MODE: 'automatic', ...options.env?.[mode], MONGODB_URI: mongo.getUri(`dinethread_${mode}_research`), AUTH_SECRET: randomBytes(32).toString('hex'), ORDER_RESEARCH_ENABLED: '1', ORDER_RESEARCH_LOG: logPath(mode) },
        });
        apps[mode] = app;
        let startup = '';
        const log = chunk => { startup += chunk; fs.appendFile(path.join(output, `app-${mode}.log`), chunk).catch(() => {}); };
        app.stdout.on('data', log); app.stderr.on('data', log);
        for (let i = 0; i < 60; i++) {
            if (app.exitCode !== null) throw new Error(`App ${mode} exited: ${startup}`);
            try { if ((await fetch(bases[mode] + '/p/session')).ok) return; } catch {}
            await sleep(250);
        }
        throw new Error(`App ${mode} did not become ready: ${startup}`);
    };
    const close = async () => {
        for (const server of Object.values(proxies)) { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
        await Promise.all(Object.keys(apps).map(stop));
        await client.close(); await mongo.stop();
    };
    try {
        for (const mode of Object.keys(bases)) {
            await fs.writeFile(logPath(mode), '');
            await reset(mode); await start(mode);
            const server = http.createServer(async (req, res) => {
                try {
                    const chunks = []; for await (const chunk of req) chunks.push(chunk);
                    const body = Buffer.concat(chunks);
                    const headers = { ...req.headers, host: new URL(bases[mode]).host };
                    delete headers.connection; delete headers['content-length'];
                    const upstream = await fetch(bases[mode] + req.url, { method: req.method, headers, ...(body.length ? { body } : {}) });
                    const bytes = Buffer.from(await upstream.arrayBuffer());
                    if (req.headers['x-drop-confirmation'] === 'yes') {
                        const answer = JSON.parse(bytes);
                        assert.equal(upstream.status, 201);
                        const record = await database(mode).collection('orders').findOne({ _id: new ObjectId(answer.order._id) });
                        assert.ok(record); // Fault occurs only after independent DB confirmation.
                        const evidence = { purchase: req.headers['x-research-purchase'], mode, committedId: String(record._id), total: record.total, event: 'drop-after-commit', at: new Date().toISOString() };
                        drops.push(evidence); await fs.appendFile(path.join(output, 'faults.jsonl'), JSON.stringify(evidence) + '\n');
                        res.destroy(); return;
                    }
                    res.writeHead(upstream.status, { 'content-type': 'application/json' }); res.end(bytes);
                } catch (error) { res.destroy(error); }
            });
            proxies[mode] = server;
            await new Promise((resolve, reject) => { server.once('error', reject); server.listen(Number(new URL(proxyBases[mode]).port), '127.0.0.1', resolve); });
        }
        return { database, reset, start, stop, close, bases, proxyBases, drops, ids, logPath };
    } catch (error) { await close(); throw error; }
}
module.exports = { createEnvironment, ids, sleep, root, recordSource };

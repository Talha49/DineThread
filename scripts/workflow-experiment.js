const fs = require('node:fs/promises');
const path = require('node:path');
const { randomUUID, createHash } = require('node:crypto');
const { ObjectId } = require('mongodb');
const assert = require('node:assert/strict');
const { createEnvironment, root, ids, recordSource } = require('./order-test-environment');
const { check } = require('./workflow-oracle');
const token = 'd'.repeat(64), customerCookie = `dinethread-order-session=${token}`;
const fixture = status => ({ restaurant: ids.restaurant, table: ids.table, ownerHash: createHash('sha256').update(token).digest('hex'), submissionOutcome: 'accepted', status, workflowVersion: 0, workflowHistory: [], billRequested: false, total: 22.5, items: [{ menuItem: ids.item, name: 'Fixture meal', qty: 2, unitPrice: 11.25, lineTotal: 22.5 }], createdAt: new Date(), statusUpdatedAt: new Date() });
async function main() {
    const pilot = process.argv.includes('--pilot'), protocol = JSON.parse(await fs.readFile('research/workflow/protocol.json'));
    if (!pilot) assert.ok(protocol.frozenAt);
    const output = path.join(root, 'qa-results', `workflow-${pilot ? 'pilot' : 'measured'}-${Date.now()}`);
    await fs.mkdir(output, { recursive: true }); await recordSource(output);
    const histories = pilot ? Array.from({ length: 10 }, (_, i) => ({ round: i, schedule: protocol.schedules[i % 4] })) : Array.from({ length: protocol.rounds }, (_, round) => protocol.schedules.map(schedule => ({ round, schedule }))).flat();
    await fs.writeFile(path.join(output, 'expected.json'), JSON.stringify({ protocol, histories, permittedSequence: ['placed', 'preparing', 'ready', 'served', 'paid'], expectedRevisionDefects: [], billPreservesStatus: true }, null, 2));
    const env = await createEnvironment(output, { env: { baseline: { WORKFLOW_MODE: 'unconditional' }, recovery: { WORKFLOW_MODE: 'conditional' } } });
    const cookies = { baseline: await env.staffCookie('baseline'), recovery: await env.staffCookie('recovery') }, results = [];
    try {
        for (const h of histories) for (const mode of h.round % 2 ? ['recovery', 'baseline'] : ['baseline', 'recovery']) {
            await env.reset(mode); const db = env.database(mode);
            const initial = { status: h.schedule === 'different' ? 'preparing' : 'placed', version: 0 };
            const { insertedId } = await db.collection('orders').insertOne(fixture(initial.status));
            const attempts = [], label = `${h.round}/${h.schedule}`;
            async function send(status, expectedVersion, index, validSequential = false) {
                const bill = status === 'bill', actionId = randomUUID(), start = performance.now();
                const response = await fetch(env.bases[mode] + (bill ? `/p/orders/${insertedId}/request-bill` : `/api/orders/${insertedId}`), {
                    method: bill ? 'POST' : 'PATCH', headers: { 'content-type': 'application/json', cookie: bill ? customerCookie : cookies[mode], 'x-research-history': label, 'x-research-attempt': index },
                    body: JSON.stringify({ actionId, expectedVersion, ...(bill ? {} : { status }) }), signal: AbortSignal.timeout(15000),
                });
                const result = { index, actionId, target: status, expectedVersion, validSequential, status: response.status, body: await response.json(), elapsedMs: performance.now() - start };
                attempts.push(result); return result;
            }
            if (h.schedule === 'delayed') {
                await send('preparing', 0, 'first', true); await send('ready', 1, 'newer', true); await send('preparing', 0, 'delayed');
            } else {
                let release; const barrier = new Promise(resolve => { release = resolve; });
                const targets = h.schedule === 'identical' ? ['preparing', 'preparing'] : h.schedule === 'different' ? ['ready', 'served'] : ['preparing', 'bill'];
                const pair = targets.map((target, i) => barrier.then(() => send(target, 0, `pair-${i}`))); release(); await Promise.all(pair);
            }
            let current = await db.collection('orders').findOne({ _id: insertedId });
            // Explicit fresh decision after reading the result, with a new action ID.
            const next = h.schedule === 'bill-overlap' ? (!current.billRequested ? 'bill' : current.status === 'placed' ? 'preparing' : 'ready') : ({ placed: 'preparing', preparing: 'ready', ready: 'served', served: 'paid' }[current.status]);
            if (next) await send(next, current.workflowVersion, 'refreshed', true);
            current = await db.collection('orders').findOne({ _id: insertedId });
            const trace = (await fs.readFile(path.join(output, `workflow-${mode}.jsonl`), 'utf8')).trim().split('\n').filter(Boolean).map(JSON.parse).filter(e => e.history === label);
            const timeline = trace.filter(e => e.attempt.startsWith('pair-')).sort((a, b) => BigInt(a.tick) < BigInt(b.tick) ? -1 : 1);
            let active = 0, maxOverlap = 0;
            for (const event of timeline) { active += event.event === 'start' ? 1 : -1; maxOverlap = Math.max(maxOverlap, active); }
            const result = { ...h, mode, initial, attempts, order: current, maxOverlap, trace };
            result.defects = check(result);
            if (h.schedule !== 'delayed' && maxOverlap < 2) result.defects.push('overlap-not-established');
            results.push(result); await fs.appendFile(path.join(output, 'observations.jsonl'), JSON.stringify(result) + '\n');
        }
        const summary = { pilot, output, historiesPerVersion: histories.length, baselineDefectiveHistories: results.filter(r => r.mode === 'baseline' && r.defects.length).length, revisionFailures: results.filter(r => r.mode === 'recovery' && r.defects.length).map(r => ({ round: r.round, schedule: r.schedule, defects: r.defects })) };
        await fs.writeFile(path.join(output, 'summary.json'), JSON.stringify(summary, null, 2)); console.log(JSON.stringify(summary)); assert.equal(summary.revisionFailures.length, 0);
    } finally { await env.close(); }
}
module.exports = { fixture, customerCookie };
if (require.main === module) main().catch(error => { console.error(error); process.exitCode = 1; });

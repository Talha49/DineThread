const fs = require('node:fs/promises');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { ObjectId } = require('mongodb');
const assert = require('node:assert/strict');
const { createEnvironment, ids, root, recordSource } = require('./order-test-environment');
const { expected, check } = require('./catalogue-oracle');
const fixtureIds = Array.from({ length: 4 }, (_, i) => ({ item: new ObjectId(`20000000000000000000000${i}`), variant: new ObjectId(`30000000000000000000000${i}`), modifier: new ObjectId(`40000000000000000000000${i}`) }));
const modes = ['baseline', 'recovery'];
async function seed(env, mode, size) {
    await env.reset(mode);
    const db = env.database(mode); await db.collection('menuitems').deleteMany({});
    await db.collection('menuitems').insertMany(fixtureIds.slice(0, size).map((id, i) => ({ _id: id.item, restaurant: ids.restaurant, name: `Fixture dish ${i + 1}`, category: 'Lunch', price: 8, isAvailable: true, variants: [{ _id: id.variant, name: 'Large', price: 10 }], modifiers: [{ _id: id.modifier, name: 'Bread', price: 1 }] })));
    return { restaurantId: 'order-research', tableId: String(ids.table), items: fixtureIds.slice(0, size).map(id => ({ menuItemId: String(id.item), variantId: String(id.variant), modifierIds: [String(id.modifier)], qty: 1, displayed: { selectionPricePence: 1000, modifiers: [{ id: String(id.modifier), pricePence: 100 }] } })) };
}
async function main() {
    const pilot = process.argv.includes('--pilot');
    const protocol = JSON.parse(await fs.readFile(path.join(root, 'research/catalogue/protocol.json')));
    if (!pilot) assert.ok(protocol.frozenAt, 'Freeze after reviewing pilot, before main measurements');
    const output = path.join(root, 'qa-results', `catalogue-${pilot ? 'pilot' : 'measured'}-${Date.now()}`);
    await fs.mkdir(output, { recursive: true }); await recordSource(output);
    const cases = Array.from({ length: pilot ? 1 : protocol.rounds }, (_, round) => protocol.conditions.flatMap(condition => protocol.sizes.map(size => ({ round, condition, size })))).flat();
    const selected = pilot ? [...cases.filter(c => c.size === 1), cases[1], cases.at(-1)].slice(0, protocol.pilotCases) : cases;
    await fs.writeFile(path.join(output, 'expected.json'), JSON.stringify(selected.map(c => ({ ...c, baseline: expected(c.condition, c.size, 'baseline'), recovery: expected(c.condition, c.size, 'recovery') })), null, 2));
    await fs.writeFile(path.join(output, 'protocol.json'), JSON.stringify(protocol, null, 2));
    const env = await createEnvironment(output, { env: { baseline: { ORDER_SUBMISSION_MODE: 'recovery', CATALOGUE_MODE: 'automatic' }, recovery: { ORDER_SUBMISSION_MODE: 'recovery', CATALOGUE_MODE: 'reconfirmation' } } });
    const results = [];
    async function post(mode, payload, label, index) {
        const start = performance.now();
        const response = await fetch(env.bases[mode] + '/p/orders', { method: 'POST', headers: { 'content-type': 'application/json', cookie: `dinethread-order-session=${'c'.repeat(64)}`, 'x-research-purchase': label, 'x-research-attempt': String(index) }, body: JSON.stringify({ ...payload, requestId: randomUUID() }), signal: AbortSignal.timeout(protocol.requestTimeoutMs) });
        return { status: response.status, body: await response.json(), apiMs: performance.now() - start };
    }
    try {
        for (const mode of modes) { const warm = await seed(env, mode, 1); await post(mode, warm, 'warmup', 0); }
        for (const c of selected) for (const mode of c.round % 2 ? [...modes].reverse() : modes) {
            const payload = await seed(env, mode, c.size), db = env.database(mode);
            const changes = { increase: { 'variants.0.price': 12 }, decrease: { 'variants.0.price': 8 }, unavailable: { isAvailable: false }, 'deleted-option': { modifiers: [] }, 'modifier-price': { 'modifiers.0.price': 1.5 }, 'unrelated-edit': { description: 'Only the words changed' }, 'second-change': { 'variants.0.price': 12 } }[c.condition];
            if (changes) await db.collection('menuitems').updateOne({ _id: fixtureIds[0].item }, { $set: changes });
            const label = `${c.round}/${c.condition}/${c.size}`, started = performance.now(), attempts = [];
            attempts.push(await post(mode, payload, label, 0));
            if (c.condition === 'second-change') await db.collection('menuitems').updateOne({ _id: fixtureIds[0].item }, { $set: { 'variants.0.price': 13 } });
            while (attempts.at(-1).body.code === 'MENU_CHANGED' && attempts.length < 4) {
                // Simulated explicit approval copies the returned per-selection facts.
                const quotes = attempts.at(-1).body.details.quotes;
                for (const line of payload.items) line.displayed = quotes.find(q => q.key === `${line.menuItemId}|${line.variantId}|${line.modifierIds.join(',')}`).displayed;
                attempts.push(await post(mode, payload, label, attempts.length));
            }
            const checkoutMs = performance.now() - started;
            const orders = await db.collection('orders').find({ submissionOutcome: 'accepted' }).toArray();
            const oracle = expected(c.condition, c.size, mode);
            const defects = check({ ...c, mode, attempts, accepted: orders });
            const trace = (await fs.readFile(env.logPath(mode), 'utf8')).trim().split('\n').filter(Boolean).map(JSON.parse).filter(e => e.purchase === label && e.event === 'end');
            const result = { ...c, mode, oracle, checkoutMs, validationMs: trace.map(t => t.validationMs), attempts, accepted: orders.map(o => ({ id: String(o._id), total: o.total, items: o.items })), defects };
            results.push(result); await fs.appendFile(path.join(output, 'observations.jsonl'), JSON.stringify(result) + '\n');
        }
        const summary = { pilot, output, casesPerVersion: selected.length, observations: results.length, violations: results.filter(r => r.defects.length).map(r => ({ ...r, attempts: undefined, accepted: undefined })) };
        await fs.writeFile(path.join(output, 'summary.json'), JSON.stringify(summary, null, 2)); console.log(JSON.stringify(summary));
        assert.equal(summary.violations.length, 0);
    } finally { await env.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });

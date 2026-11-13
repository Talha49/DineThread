const { chromium } = require('playwright');
const fs = require('node:fs/promises');
const path = require('node:path');
const assert = require('node:assert/strict');
const { createEnvironment, ids, root, recordSource } = require('./order-test-environment');
const { fixture, customerCookie } = require('./workflow-experiment');
async function main() {
    const output = path.join(root, 'qa-results', `workflow-browser-${Date.now()}`);
    await fs.mkdir(output, { recursive: true }); await recordSource(output);
    const env = await createEnvironment(output, { env: { baseline: { WORKFLOW_MODE: 'unconditional' }, recovery: { WORKFLOW_MODE: 'conditional' } } });
    const browser = await chromium.launch({ headless: true, executablePath: process.env.QA_CHROME_PATH });
    const results = []; let activePage;
    try {
        for (const mode of ['baseline', 'recovery']) for (const journey of ['normal', 'stale-staff', 'bill-overlap', 'lost-payment', 'reload-payment']) {
            await env.reset(mode); const db = env.database(mode), base = env.bases[mode];
            const { insertedId } = await db.collection('orders').insertOne(fixture(journey.includes('payment') ? 'served' : 'placed'));
            const id = String(insertedId), staffCookie = (await env.staffCookie(mode)).split('=')[1];
            const contexts = await Promise.all([browser.newContext({ viewport: { width: 1280, height: 960 } }), browser.newContext({ viewport: { width: 1280, height: 960 } }), browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })]);
            await Promise.all(contexts.slice(0, 2).map(c => c.addCookies([{ name: 'auth-token', value: staffCookie, url: base }])));
            await contexts[2].addCookies([{ name: 'dinethread-order-session', value: customerCookie.split('=')[1], url: base }]);
            await contexts[2].addInitScript(({ id }) => {
                localStorage.setItem('smart-menu-cart', JSON.stringify({ state: { restaurantId: 'order-research', tableId: null, items: [], orderId: id, pendingPurchases: {}, confirmedOrders: { 'order-research': id } }, version: 0 }));
                localStorage.setItem('dinethread-purchase:order-research', JSON.stringify({ pending: null, orderId: id }));
            }, { id });
            const [one, two, customer] = await Promise.all(contexts.map(c => c.newPage())); activePage = one;
            const errors = []; for (const p of [one, two, customer]) p.on('pageerror', error => errors.push(error.message));
            await Promise.all([one.goto(base + '/dashboard/orders'), two.goto(base + '/dashboard/orders'), customer.goto(base + '/menu/order-research')]);
            await customer.getByRole('button', { name: 'Open cart and order status' }).click();
            await Promise.all([one, two, customer].map(p => p.locator(`[data-order-id="${id}"][data-version="0"]`).waitFor()));
            const timings = [], faults = [];
            const state = () => db.collection('orders').findOne({ _id: insertedId });
            async function converge() {
                const observed = await state(), start = performance.now();
                if (observed.status === 'paid') await Promise.all([one, two].map(p => p.getByRole('button', { name: 'History', exact: true }).click()));
                await Promise.all([one, two, customer].map(p => p.locator(`[data-order-id="${id}"][data-version="${observed.workflowVersion}"]`).waitFor({ timeout: 15000 })));
                timings.push({ version: observed.workflowVersion, status: observed.status, confirmedReadbackToAllScreensMs: performance.now() - start });
                return observed;
            }
            async function advance(page, label) {
                const result = page.waitForResponse(r => r.url().endsWith(`/api/orders/${id}`) && r.request().method() === 'PATCH');
                await page.getByRole('button', { name: label, exact: true }).click();
                const response = await result; return { status: response.status(), body: await response.json() };
            }
            if (journey === 'normal') {
                await db.collection('menuitems').updateOne({ _id: ids.item }, { $set: { price: 99 } });
                for (const label of ['Start Preparing', 'Mark Ready', 'Mark Served', 'Mark Paid']) { assert.equal((await advance(one, label)).status, 200); await converge(); }
            } else if (journey === 'stale-staff') {
                const old = await (await contexts[1].request.get(base + '/api/orders')).json();
                await two.route('**/api/orders', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(old) }));
                await advance(one, 'Start Preparing');
                const stale = await advance(two, 'Start Preparing');
                assert.equal(stale.status, mode === 'recovery' ? 409 : 200);
                await two.unroute('**/api/orders');
                if (mode === 'recovery') await two.getByRole('alert').filter({ hasText: 'Refresh' }).waitFor();
                await converge();
            } else if (journey === 'bill-overlap') {
                const held = [];
                const gate = async route => { held.push(route); if (held.length === 2) await Promise.all(held.map(r => r.continue())); };
                await one.route(`**/api/orders/${id}`, gate);
                await customer.route(`**/p/orders/${id}/request-bill`, gate);
                const replies = [one.waitForResponse(r => r.request().method() === 'PATCH' && r.url().endsWith(id)), customer.waitForResponse(r => r.url().endsWith('/request-bill'))];
                await Promise.all([one.getByRole('button', { name: 'Start Preparing', exact: true }).click(), customer.getByRole('button', { name: 'Request Bill', exact: true }).click()]);
                await Promise.all(replies); await one.unroute(`**/api/orders/${id}`); await customer.unroute(`**/p/orders/${id}/request-bill`);
                const current = await converge();
                if (!current.billRequested) { await customer.getByRole('button', { name: 'Request Bill', exact: true }).click(); await customer.getByText('Bill requested - your server is on the way.', { exact: true }).waitFor(); }
                else if (current.status === 'placed') await advance(one, 'Start Preparing');
                const final = await converge(); assert.equal(final.billRequested, true); assert.equal(final.status, 'preparing');
            } else {
                let dropped = false;
                await one.route(`**/api/orders/${id}`, async route => {
                    if (dropped) return route.continue();
                    const response = await route.fetch(), body = await response.json(), saved = await state();
                    assert.equal(response.status(), 200); assert.equal(saved.status, 'paid');
                    assert.equal(saved.workflowHistory.filter(e => e.actionId === body.action.id).length, 1);
                    dropped = true; faults.push({ actionId: body.action.id, version: saved.workflowVersion, event: 'verified-payment-event-before-response-drop' });
                    await route.abort('failed');
                });
                await one.getByRole('button', { name: 'Mark Paid', exact: true }).click();
                await one.getByRole('button', { name: 'Retry saved action', exact: true }).waitFor();
                if (journey === 'reload-payment') await one.reload();
                await one.getByRole('button', { name: 'Retry saved action', exact: true }).click();
                await one.getByRole('button', { name: 'Retry saved action', exact: true }).waitFor({ state: 'detached' });
                const final = await converge(); assert.equal(final.workflowHistory.length, 1); assert.equal(final.total, 22.5);
            }
            const final = await state();
            if (final.status === 'paid') { const summary = await (await contexts[0].request.get(base + '/api/orders?view=history')).json(); assert.deepEqual(summary.summary, { paidCount: 1, totalPence: 2250 }); }
            assert.deepEqual(errors, []);
            await one.screenshot({ path: path.join(output, `${mode}-${journey}-staff.png`) });
            await customer.screenshot({ path: path.join(output, `${mode}-${journey}-customer.png`) });
            results.push({ mode, journey, timings, faults, finalStatus: final.status, finalVersion: final.workflowVersion, total: final.total, acceptedEvents: final.workflowHistory.length, pass: true, errors });
            await fs.writeFile(path.join(output, 'results.json'), JSON.stringify(results, null, 2));
            await Promise.all(contexts.map(c => c.close()));
        }
        console.log(JSON.stringify({ output, passed: results.length }));
    } catch (error) { if (activePage && !activePage.isClosed()) { await activePage.screenshot({ path: path.join(output, 'failure.png') }); console.error((await activePage.locator('body').innerText()).slice(-2000)); } throw error; }
    finally { await browser.close(); await env.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });

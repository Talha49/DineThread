const { chromium, firefox } = require('playwright');
const fs = require('node:fs/promises');
const path = require('node:path');
const assert = require('node:assert/strict');
const { ObjectId } = require('mongodb');
const { createEnvironment, ids, root, recordSource } = require('./order-test-environment');
const variant = new ObjectId('500000000000000000000001'), bread = new ObjectId('500000000000000000000002');
async function main() {
    const mode = process.argv.includes('--baseline') ? 'baseline' : 'recovery';
    const scan = process.argv.includes('--axe'), pilot = process.argv.includes('--pilot'), ff = process.argv.includes('--firefox');
    const output = path.join(root, 'qa-results', `accessibility-${mode}-${scan ? 'axe' : 'keyboard'}-${Date.now()}`);
    await fs.mkdir(output, { recursive: true }); await recordSource(output);
    await fs.copyFile(path.join(root, 'research/accessibility/protocol.json'), path.join(output, 'protocol.json'));
    const env = await createEnvironment(output, { env: {
        baseline: { RESEARCH_DIST_DIR: 'qa-results/build-workflow-v1', ORDER_SUBMISSION_MODE: 'recovery', CATALOGUE_MODE: 'reconfirmation', WORKFLOW_MODE: 'conditional' },
        recovery: { ORDER_SUBMISSION_MODE: 'recovery', CATALOGUE_MODE: 'reconfirmation', WORKFLOW_MODE: 'conditional' }
    } });
    const browser = await (ff ? firefox : chromium).launch({ headless: true, ...(!ff && { executablePath: process.env.QA_CHROME_PATH }) });
    const results = []; let page;
    try {
        const journeys = ff ? ['options', 'invalid-table', 'status'] : pilot ? ['options', 'invalid-table'] : ['simple', 'options', 'cart', 'invalid-table', 'unavailable', 'status'];
        const widths = scan ? (ff || pilot ? [1280] : [1280, 390]) : [1280];
        const tasks = widths.flatMap(width => journeys.map(journey => ({ width, journey })));
        if (!pilot && !ff) for (const journey of ['menu', 'options', 'cart', 'status']) tasks.push({ width: 320, journey });
        for (const { width, journey } of tasks) {
            await env.reset(mode); const db = env.database(mode);
            if (journey === 'options') await db.collection('menuitems').updateOne({ _id: ids.item }, { $set: { variants: [{ _id: variant, name: 'Large', price: 10 }], modifiers: [{ _id: bread, name: 'Bread', price: 2, category: 'Extras' }] } });
            const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
            page = await context.newPage(); page.setDefaultTimeout(10000);
            const result = { mode, engine: ff ? 'firefox' : 'chromium', width, journey, keyboard: [], states: [], errors: [] };
            page.on('pageerror', error => result.errors.push(error.message));
            async function activate(locator, label) {
                if (scan) { await locator.click(); return; }
                let reached = false;
                for (let i = 0; i < 35; i++) {
                    if (await locator.evaluate(el => el === document.activeElement)) { reached = true; break; }
                    await page.keyboard.press('Tab');
                }
                result.keyboard.push({ action: label, reachable: reached });
                if (reached) await page.keyboard.press('Enter');
                else await locator.click(); // Continue independent states, recording the blocked keyboard step.
            }
            async function state(name) {
                await page.waitForTimeout(450); // Capture settled CSS entrances in both versions.
                const data = await page.evaluate(() => {
                    const d = document.querySelector('[role="dialog"]'), active = document.activeElement;
                    const rect = active.getBoundingClientRect(), style = getComputedStyle(active);
                    return { overflow: document.documentElement.scrollWidth > innerWidth,
                        active: { tag: active.tagName, name: active.getAttribute('aria-label') || active.textContent?.trim().slice(0, 100), insideDialog: !!d?.contains(active), rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height }, outline: style.outline, boxShadow: style.boxShadow },
                        dialogName: d?.getAttribute('aria-label') || document.getElementById(d?.getAttribute('aria-labelledby'))?.textContent || null,
                        live: [...document.querySelectorAll('[role="status"], [role="alert"], [aria-live]')].map(el => ({ role: el.getAttribute('role'), live: el.getAttribute('aria-live'), text: el.textContent.trim() })),
                        controls: [...(d || document).querySelectorAll('button,input')].map(el => ({ tag: el.tagName, role: el.getAttribute('role'), name: el.getAttribute('aria-label') || el.textContent.trim(), checked: el.getAttribute('aria-checked'), pressed: el.getAttribute('aria-pressed') })) };
                });
                if (scan) {
                    const AxeBuilder = require('@axe-core/playwright').default;
                    const report = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
                    await fs.writeFile(path.join(output, `${width}-${journey}-${name}-axe.json`), JSON.stringify(report, null, 2));
                    data.violations = report.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) }));
                }
                await page.screenshot({ path: path.join(output, `${width}-${journey}-${name}.png`) });
                result.states.push({ name, ...data });
            }
            await page.goto(env.bases[mode] + '/menu/order-research');
            await page.getByText('Test soup', { exact: true }).waitFor();
            await state('menu');
            if (journey !== 'menu') {
                const card = page.getByText('Test soup', { exact: true }).locator('xpath=ancestor::*[@role="button"][1]');
                await activate(await card.count() ? card : page.getByText('Test soup', { exact: true }), 'open item');
                await page.getByRole('dialog').waitFor(); await state('customisation');
                if (journey === 'options') {
                    await activate(page.getByRole('button', { name: /Large/ }), 'select size');
                    await activate(page.getByRole('button', { name: /Bread/ }), 'select extra');
                }
                await activate(page.getByRole('button', { name: /^Add -/ }), 'add item');
                await activate(page.getByRole('button', { name: 'Open cart and order status' }), 'open cart');
                if (journey === 'cart') {
                    await activate(page.getByRole('button', { name: 'Add one Test soup' }), 'increase quantity');
                    await activate(page.getByRole('button', { name: 'Remove one Test soup' }), 'decrease quantity');
                }
                await state('cart');
                if (journey === 'invalid-table') {
                    await activate(page.getByRole('button', { name: /^Place Order/ }), 'submit without table');
                    await page.getByRole('alert').filter({ hasText: 'select your table' }).waitFor();
                    assert.equal(await db.collection('orders').countDocuments({ submissionOutcome: 'accepted' }), 0); await state('validation');
                }
                await activate(page.getByRole('button', { name: 'Table 1', exact: true }), 'select table');
                if (journey === 'unavailable') await db.collection('menuitems').updateOne({ _id: ids.item }, { $set: { isAvailable: false } });
                await activate(page.getByRole('button', { name: /^Place Order/ }), 'submit');
                if (journey === 'unavailable') {
                    await page.getByRole('alert').filter({ hasText: 'no longer available' }).waitFor(); await state('unavailable');
                    assert.equal(await db.collection('orders').countDocuments({ submissionOutcome: 'accepted' }), 0);
                } else {
                    await page.getByRole('heading', { name: 'Order Status', exact: true }).waitFor();
                    const order = await db.collection('orders').findOne({ submissionOutcome: 'accepted' });
                    assert.equal(order.total, journey === 'options' ? 12 : 8); await state('placed');
                    if (journey === 'status') {
                        for (const status of ['preparing', 'ready']) {
                            await db.collection('orders').updateOne({ _id: order._id }, { $set: { status }, $inc: { workflowVersion: 1 } });
                            await page.waitForFunction(({ id, v }) => document.querySelector(`[data-order-id="${id}"]`)?.getAttribute('data-version') === String(v), { id: String(order._id), v: status === 'preparing' ? 1 : 2 });
                            await state(status);
                        }
                        await activate(page.getByRole('button', { name: 'Request Bill', exact: true }), 'request bill');
                        await page.getByText('Bill requested - your server is on the way.').waitFor(); await state('bill');
                        await page.reload(); await page.getByRole('button', { name: 'Open cart and order status' }).click();
                        await page.getByRole('heading', { name: 'Order Status', exact: true }).waitFor(); await state('restored');
                    }
                }
                await page.keyboard.press('Escape');
                result.returnFocus = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'));
            }
            assert.deepEqual(result.errors, []); result.functionalPass = true; results.push(result);
            await fs.writeFile(path.join(output, 'results.json'), JSON.stringify(results, null, 2)); await context.close();
        }
        console.log(JSON.stringify({ output, runs: results.length, blockedKeyboardSteps: results.flatMap(r => r.keyboard).filter(k => !k.reachable).length }));
    } catch (error) { await fs.writeFile(path.join(output, 'failure.txt'), error.stack); if (page && !page.isClosed()) await page.screenshot({ path: path.join(output, 'failure.png') }); throw error; }
    finally { await browser.close(); await env.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });

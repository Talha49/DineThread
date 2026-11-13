const { chromium } = require('playwright');
const fs = require('node:fs/promises');
const path = require('node:path');
const assert = require('node:assert/strict');
const { ObjectId } = require('mongodb');
const { createEnvironment, ids, root, recordSource } = require('./order-test-environment');
async function main() {
    const output = path.join(root, 'qa-results', `catalogue-browser-${Date.now()}`);
    await fs.mkdir(output, { recursive: true }); await recordSource(output);
    const env = await createEnvironment(output, { env: { recovery: { CATALOGUE_MODE: 'reconfirmation' } } });
    const browser = await chromium.launch({ headless: true, executablePath: process.env.QA_CHROME_PATH });
    const results = []; let page;
    try {
        for (const width of [1280, 390]) for (const journey of ['unchanged', 'increase', 'decrease', 'unavailable', 'deleted-option', 'second-change']) {
            await env.reset('recovery');
            const db = env.database('recovery');
            if (journey === 'deleted-option') await db.collection('menuitems').updateOne({ _id: ids.item }, { $set: { variants: [{ _id: new ObjectId('500000000000000000000001'), name: 'Large', price: 8 }] } });
            const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
            page = await context.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
            await page.goto(env.bases.recovery + '/menu/order-research');
            await page.getByText('Test soup', { exact: true }).click();
            await page.getByRole('button', { name: /^Add -/ }).click();
            await page.getByRole('button', { name: 'Open cart and order status' }).click();
            await page.getByRole('button', { name: 'Table 1', exact: true }).click();
            const changes = { increase: { price: 9 }, decrease: { price: 7 }, unavailable: { isAvailable: false }, 'deleted-option': { variants: [] }, 'second-change': { price: 9 } }[journey];
            if (changes) await db.collection('menuitems').updateOne({ _id: ids.item }, { $set: changes });
            await page.getByRole('button', { name: /^Place Order/ }).click();
            if (['increase', 'decrease', 'second-change'].includes(journey)) {
                await page.getByRole('button', { name: /^Confirm updated prices/ }).waitFor();
                assert.equal(await db.collection('orders').countDocuments({ submissionOutcome: 'accepted' }), 0);
                await page.screenshot({ path: path.join(output, `${width}-${journey}-confirmation.png`) });
                if (journey === 'second-change') await db.collection('menuitems').updateOne({ _id: ids.item }, { $set: { price: 10 } });
                await page.getByRole('button', { name: /^Confirm updated prices/ }).click();
                if (journey === 'second-change') {
                    await page.getByRole('button', { name: /^Confirm updated prices.*10\.00/ }).waitFor();
                    assert.equal(await db.collection('orders').countDocuments({ submissionOutcome: 'accepted' }), 0);
                    await page.getByRole('button', { name: /^Confirm updated prices/ }).dblclick();
                }
            }
            const rejected = ['unavailable', 'deleted-option'].includes(journey);
            if (rejected) await page.getByRole('alert').filter({ hasText: 'no longer available' }).waitFor();
            else await page.getByRole('heading', { name: 'Order Status', exact: true }).waitFor();
            const orders = await db.collection('orders').find({ submissionOutcome: 'accepted' }).toArray();
            assert.equal(orders.length, rejected ? 0 : 1);
            if (!rejected) assert.equal(orders[0].total, { increase: 9, decrease: 7, 'second-change': 10 }[journey] || 8);
            assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
            assert.deepEqual(errors, []);
            await page.screenshot({ path: path.join(output, `${width}-${journey}-settled.png`) });
            results.push({ width, journey, accepted: orders.length, total: orders[0]?.total, errors, pass: true });
            await fs.writeFile(path.join(output, 'results.json'), JSON.stringify(results, null, 2)); await context.close();
        }
        console.log(JSON.stringify({ output, passed: results.length }));
    } catch (error) { if (page && !page.isClosed()) { await page.screenshot({ path: path.join(output, 'failure.png') }); console.error((await page.locator('body').innerText()).slice(-1500)); } throw error; }
    finally { await browser.close(); await env.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });

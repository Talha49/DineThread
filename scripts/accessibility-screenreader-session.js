// Keeps synthetic fixtures available for native NVDA/keyboard inspection.
// UI actions are performed separately; this helper only prepares repeatable states.
const { chromium } = require('playwright');
const fs = require('node:fs/promises');
const path = require('node:path');
const { ObjectId } = require('mongodb');
const { createEnvironment, ids, root, recordSource } = require('./order-test-environment');
async function main() {
    const output = path.join(root, 'qa-results', `screenreader-${Date.now()}`);
    await fs.mkdir(output, { recursive: true }); await recordSource(output);
    const commandPath = path.join(root, 'qa-results', 'screenreader-command.json');
    await fs.writeFile(commandPath, '{}');
    const env = await createEnvironment(output, { portOffset: 100, env: {
        baseline: { RESEARCH_DIST_DIR: 'qa-results/build-workflow-v1', ORDER_SUBMISSION_MODE: 'recovery', CATALOGUE_MODE: 'reconfirmation', WORKFLOW_MODE: 'conditional' },
        recovery: { ORDER_SUBMISSION_MODE: 'recovery', CATALOGUE_MODE: 'reconfirmation', WORKFLOW_MODE: 'conditional' }
    } });
    const browser = await chromium.launch({ headless: false, executablePath: process.env.QA_CHROME_PATH, args: ['--force-renderer-accessibility'] });
    let context, page, mode, seen;
    console.log(JSON.stringify({ output, commandPath }));
    try {
        while (true) {
            const command = JSON.parse(await fs.readFile(commandPath, 'utf8'));
            if (command.id && command.id !== seen) {
                seen = command.id;
                if (command.action === 'close') break;
                if (command.action === 'open') {
                    mode = command.mode; if (!['baseline', 'recovery'].includes(mode)) throw new Error('Invalid mode');
                    if (context) await context.close(); await env.reset(mode);
                    await env.database(mode).collection('menuitems').updateOne({ _id: ids.item }, { $set: {
                        variants: [{ _id: new ObjectId('500000000000000000000001'), name: 'Large', price: 10 }],
                        modifiers: [{ _id: new ObjectId('500000000000000000000002'), name: 'Bread', price: 2, category: 'Extras' }]
                    } });
                    context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
                    page = await context.newPage(); await page.goto(env.bases[mode] + '/menu/order-research');
                    await page.getByText('Test soup', { exact: true }).waitFor();
                    if (command.journey !== 'options') {
                        await page.getByText('Test soup', { exact: true }).click();
                        await page.getByRole('button', { name: /^Add -/ }).click();
                        await page.getByRole('button', { name: 'Open cart and order status' }).click();
                        if (command.journey === 'status') {
                            await page.getByRole('button', { name: 'Table 1', exact: true }).click();
                            await page.getByRole('button', { name: /^Place Order/ }).click();
                            await page.getByRole('heading', { name: 'Order Status', exact: true }).waitFor();
                        }
                    }
                    await page.bringToFront();
                } else if (command.action === 'status') {
                    if (!['preparing', 'ready'].includes(command.status)) throw new Error('Invalid state');
                    await env.database(mode).collection('orders').updateOne({ submissionOutcome: 'accepted' }, { $set: { status: command.status }, $inc: { workflowVersion: 1 } });
                    const order = await env.database(mode).collection('orders').findOne({ submissionOutcome: 'accepted' });
                    await page.waitForFunction(version => document.querySelector('[data-version]')?.getAttribute('data-version') === String(version), order.workflowVersion);
                    command.renderedVersion = order.workflowVersion;
                    command.statusText = await page.locator('[data-order-id]').innerText();
                    await page.screenshot({ path: path.join(output, `${mode}-${command.status}.png`) });
                } else if (command.action === 'screenshot') {
                    await page.screenshot({ path: path.join(output, `${mode}-${command.label.replace(/[^a-z0-9-]/gi, '')}.png`) });
                }
                await fs.appendFile(path.join(output, 'actions.jsonl'), JSON.stringify({ ...command, at: new Date().toISOString() }) + '\n');
                await fs.writeFile(path.join(output, 'ready.json'), JSON.stringify({ ...command, url: page?.url() }));
                console.log(JSON.stringify({ ready: command.id }));
            }
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    } finally { await browser.close(); await env.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });

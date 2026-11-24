// Local synthetic regression checks for the post-review fixes. No live database.
const fs = require('node:fs/promises');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { createEnvironment, recordSource } = require('./order-test-environment');
const output = path.resolve('qa-results', `review-fixes-${Date.now()}`);
const results = [];
let env, browser, page, release;
const record = async value => {
  results.push(value);
  await fs.writeFile(path.join(output, 'results.json'), JSON.stringify(results, null, 2));
};
const restaurant = () => env.database('recovery').collection('restaurants').findOne({ _id: env.ids.restaurant });
const currentColour = () => page.evaluate(() => window.__themeEditor.getConfig().colors.brand.primary);

async function editor(width) {
  const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: 'reduce', isMobile: width < 500, hasTouch: width < 500 });
  const cookie = await env.staffCookie('recovery');
  await context.addCookies([{ name: 'auth-token', value: cookie.slice('auth-token='.length), url: env.bases.recovery }]);
  page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(env.bases.recovery + '/dashboard/settings');
  await page.waitForFunction(() => window.__themeEditor?.getConfig());
  await page.evaluate(() => {
    const c = structuredClone(window.__themeEditor.getConfig());
    c.colors.brand.primary = '#234567'; window.__themeEditor.edit(c);
  });

  let intercepted;
  const reached = new Promise(resolve => { intercepted = resolve; });
  const held = new Promise(resolve => { release = resolve; });
  let requests = 0;
  await page.route('**/api/restaurant/branding', async route => {
    if (route.request().method() === 'PUT') { requests++; intercepted(); await held; }
    await route.continue();
  });
  // Use the actual save control; hold its network request to expose the race.
  await page.getByTitle('Save Design', { exact: true }).click();
  await Promise.race([reached, new Promise((_, reject) => setTimeout(() => reject(new Error('Save not intercepted')), 10000))]);
  const reset = page.getByRole('button', { name: /Reset Studio/ });
  assert.equal(await reset.isDisabled(), true);
  assert.equal(await page.evaluate(() => window.__themeEditor.reset()), false, 'Handler must also guard non-click callers');
  assert.equal(await currentColour(), '#234567');
  await reset.scrollIntoViewIfNeeded();
  await page.screenshot({ path: path.join(output, `pending-${width}.png`) });
  release();
  await page.waitForFunction(() => !document.querySelector('[title="Save Design"]').disabled);
  assert.equal((await restaurant()).experienceConfig.themeConfig.colors.brand.primary, '#234567');
  assert.equal(requests, 1);
  await reset.click();
  await page.waitForFunction(() => !document.querySelector('[title="Save Design"]').disabled);
  assert.equal(await currentColour(), '#4f46e5');
  assert.equal((await restaurant()).experienceConfig.themeConfig.colors.brand.primary, '#4f46e5');
  assert.equal(requests, 2);
  await page.unroute('**/api/restaurant/branding');
  await page.getByText('Design Studio reset to factory defaults', { exact: true }).waitFor({ state: 'hidden' });
  await reset.scrollIntoViewIfNeeded();
  await page.screenshot({ path: path.join(output, `reset-${width}.png`) });
  await page.reload();
  await page.waitForFunction(() => window.__themeEditor?.getConfig());
  assert.equal(await currentColour(), '#4f46e5');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  assert.equal(overflow, false);
  await record({ check: 'pending-save/reset/reload', width, requests, disabledWhileSaving: true, persistedDefault: true, overflow, errors });

  if (width < 500) {
    const previewButton = page.getByRole('button', { name: 'Preview', exact: true });
    const bounds = await previewButton.boundingBox();
    assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= width, 'Preview control must fit on screen');
    await previewButton.click();
    await page.waitForFunction(() => window.__themePreview?.controller.snapshot().acknowledged > 0);
    const close = page.getByRole('button', { name: 'Close live preview', exact: true });
    const closeBounds = await close.boundingBox();
    assert.ok(closeBounds.x >= 0 && closeBounds.x + closeBounds.width <= width);
    await page.screenshot({ path: path.join(output, 'mobile-preview.png') });
    await close.click();
    await record({ check: 'mobile-preview-controls', width, bounds, closeBounds, openedAndClosed: true });
  }

  const original = await restaurant();
  for (const value of ['#12345', '#1234567', 'rgb(1)', 'hsl(1,2,3)']) {
    const revision = await page.evaluate(() => window.__themePreview?.controller.snapshot().revision ?? null);
    await page.evaluate(colour => { const c = structuredClone(window.__themeEditor.getConfig()); c.colors.brand.primary = colour; window.__themeEditor.edit(c); }, value);
    assert.equal(await currentColour(), '#4f46e5');
    assert.equal(await page.evaluate(() => window.__themePreview?.controller.snapshot().revision ?? null), revision);
    const response = await page.request.put(env.bases.recovery + '/api/restaurant/branding', { data: { brandColor: value, experienceConfig: { themeConfig: { colors: { brand: { primary: value } } } } } });
    assert.equal(response.status(), 400);
    assert.deepEqual((await restaurant()).experienceConfig, original.experienceConfig);
    await record({ check: 'invalid-colour', width, value, status: response.status(), draftAndDatabaseUnchanged: true });
  }

  // Failed deletion must retain the saved theme locally and on reopening.
  const savedTheme = { id: 'review-fixture', name: 'Review fixture', emoji: '', config: original.experienceConfig.themeConfig, createdAt: new Date().toISOString() };
  await env.database('recovery').collection('restaurants').updateOne({ _id: env.ids.restaurant }, { $set: { 'experienceConfig.customThemes': [savedTheme] } });
  await page.reload();
  await page.getByRole('button', { name: /My Themes/ }).click();
  await page.route('**/api/restaurant/branding', route => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ success: false, error: 'Synthetic save failure' }) }));
  const failed = page.waitForResponse(r => r.url().endsWith('/api/restaurant/branding') && r.status() === 503);
  await page.getByTitle('Delete theme').click();
  await failed;
  await page.waitForFunction(() => !document.querySelector('[title="Save Design"]').disabled);
  assert.equal(await page.getByText('Review fixture', { exact: true }).count(), 1);
  assert.equal((await restaurant()).experienceConfig.customThemes.length, 1);
  await page.unroute('**/api/restaurant/branding');
  const deleted = page.waitForResponse(r => r.url().endsWith('/api/restaurant/branding') && r.status() === 200);
  await page.getByTitle('Delete theme').click(); await deleted;
  await page.getByText('Review fixture', { exact: true }).waitFor({ state: 'hidden' });
  assert.equal((await restaurant()).experienceConfig.customThemes.length, 0);
  await record({ check: 'delete-failure-and-retry', width, retainedOnFailure: true, removedOnRetry: true });

  await page.getByRole('button', { name: 'Schedule', exact: true }).click();
  await page.getByText('Removed "Review fixture"', { exact: true }).waitFor({ state: 'hidden' });
  await page.getByText('Sample Highlighting', { exact: true }).scrollIntoViewIfNeeded();
  assert.ok(await page.getByText(/These use item names and random selection/).isVisible());
  await page.screenshot({ path: path.join(output, `sample-copy-${width}.png`) });
  const copyBounds = await page.getByText(/These use item names and random selection/).boundingBox();
  assert.ok(copyBounds.x >= 0 && copyBounds.x + copyBounds.width <= width);
  // Keyboard and route navigation after the failed-save path.
  await page.keyboard.press('Tab');
  assert.notEqual(await page.evaluate(() => document.activeElement.tagName), 'BODY');
  await page.goto(env.bases.recovery + '/');
  await page.getByText('Preview sample item badges. They do not use customer behaviour or sales data.', { exact: true }).first().scrollIntoViewIfNeeded();
  assert.equal(await page.getByText(/22% increase/).count(), 0);
  await page.screenshot({ path: path.join(output, `home-copy-${width}.png`) });
  assert.deepEqual(errors, []);
  await record({ check: 'copy-navigation-keyboard', width, runtimeErrors: errors, unsupportedTestimonialAbsent: true });
  await context.close();
}

async function main() {
  await fs.mkdir(output, { recursive: true });
  await recordSource(output);
  env = await createEnvironment(output, { portOffset: 100 });
  await env.database('recovery').collection('restaurants').updateOne({ _id: env.ids.restaurant }, { $set: { plan: 'pro' } });
  browser = await chromium.launch({ headless: true, executablePath: process.env.QA_CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const counts = async () => Object.fromEntries(await Promise.all(['users','restaurants','menuitems'].map(async name => [name, await env.database('recovery').collection(name).countDocuments()])));
  const before = await counts();
  const response = await fetch(env.bases.recovery + '/api/test-db');
  assert.equal(response.status, 404);
  assert.deepEqual(await counts(), before);
  await record({ check: 'removed-debug-endpoint', status: response.status, before, after: await counts() });
  for (const width of [1280, 390]) await editor(width);
  console.log(JSON.stringify({ output, checks: results.length, browser: browser.version(), pass: true }));
}
main().catch(async error => {
  await fs.writeFile(path.join(output, 'failure.txt'), error.stack);
  if (page && !page.isClosed()) await page.screenshot({ path: path.join(output, 'failure.png') }).catch(() => {});
  console.error(error); process.exitCode = 1;
}).finally(async () => { release?.(); await browser?.close(); await env?.close(); console.log(output); });

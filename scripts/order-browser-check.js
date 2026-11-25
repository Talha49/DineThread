// Diagnostic browser checks with a disposable MongoDB. No deployment URI is read.
const { MongoMemoryServer } = require("mongodb-memory-server");
const { MongoClient, ObjectId } = require("mongodb");
const { chromium } = require("playwright");
const { spawn } = require("node:child_process");
const { randomBytes } = require("node:crypto");
const fs = require("node:fs/promises");
const path = require("node:path");
const assert = require("node:assert/strict");

const root = path.resolve(__dirname, "..");
const output = path.join(root, "qa-results");
const base = "http://127.0.0.1:3038";
let mongo, client, app, browser, activePage;

async function run() {
    await fs.mkdir(output, { recursive: true });
    mongo = await MongoMemoryServer.create({ binary: { version: "8.0.17" } });
    const uri = mongo.getUri("dinethread_browser_checks");
    client = await MongoClient.connect(uri);
    const db = client.db();
    const restaurant = new ObjectId(), table = new ObjectId(), item = new ObjectId();
    await db.collection("restaurants").insertOne({ _id: restaurant, name: "Order QA Cafe", restaurantId: "order-qa", owner: new ObjectId(), brandColor: "#18181b", plan: "free", experienceConfig: {}, businessProfile: {} });
    await db.collection("tables").insertOne({ _id: table, restaurant, label: "Table 1", isActive: true });
    await db.collection("categories").insertOne({ restaurant, name: "Lunch", emoji: "", sortOrder: 0 });
    await db.collection("menuitems").insertOne({ _id: item, restaurant, name: "Test soup", description: "Synthetic test dish", category: "Lunch", price: 8, isAvailable: true, variants: [], modifiers: [] });
    app = spawn(process.execPath, [path.join(root, "node_modules/next/dist/bin/next"), "start", "-p", "3038", "-H", "127.0.0.1"], {
        cwd: root, windowsHide: true,
        env: { ...process.env, MONGODB_URI: uri, AUTH_SECRET: randomBytes(32).toString("hex"), ORDER_SUBMISSION_MODE: "recovery" },
        stdio: ["ignore", "pipe", "pipe"],
    });
    let appLog = "";
    app.stdout.on("data", (chunk) => { appLog += chunk; });
    app.stderr.on("data", (chunk) => { appLog += chunk; });
    for (let attempt = 0; attempt < 60; attempt++) {
        try { if ((await fetch(base + "/p/session")).ok) break; } catch {}
        if (attempt === 59) throw new Error("Local app did not start: " + appLog.slice(-1500));
        await new Promise((resolve) => setTimeout(resolve, 500));
    }
    browser = await chromium.launch({ headless: true, ...(process.env.QA_CHROME_PATH ? { executablePath: process.env.QA_CHROME_PATH } : {}) });
    const results = [];
    for (const device of [
        { name: "desktop", viewport: { width: 1440, height: 1000 } },
        { name: "mobile", viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" },
    ]) {
        await db.collection("menuitems").updateOne({ _id: item }, { $set: { price: 8, isAvailable: true } });
        const context = await browser.newContext(device);
        const page = await context.newPage();
        activePage = page;
        const errors = [];
        page.on("pageerror", (error) => errors.push(error.message));
        let dropped = false, accepted;
        await page.route("**/p/orders", async (route) => {
            if (dropped) return route.continue();
            const response = await route.fetch();
            assert.equal(response.status(), 201);
            accepted = await response.json();
            dropped = true;
            // This is a real committed insert, followed by a lost HTTP response.
            await route.abort("failed");
        });
        await page.goto(base + "/menu/order-qa");
        await page.getByRole("button", { name: "Open cart and order status" }).waitFor({ timeout: 30000 });
        await page.getByText("Test soup", { exact: true }).click();
        await page.getByRole("button", { name: /^Add -/ }).click();
        await page.getByRole("button", { name: "Open cart and order status" }).click();
        await page.getByRole("button", { name: "Table 1", exact: true }).click();
        await page.getByRole("button", { name: /^Place Order/ }).click();
        await page.getByRole("button", { name: "Retry same purchase", exact: true }).waitFor();
        assert.equal(await db.collection("orders").countDocuments({ _id: new ObjectId(accepted.order._id) }), 1);
        await page.screenshot({ path: path.join(output, `${device.name}-pending.png`) });
        await page.reload();
        await page.getByRole("button", { name: "Open cart and order status" }).click();
        await page.getByRole("button", { name: "Retry same purchase" }).waitFor();
        // Accepted retry must not be repriced or rejected by today's menu.
        await db.collection("menuitems").updateOne({ _id: item }, { $set: { price: 99, isAvailable: false } });
        await page.keyboard.press("Tab");
        await page.keyboard.press("Tab");
        assert.equal(await page.getByRole("button", { name: "Retry same purchase" }).evaluate((element) => element === document.activeElement), true);
        await page.keyboard.press("Enter");
        await page.getByRole("heading", { name: "Order Status", exact: true }).waitFor();
        const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("smart-menu-cart")).state);
        assert.equal(saved.orderId, accepted.order._id);
        assert.equal(saved.pendingPurchases["order-qa"], undefined);
        const current = await db.collection("orders").findOne({ _id: new ObjectId(saved.orderId) });
        assert.equal(current.total, 8);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
        await page.screenshot({ path: path.join(output, `${device.name}-recovered.png`) });
        const other = await browser.newContext();
        assert.equal((await other.request.get(`${base}/p/orders/${saved.orderId}`)).status(), 404);
        await other.close();
        assert.deepEqual(errors, []);
        await page.keyboard.press("Escape");
        assert.equal(await page.getByRole("button", { name: "Open cart and order status" }).evaluate((element) => element === document.activeElement), true);
        results.push({ device: device.name, committedId: saved.orderId, recoveredTotal: current.total, lostResponseAfterCommit: true, reloadRecovery: true, menuEditIgnoredOnReplay: true, otherSessionDenied: true, keyboardRetryAndFocusReturn: true, horizontalOverflow: false, pageErrors: errors });
        await context.close();
    }
    await fs.writeFile(path.join(output, "browser-results.json"), JSON.stringify({ diagnosticOnly: true, results }, null, 2));
    console.log(JSON.stringify(results, null, 2));
}

run().catch(async (error) => {
    console.error(error);
    if (activePage && !activePage.isClosed()) {
        console.error((await activePage.locator("body").innerText()).slice(-2500));
        await activePage.screenshot({ path: path.join(output, "failure.png") });
    }
    process.exitCode = 1;
}).finally(async () => {
    if (browser) await browser.close();
    if (app) app.kill();
    if (client) await client.close();
    if (mongo) await mongo.stop();
});

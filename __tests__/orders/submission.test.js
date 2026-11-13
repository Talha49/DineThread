/** @jest-environment node */
import mongoose from "mongoose";
import { randomUUID } from "node:crypto";
import { MongoMemoryServer } from "mongodb-memory-server";
import { NextRequest } from "next/server";
import Restaurant from "@/models/Restaurant";
import Table from "@/models/Table";
import MenuItem from "@/models/MenuItem";
import Order from "@/models/Order";
import { orderFingerprint, submitOrder } from "@/lib/order-submission";
import { POST } from "@/app/p/orders/route";
import { GET } from "@/app/p/orders/[id]/route";
import { POST as requestBill } from "@/app/p/orders/[id]/request-bill/route";
import { POST as startSession } from "@/app/p/session/route";
import { isSameOrigin, ORDER_SESSION_COOKIE, orderSessionHash } from "@/lib/order-session";

jest.mock("@/lib/mongodb", () => ({ __esModule: true, default: jest.fn(async () => mongoose.connection) }));

let server, restaurant, table, item, payload;
const session = "a".repeat(64);
const otherSession = "b".repeat(64);
function req(path, body, token = session) {
    return new NextRequest(`http://localhost${path}`, {
        method: body === undefined ? "GET" : "POST",
        headers: { "content-type": "application/json", ...(token ? { cookie: `${ORDER_SESSION_COOKIE}=${token}` } : {}) },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
}
const ownerHash = orderSessionHash(req("/"));
const send = (requestId = randomUUID(), data = payload, mode = "recovery") => submitOrder({ data, requestId, ownerHash, mode });

beforeAll(async () => {
    server = await MongoMemoryServer.create({ binary: { version: "8.0.17" } });
    await mongoose.connect(server.getUri("dinethread_order_tests"));
    restaurant = await Restaurant.create({ name: "Synthetic Cafe", restaurantId: "synthetic-cafe", owner: new mongoose.Types.ObjectId() });
    table = await Table.create({ restaurant: restaurant._id, label: "Table 1" });
    item = await MenuItem.create({ restaurant: restaurant._id, name: "Test soup", category: "Lunch", price: 8, variants: [{ name: "Large", price: 10 }], modifiers: [{ name: "Bread", price: 1 }, { name: "Herbs", price: 0.5 }] });
    payload = { restaurantId: restaurant.restaurantId, tableId: String(table._id), items: [{ menuItemId: String(item._id), variantId: String(item.variants[0]._id), modifierIds: item.modifiers.map((m) => String(m._id)), qty: 2 }] };
}, 600000); // First Windows binary download can take several minutes.

beforeEach(async () => {
    delete process.env.ORDER_SUBMISSION_MODE;
    await Order.deleteMany({});
    await MenuItem.updateOne({ _id: item._id }, { $set: { isAvailable: true, price: 8 } });
    await Table.updateOne({ _id: table._id }, { $set: { isActive: true } });
});
afterEach(() => jest.restoreAllMocks());
afterAll(async () => { await mongoose.disconnect(); if (server) await server.stop(); });

test("sequential retries return one accepted ID and total, without private fields", async () => {
    const id = randomUUID();
    const first = await send(id);
    const repeat = await send(id);
    expect(String(repeat.order._id)).toBe(String(first.order._id));
    expect(first.order.total).toBe(23);
    expect(repeat.order.total).toBe(23);
    expect(repeat.replayed).toBe(true);
    expect(first.order.ownerHash).toBeUndefined();
    expect(first.order.requestFingerprint).toBeUndefined();
    expect(await Order.countDocuments()).toBe(1);
});

test("five insert attempts genuinely overlap and MongoDB admits only one", async () => {
    const originalCreate = Order.create.bind(Order);
    let release;
    const gate = new Promise((resolve) => { release = resolve; });
    let arrived = 0;
    jest.spyOn(Order, "create").mockImplementation(async (...args) => {
        if (++arrived === 5) release();
        await gate;
        return originalCreate(...args);
    });
    const id = randomUUID();
    const results = await Promise.all(Array.from({ length: 5 }, () => send(id)));
    expect(arrived).toBe(5);
    expect(new Set(results.map((r) => String(r.order._id))).size).toBe(1);
    expect(results.filter((r) => !r.replayed)).toHaveLength(1);
    expect(await Order.countDocuments()).toBe(1);
}, 15000);

test("direct duplicate insertion is rejected by the real unique index", async () => {
    await send();
    const record = await Order.findOne().select("+ownerHash +requestFingerprint").lean();
    delete record._id;
    await expect(Order.collection.insertOne(record)).rejects.toMatchObject({ code: 11000 });
});

test("a genuine identical second purchase remains separate", async () => {
    const a = await send();
    const b = await send();
    expect(String(a.order._id)).not.toBe(String(b.order._id));
    expect(await Order.countDocuments()).toBe(2);
});

test("same identifier with changed quantity conflicts, preserving the accepted order", async () => {
    const id = randomUUID();
    await send(id);
    await expect(send(id, { ...payload, items: [{ ...payload.items[0], qty: 3 }] })).rejects.toMatchObject({ status: 409, code: "REQUEST_CONFLICT" });
    expect(await Order.countDocuments()).toBe(1);
});

test("object property order, modifier order and ID case do not alter meaning", () => {
    const reversed = { items: [{ qty: 2, modifierIds: [...payload.items[0].modifierIds].reverse(), variantId: payload.items[0].variantId.toUpperCase(), menuItemId: payload.items[0].menuItemId }], tableId: payload.tableId, restaurantId: payload.restaurantId.toUpperCase() };
    expect(orderFingerprint(reversed)).toBe(orderFingerprint(payload));
});

test("lost-confirmation replay ignores subsequent menu and table changes", async () => {
    const id = randomUUID();
    const accepted = await send(id); // Simulates the committed result the phone did not receive.
    await MenuItem.updateOne({ _id: item._id }, { $set: { isAvailable: false, price: 999 } });
    await Table.updateOne({ _id: table._id }, { $set: { isActive: false } });
    const recovered = await send(id);
    expect(String(recovered.order._id)).toBe(String(accepted.order._id));
    expect(recovered.order.total).toBe(23);
    await expect(send()).rejects.toMatchObject({ code: "INVALID_TABLE" });
});

test("session ownership applies to replay, reads and bill requests", async () => {
    const id = randomUUID();
    const accepted = await send(id);
    await expect(submitOrder({ data: payload, requestId: id, ownerHash: orderSessionHash(req("/", undefined, otherSession)) })).rejects.toMatchObject({ status: 403 });
    const path = `/p/orders/${accepted.order._id}`;
    const params = { params: Promise.resolve({ id: String(accepted.order._id) }) };
    expect((await GET(req(path, undefined, otherSession), params)).status).toBe(404);
    expect((await requestBill(req(`${path}/request-bill`, {}, otherSession), params)).status).toBe(404);
    expect((await GET(req(path), params)).status).toBe(200);
    expect((await requestBill(req(`${path}/request-bill`, {}), params)).status).toBe(200);
});

test("HTTP rejects missing sessions, malformed identifiers and duplicate modifiers", async () => {
    expect((await POST(req("/p/orders", { ...payload, requestId: randomUUID() }, null))).status).toBe(401);
    expect((await POST(req("/p/orders", payload))).status).toBe(400);
    const duplicate = { ...payload, items: [{ ...payload.items[0], modifierIds: [payload.items[0].modifierIds[0], payload.items[0].modifierIds[0]] }], requestId: randomUUID() };
    expect((await POST(req("/p/orders", duplicate))).status).toBe(400);
    expect(await Order.countDocuments()).toBe(0);
});

test("baseline uses the same pricing and ownership but permits valid retries", async () => {
    const id = randomUUID();
    const first = await send(id, payload, "baseline");
    const second = await send(id, payload, "baseline");
    expect(first.order.total).toBe(second.order.total);
    expect(String(first.order._id)).not.toBe(String(second.order._id));
    expect(await Order.countDocuments()).toBe(2);
});

test("session endpoint issues an HttpOnly cookie without returning its value in JSON", async () => {
    const response = await startSession(req("/p/session", {}, null));
    expect(response.headers.get("set-cookie")).toContain("HttpOnly");
    expect(await response.json()).toEqual({ active: true, mode: "recovery" });
});

test("same-origin check uses the public host, and rejects foreign or null origins", () => {
    const request = (origin) => new NextRequest("http://localhost:3038/p/session", { headers: { host: "127.0.0.1:3038", origin } });
    expect(isSameOrigin(request("http://127.0.0.1:3038"))).toBe(true);
    expect(isSameOrigin(request("https://other.example"))).toBe(false);
    expect(isSameOrigin(request("null"))).toBe(false);
});

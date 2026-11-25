/** @jest-environment node */
import mongoose from 'mongoose';
import { randomUUID } from 'node:crypto';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Restaurant from '@/models/Restaurant';
import Table from '@/models/Table';
import MenuItem from '@/models/MenuItem';
import Order from '@/models/Order';
import { submitOrder, acceptedOrderFilter } from '@/lib/order-submission';
import { MenuItemSchema, PlaceOrderSchema } from '@/lib/validations';
import { PUT as editMenu } from '@/app/api/menu/[id]/route';
import { verifyJWT } from '@/lib/jwt';
jest.mock('@/lib/mongodb', () => ({ __esModule: true, default: jest.fn(async () => mongoose.connection) }));
jest.mock('@/lib/jwt', () => ({ verifyJWT: jest.fn() }));
jest.mock('next/headers', () => ({ cookies: jest.fn(async () => ({ get: () => ({ value: 'synthetic-token' }) })) }));

let mongo, restaurant, table, item, payload, original;
const send = (data = payload, requestId = randomUUID()) => submitOrder({ data, requestId, ownerHash: 'synthetic-customer' });
beforeAll(async () => {
    mongo = await MongoMemoryServer.create({ binary: { version: '8.0.17' } });
    await mongoose.connect(mongo.getUri('catalogue_tests'));
    restaurant = await Restaurant.create({ name: 'Fixture Cafe', restaurantId: 'fixture-cafe', owner: new mongoose.Types.ObjectId() });
    table = await Table.create({ restaurant: restaurant._id, label: 'Table 1' });
    item = await MenuItem.create({ restaurant: restaurant._id, name: 'Soup', category: 'Lunch', price: 8, variants: [{ name: 'Large', price: 10 }], modifiers: [{ name: 'Bread', price: 1.25 }] });
    original = item.toObject();
    payload = { restaurantId: restaurant.restaurantId, tableId: String(table._id), items: [{ menuItemId: String(item._id), variantId: String(item.variants[0]._id), modifierIds: [String(item.modifiers[0]._id)], qty: 2, displayed: { selectionPricePence: 1000, modifiers: [{ id: String(item.modifiers[0]._id), pricePence: 125 }] } }] };
}, 60000);
beforeEach(async () => { delete process.env.CATALOGUE_MODE; await Order.deleteMany({}); await MenuItem.replaceOne({ _id: item._id }, original); });
afterEach(() => jest.restoreAllMocks());
afterAll(async () => { delete process.env.CATALOGUE_MODE; await mongoose.disconnect(); await mongo.stop(); });

test('unchanged selected facts accept the independently expected £22.50', async () => {
    expect((await send()).order.total).toBe(22.5);
});
test.each([12, 9])('changed selected price %s requires fresh confirmation and rechecks it', async price => {
    await MenuItem.updateOne({ _id: item._id }, { $set: { 'variants.0.price': price } });
    const id = randomUUID(); const rejected = await send(payload, id);
    expect(rejected).toMatchObject({ outcome: 'rejected', code: 'MENU_CHANGED' });
    expect(await Order.countDocuments(acceptedOrderFilter)).toBe(0);
    const confirmed = structuredClone(payload); confirmed.items[0].displayed.selectionPricePence = price * 100;
    expect((await send(confirmed)).order.total).toBe((price + 1.25) * 2);
    expect(await send(payload, id)).toMatchObject({ outcome: 'rejected', replayed: true });
});
test('a second price change is not silently accepted during confirmation', async () => {
    await MenuItem.updateOne({ _id: item._id }, { $set: { 'variants.0.price': 12 } });
    const first = await send();
    const confirmed = structuredClone(payload); confirmed.items[0].displayed = first.details.quotes[0].displayed;
    await MenuItem.updateOne({ _id: item._id }, { $set: { 'variants.0.price': 13 } });
    expect(await send(confirmed)).toMatchObject({ outcome: 'rejected', code: 'MENU_CHANGED' });
    expect(await Order.countDocuments(acceptedOrderFilter)).toBe(0);
});
test('offsetting component changes still require confirmation despite unchanged total', async () => {
    await MenuItem.updateOne({ _id: item._id }, { $set: { 'variants.0.price': 10.25, 'modifiers.0.price': 1 } });
    expect(await send()).toMatchObject({ code: 'MENU_CHANGED' });
});
test('description, unselected base price and unselected options do not conflict', async () => {
    await MenuItem.updateOne({ _id: item._id }, { $set: { description: 'New words', price: 99 }, $push: { modifiers: { name: 'Unselected', price: 50 } } });
    expect((await send()).order.total).toBe(22.5);
});
test.each([{ isAvailable: false }, { modifiers: [] }, { variants: [] }])('deleted or unavailable selection requires correction: %p', async changes => {
    await MenuItem.updateOne({ _id: item._id }, { $set: changes });
    expect(await send()).toMatchObject({ outcome: 'rejected', code: 'INVALID_MENU' });
});
test('missing required variant cannot bypass size selection', async () => {
    const altered = structuredClone(payload); delete altered.items[0].variantId;
    expect(await send(altered)).toMatchObject({ code: 'INVALID_MENU' });
});
test('accepted replay keeps its snapshot after menu deletion', async () => {
    const id = randomUUID(); const first = await send(payload, id);
    await MenuItem.updateOne({ _id: item._id }, { $set: { isAvailable: false, variants: [], modifiers: [] } });
    const replay = await send(payload, id);
    expect(String(replay.order._id)).toBe(String(first.order._id)); expect(replay.order.total).toBe(22.5);
});
test('automatic repricing accepts the authoritative current price, not client total', async () => {
    process.env.CATALOGUE_MODE = 'automatic';
    await MenuItem.updateOne({ _id: item._id }, { $set: { 'variants.0.price': 12 } });
    expect((await send({ ...payload, total: 0 })).order.total).toBe(26.5);
});
test('a forged displayed price cannot reduce an accepted total', async () => {
    const altered = structuredClone(payload); altered.items[0].displayed.selectionPricePence = 0;
    expect(await send(altered)).toMatchObject({ code: 'MENU_CHANGED' });
});
test('menu edit preserves option identities and omitted arrays', async () => {
    verifyJWT.mockResolvedValue({ id: String(restaurant.owner) });
    const response = await editMenu(new Request('http://localhost/api/menu/' + item._id, { method: 'PUT', body: JSON.stringify({ description: 'Updated' }) }), { params: Promise.resolve({ id: String(item._id) }) });
    expect(response.status).toBe(200);
    const saved = await MenuItem.findById(item._id);
    expect(String(saved.variants[0]._id)).toBe(String(item.variants[0]._id));
    expect(String(saved.modifiers[0]._id)).toBe(String(item.modifiers[0]._id));
    const full = MenuItemSchema.partial().parse({ variants: [{ _id: String(item.variants[0]._id), name: 'Large', price: 10 }] });
    expect(full.variants[0]._id).toBe(String(item.variants[0]._id));
    expect(PlaceOrderSchema.safeParse({ ...payload, items: [{ ...payload.items[0], menuItemId: 'bad' }] }).success).toBe(false);
});
test('validation-to-insert interval is observable: later edit does not reserve stock', async () => {
    const insert = Order.create.bind(Order);
    jest.spyOn(Order, 'create').mockImplementationOnce(async data => {
        await MenuItem.updateOne({ _id: item._id }, { $set: { isAvailable: false } });
        return insert(data);
    });
    expect((await send()).order.total).toBe(22.5);
    expect(await send()).toMatchObject({ code: 'INVALID_MENU' });
});

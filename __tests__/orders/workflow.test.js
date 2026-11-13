/** @jest-environment node */
import mongoose from 'mongoose';
import { randomUUID } from 'node:crypto';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Order from '@/models/Order';
import Table from '@/models/Table';
import { applyWorkflow } from '@/lib/order-workflow';
let mongo, order, restaurant, table;
const states = ['placed', 'preparing', 'ready', 'served', 'paid'];
const act = (status, expectedVersion = 0, options = {}) => applyWorkflow({ scope: { _id: order._id, restaurant }, type: 'status', status, expectedVersion, actionId: randomUUID(), actor: 'synthetic-staff', ...options });
beforeAll(async () => { mongo = await MongoMemoryServer.create({ binary: { version: '8.0.17' } }); await mongoose.connect(mongo.getUri('workflow_tests')); restaurant = new mongoose.Types.ObjectId(); table = await Table.create({ restaurant, label: 'Table 1' }); }, 60000);
beforeEach(async () => { await Order.deleteMany({}); order = await Order.create({ restaurant, table: table._id, total: 22.5, ownerHash: 'customer', items: [{ menuItem: new mongoose.Types.ObjectId(), name: 'Fixture dish', qty: 2, unitPrice: 11.25, lineTotal: 22.5 }] }); });
afterEach(() => jest.restoreAllMocks());
afterAll(async () => { await mongoose.disconnect(); await mongo.stop(); });
test.each(states.flatMap(from => states.map(to => [from, to])))('transition %s → %s follows the declared sequence', async (from, to) => {
    await Order.updateOne({ _id: order._id }, { $set: { status: from } });
    const allowed = states.indexOf(to) === states.indexOf(from) + 1;
    if (allowed) { const result = await act(to); expect(result.order.status).toBe(to); expect(result.order.workflowVersion).toBe(1); }
    else await expect(act(to)).rejects.toMatchObject({ status: 409 });
    const saved = await Order.findById(order._id).select('+workflowHistory');
    expect(saved.status).toBe(allowed ? to : from); expect(saved.workflowHistory).toHaveLength(allowed ? 1 : 0);
});
test('two genuinely overlapping updates from one displayed version accept only one', async () => {
    const original = Order.findOneAndUpdate.bind(Order); let arrivals = 0, release;
    const barrier = new Promise(resolve => { release = resolve; });
    jest.spyOn(Order, 'findOneAndUpdate').mockImplementation((...args) => {
        if (++arrivals === 2) release();
        return { select: () => ({ populate: async () => { await barrier; return original(...args).select('+workflowHistory').populate('table', 'label'); } }) };
    });
    const results = await Promise.allSettled([act('preparing'), act('preparing')]);
    expect(arrivals).toBe(2); expect(results.filter(r => r.status === 'fulfilled')).toHaveLength(1);
    const saved = await Order.findById(order._id).select('+workflowHistory');
    expect(saved.workflowVersion).toBe(1); expect(saved.workflowHistory).toHaveLength(1);
});
test('a stale command cannot overwrite a newer ready state', async () => {
    await act('preparing'); await act('ready', 1);
    await expect(act('preparing', 0)).rejects.toMatchObject({ code: 'VERSION_CONFLICT' });
    expect((await Order.findById(order._id)).status).toBe('ready');
});
test('bill updates share the version contract and preserve food state', async () => {
    const bill = version => applyWorkflow({ scope: { _id: order._id, ownerHash: 'customer' }, type: 'bill', expectedVersion: version, actionId: randomUUID(), actor: 'customer' });
    await act('preparing'); await expect(bill(0)).rejects.toMatchObject({ code: 'VERSION_CONFLICT' });
    const accepted = await bill(1); expect(accepted.order.status).toBe('preparing'); expect(accepted.order.billRequested).toBe(true);
    await expect(act('ready', 1)).rejects.toMatchObject({ code: 'VERSION_CONFLICT' });
    expect((await act('ready', 2)).order.status).toBe('ready');
});
test('payment acknowledgement recovery appends one event and preserves accepted total', async () => {
    await act('preparing'); await act('ready', 1); await act('served', 2);
    const actionId = randomUUID(); const first = await act('paid', 3, { actionId }); const again = await act('paid', 3, { actionId });
    expect(first.replayed).toBe(false); expect(again.replayed).toBe(true); expect(again.action.version).toBe(4);
    expect(again.order.total).toBe(22.5); expect(again.order.workflowHistory).toBeUndefined();
    const saved = await Order.findById(order._id).select('+workflowHistory');
    expect(saved.workflowHistory.filter(e => e.to === 'paid')).toHaveLength(1);
    await expect(act('served', 3, { actionId })).rejects.toMatchObject({ code: 'ACTION_CONFLICT' });
    await expect(applyWorkflow({ scope: { _id: order._id }, actor: 'customer', type: 'bill', actionId: randomUUID(), expectedVersion: 4 })).rejects.toMatchObject({ code: 'VERSION_CONFLICT' });
});
test('A remains unconditional while its event log records actual prior state', async () => {
    await act('preparing', 0, { mode: 'unconditional' }); await act('ready', 1, { mode: 'unconditional' });
    await act('preparing', 0, { mode: 'unconditional' });
    const saved = await Order.findById(order._id).select('+workflowHistory');
    expect(saved.status).toBe('preparing'); expect(saved.workflowHistory[2]).toMatchObject({ from: 'ready', to: 'preparing', beforeVersion: 2, version: 3, expectedVersion: 0 });
});
test('another restaurant or customer cannot update the order', async () => {
    await expect(act('preparing', 0, { scope: { _id: order._id, restaurant: new mongoose.Types.ObjectId() } })).rejects.toMatchObject({ status: 404 });
    await expect(applyWorkflow({ scope: { _id: order._id, ownerHash: 'other' }, actor: 'other', type: 'bill', actionId: randomUUID(), expectedVersion: 0 })).rejects.toMatchObject({ status: 404 });
});

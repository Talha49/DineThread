import { pendingStaffActions, sendStaffAction } from '@/lib/staff-action';
const order = { _id: 'fixture-order', workflowVersion: 3 };
beforeEach(() => { sessionStorage.clear(); global.fetch = jest.fn(); if (!AbortSignal.timeout) AbortSignal.timeout = () => new AbortController().signal; });
test('lost payment acknowledgement keeps the same command through a reload', async () => {
    fetch.mockRejectedValueOnce(new TypeError('offline'));
    await expect(sendStaffAction(order, 'paid')).rejects.toThrow('offline');
    const first = JSON.parse(fetch.mock.calls[0][1].body);
    expect(pendingStaffActions()[order._id]).toEqual(first);
    fetch.mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ action: { id: first.actionId }, order: { status: 'paid' } }) });
    await sendStaffAction({ _id: order._id }, 'paid');
    expect(JSON.parse(fetch.mock.calls[1][1].body)).toEqual(first); expect(pendingStaffActions()).toEqual({});
});
test('a conflict discards the stale command; a fresh decision uses the refreshed version', async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 409, json: async () => ({ message: 'Refresh first' }) });
    await expect(sendStaffAction(order, 'paid')).rejects.toThrow('Refresh first');
    const old = JSON.parse(fetch.mock.calls[0][1].body); expect(pendingStaffActions()).toEqual({});
    fetch.mockImplementationOnce(async (_url, options) => ({ ok: true, status: 200, json: async () => ({ action: { id: JSON.parse(options.body).actionId } }) }));
    await sendStaffAction({ ...order, workflowVersion: 4 }, 'paid');
    const next = JSON.parse(fetch.mock.calls[1][1].body); expect(next.actionId).not.toBe(old.actionId); expect(next.expectedVersion).toBe(4);
});
test('malformed success does not discard an uncertain command', async () => {
    fetch.mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({}) });
    await expect(sendStaffAction(order, 'paid')).rejects.toThrow('did not match');
    expect(pendingStaffActions()[order._id]).toBeDefined();
});

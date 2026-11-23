const {observeDeadline} = require('../../scripts/order-api-experiment');

test('keeps late orders in the evidence and counts only insertions by the deadline', () => {
    const inserted = new Map([['on-time', 1500], ['late', 1501]]);
    const observe = ids => observeDeadline(ids, inserted, 1000, 500);
    expect(observe(['on-time']).storedByDeadline).toBe(true);
    expect(observe(['late'])).toEqual({sentAtMs: 1000, deadlineMs: 1500, insertedAtMs: [1501], storedByDeadline: false});
    expect(observe(['late', 'on-time']).storedByDeadline).toBe(true);
    expect(observe([]).storedByDeadline).toBe(false);
    expect(() => observe(['unverified'])).toThrow('Missing database insert timestamp');
});

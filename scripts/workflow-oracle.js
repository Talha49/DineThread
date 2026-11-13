// Independent history checker for the signed five-state model.
const sequence = ['placed', 'preparing', 'ready', 'served', 'paid'];
function check(record) {
    let state = record.initial.status, version = record.initial.version, bill = false;
    const defects = [], events = record.order.workflowHistory || [], ids = new Set();
    for (const event of events) {
        if (ids.has(event.actionId)) defects.push('repeated-accepted-action'); ids.add(event.actionId);
        if (event.from !== state || event.beforeVersion !== version || event.version !== version + 1) defects.push('broken-history');
        if (event.expectedVersion !== version) defects.push('stale-write');
        if (event.type === 'bill') {
            if (state === 'paid' || bill || event.to !== state) defects.push('invalid-bill-transition');
            bill = true;
        } else if (sequence.indexOf(event.to) !== sequence.indexOf(state) + 1) defects.push('invalid-status-transition');
        state = event.to; version = event.version;
        if (event.totalPence !== 2250) defects.push('changed-accepted-total');
    }
    if (record.order.status !== state || record.order.workflowVersion !== version || record.order.billRequested !== bill) defects.push('final-state-mismatch');
    if (Math.round(record.order.total * 100) !== 2250) defects.push('wrong-total');
    for (const attempt of record.attempts) {
        if (attempt.status === 200 && !ids.has(attempt.body.action?.id)) defects.push('missing-accepted-event');
        if (attempt.validSequential && attempt.status !== 200) defects.push('valid-sequential-rejected');
        if (!attempt.status || attempt.status >= 500) defects.push('unresolved-response');
    }
    return [...new Set(defects)];
}
module.exports = { check };

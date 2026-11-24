import { createHash } from 'node:crypto';
import Order from '@/models/Order';
import { acceptedOrderFilter, publicOrder, validRequestId } from '@/lib/order-submission';

export const previousState = { preparing: 'placed', ready: 'preparing', served: 'ready', paid: 'served' };
export class WorkflowError extends Error {
    constructor(message, status, code) { super(message); this.status = status; this.code = code; }
}
export function workflowMode() {
    const local = /^mongodb:\/\/(127\.0\.0\.1|localhost):\d+\//.test(process.env.MONGODB_URI || '');
    return local && process.env.ORDER_RESEARCH_ENABLED === '1' && process.env.WORKFLOW_MODE === 'unconditional' ? 'unconditional' : 'conditional';
}

function recovered(order, actionId, fingerprint) {
    const event = order.workflowHistory?.find(entry => entry.actionId === actionId);
    if (!event) return null;
    if (event.fingerprint !== fingerprint) throw new WorkflowError('This action identifier has different details.', 409, 'ACTION_CONFLICT');
    return { order: publicOrder(order), action: { id: event.actionId, version: event.version, status: event.to, billRequested: event.billRequested, at: event.at }, replayed: true };
}

export async function applyWorkflow({ scope, actionId, expectedVersion, type, status, actor, mode = workflowMode() }) {
    if (!validRequestId(actionId) || !Number.isSafeInteger(expectedVersion) || expectedVersion < 0 || !['status', 'bill'].includes(type) || (type === 'status' && !['placed', 'preparing', 'ready', 'served', 'paid'].includes(status))) {
        throw new WorkflowError('Invalid action or displayed version.', 400, 'INVALID_ACTION');
    }
    actionId = actionId.toLowerCase();
    const fingerprint = createHash('sha256').update(JSON.stringify({ actor, type, status: type === 'status' ? status : null, expectedVersion })).digest('hex');
    const filter = { ...scope, ...acceptedOrderFilter };
    const read = () => Order.findOne(filter).select('+workflowHistory').populate('table', 'label');
    const existing = await read();
    if (!existing) throw new WorkflowError('Order not found.', 404, 'NOT_FOUND');
    const replay = recovered(existing, actionId, fingerprint);
    if (replay) return replay;

    const guard = { ...filter, 'workflowHistory.actionId': { $ne: actionId } };
    if (mode === 'conditional') {
        if (type === 'status' && !previousState[status]) throw new WorkflowError('That transition is not permitted.', 409, 'INVALID_TRANSITION');
        guard.status = type === 'status' ? previousState[status] : { $ne: 'paid' };
        if (type === 'bill') guard.billRequested = { $ne: true };
        if (expectedVersion === 0) guard.$or = [{ workflowVersion: 0 }, { workflowVersion: { $exists: false } }];
        else guard.workflowVersion = expectedVersion;
    }
    const version = { $add: [{ $ifNull: ['$workflowVersion', 0] }, 1] }, now = new Date();
    // Pipeline expressions read the actual pre-update state, including in A.
    // State, version and the accepted event are written in one document update.
    const event = {
        actionId: { $literal: actionId }, fingerprint: { $literal: fingerprint },
        actor: { $literal: actor }, type: { $literal: type }, from: '$status',
        to: type === 'status' ? { $literal: status } : '$status',
        beforeVersion: { $ifNull: ['$workflowVersion', 0] }, version,
        expectedVersion, billRequested: type === 'bill' ? true : '$billRequested',
        totalPence: { $round: [{ $multiply: ['$total', 100] }, 0] }, at: now,
    };
    const updated = await Order.findOneAndUpdate(guard, [{ $set: {
        status: type === 'status' ? { $literal: status } : '$status',
        billRequested: type === 'bill' ? true : '$billRequested',
        workflowVersion: version,
        workflowHistory: { $concatArrays: [{ $ifNull: ['$workflowHistory', []] }, [event]] },
        statusUpdatedAt: type === 'status' ? now : '$statusUpdatedAt', updatedAt: now,
    } }], { new: true, updatePipeline: true, timestamps: false }).select('+workflowHistory').populate('table', 'label');
    if (updated) return { ...recovered(updated, actionId, fingerprint), replayed: false };
    const latest = await read();
    if (!latest) throw new WorkflowError('Order not found.', 404, 'NOT_FOUND');
    const winner = recovered(latest, actionId, fingerprint);
    if (winner) return winner;
    throw new WorkflowError('The order changed or this action is no longer allowed. Refresh and choose the next action again.', 409, 'VERSION_CONFLICT');
}

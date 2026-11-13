const key = 'dinethread-staff-actions';
export function pendingStaffActions() { return JSON.parse(sessionStorage.getItem(key) || '{}'); }
function save(actions) { sessionStorage.setItem(key, JSON.stringify(actions)); }

export async function sendStaffAction(order, status) {
    const actions = pendingStaffActions();
    const command = actions[order._id] || { actionId: crypto.randomUUID(), expectedVersion: order.workflowVersion || 0, status };
    actions[order._id] = command;
    save(actions); // If storage fails, do not send an action we cannot recover.
    const response = await fetch(`/api/orders/${order._id}`, {
        method: 'PATCH', credentials: 'same-origin', signal: AbortSignal.timeout(15000),
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(command),
    });
    const result = await response.json();
    if (response.ok && result.action?.id !== command.actionId) throw new Error('The action response did not match. Retry the saved action to check its outcome.');
    if (response.ok || (response.status >= 400 && response.status < 500)) {
        const current = pendingStaffActions();
        if (current[order._id]?.actionId === command.actionId) { delete current[order._id]; save(current); }
    }
    if (!response.ok) throw new Error(result.message || 'The action was not confirmed. Refresh and check the order.');
    return result;
}

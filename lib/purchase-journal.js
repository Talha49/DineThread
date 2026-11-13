// Keep the purchase receipt separate: another tab's editable cart must never
// overwrite the identifier needed to recover an already-submitted purchase.
export const purchaseKey = (restaurantId) => `dinethread-purchase:${restaurantId}`;

export function readPurchaseJournal(restaurantId) {
    const raw = localStorage.getItem(purchaseKey(restaurantId));
    if (raw === null) return null;
    const value = JSON.parse(raw);
    if (value?.version !== 1) throw new Error("Saved purchase data could not be read. Please ask staff to check your order.");
    return value;
}

export function writePurchaseJournal(restaurantId, value) {
    const record = JSON.stringify({ version: 1, ...value });
    localStorage.setItem(purchaseKey(restaurantId), record);
    if (localStorage.getItem(purchaseKey(restaurantId)) !== record) throw new Error("Your browser could not save this purchase. Enable browser storage before ordering.");
}

export function syncPurchaseJournal(restaurantId, store) {
    const value = readPurchaseJournal(restaurantId);
    if (value) store.getState().syncPurchase(restaurantId, value);
    return value;
}

export function withPurchaseLock(action) {
    if (!navigator.locks?.request) throw new Error("Safe ordering needs an up-to-date browser and a secure connection. Please ask staff to take your order.");
    // Global within this origin, also serialising first-session cookie creation.
    return navigator.locks.request("dinethread-purchase", { ifAvailable: true }, (lock) => {
        if (!lock) throw new Error("Another tab is checking this purchase. Wait for its confirmation, then reopen the cart.");
        return action();
    });
}

import { pendingPurchaseFor } from "@/hooks/use-cart-store";
import { readPurchaseJournal, writePurchaseJournal, syncPurchaseJournal, withPurchaseLock } from "@/lib/purchase-journal";

async function requestJson(url, options = {}) {
    const response = await fetch(url, { ...options, credentials: "same-origin", signal: AbortSignal.timeout(15000) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "The order could not be confirmed.");
    return data;
}

function savedPurchase(restaurantId, store) {
    let journal = syncPurchaseJournal(restaurantId, store);
    if (!journal) {
        // Upgrade a pending purchase from the first recovery implementation.
        journal = { pending: pendingPurchaseFor(store.getState(), restaurantId) || null, orderId: store.getState().confirmedOrders[restaurantId] || null };
        writePurchaseJournal(restaurantId, journal);
    }
    return journal;
}

function finishPurchase(restaurantId, pending, result, store) {
    if (result.outcome === "rejected" || result.outcome === "cancelled") {
        if (result.requestId !== pending.requestId) throw new Error("The purchase response did not match. Keep this purchase and contact staff.");
        // A durable terminal receipt prevents any delayed copy being accepted.
        writePurchaseJournal(restaurantId, { pending: null, orderId: null });
        syncPurchaseJournal(restaurantId, store);
        return result;
    }
    if (!result.order?._id || !Number.isFinite(result.order.total)) throw new Error("The order response was incomplete. Keep this purchase and try again.");
    writePurchaseJournal(restaurantId, { pending: null, orderId: result.order._id });
    store.getState().confirmPurchase(restaurantId, pending.requestId, result.order._id);
    return result;
}

export async function sendCustomerOrder({ restaurantId, tableId, items, store }) {
    return withPurchaseLock(async () => {
        let { pending, orderId } = savedPurchase(restaurantId, store);
        if (orderId) return requestJson(`/p/orders/${orderId}`);
        const session = await requestJson("/p/session", { method: pending ? "GET" : "POST" });
        if (!session.active) throw new Error("This order belongs to your earlier browser session. Please ask staff to check it before placing another order.");
        if (pending && session.mode !== "recovery") throw new Error("Order recovery is temporarily unavailable. Keep this order and contact staff.");
        if (!pending) {
            const payload = {
                restaurantId, tableId,
                items: items.map((line) => ({ menuItemId: line.menuItemId, variantId: line.variantId, modifierIds: line.modifierIds ? [...line.modifierIds] : [], qty: line.qty })),
            };
            if (session.mode !== "recovery") {
                const result = await requestJson("/p/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
                writePurchaseJournal(restaurantId, { pending: null, orderId: result.order._id });
                store.getState().setOrderId(result.order._id);
                return result;
            }
            pending = { requestId: crypto.randomUUID(), payload, cartItems: JSON.parse(JSON.stringify(items)) };
            writePurchaseJournal(restaurantId, { pending, orderId: null });
            store.getState().beginPurchase(restaurantId, pending);
        }
        if (readPurchaseJournal(restaurantId)?.pending?.requestId !== pending.requestId) throw new Error("Saved purchase could not be verified. Please ask staff to check your order.");
        const result = await requestJson("/p/orders", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...pending.payload, requestId: pending.requestId }),
        });
        return finishPurchase(restaurantId, pending, result, store);
    });
}

export async function cancelPendingPurchase({ restaurantId, store }) {
    return withPurchaseLock(async () => {
        const { pending, orderId } = savedPurchase(restaurantId, store);
        if (orderId) return requestJson(`/p/orders/${orderId}`);
        if (!pending) return { outcome: "cancelled", message: "There is no pending purchase." };
        const session = await requestJson("/p/session");
        if (!session.active) throw new Error("Your earlier browser session is missing. Ask staff to check the purchase.");
        const result = await requestJson("/p/orders/cancel", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...pending.payload, requestId: pending.requestId }) });
        return finishPurchase(restaurantId, pending, result, store);
    });
}

export async function startNewCustomerOrder({ restaurantId, store }) {
    return withPurchaseLock(async () => {
        if (savedPurchase(restaurantId, store).pending) throw new Error("Resolve the pending purchase first.");
        writePurchaseJournal(restaurantId, { pending: null, orderId: null });
        store.getState().leaveOrder();
    });
}

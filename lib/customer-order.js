import { pendingPurchaseFor } from "@/hooks/use-cart-store";

// A client timeout is an unknown outcome, not proof that the server rejected
// the purchase. The caller keeps the pending snapshot on every uncertain exit.
async function requestJson(url, options = {}) {
    const response = await fetch(url, { ...options, credentials: "same-origin", signal: AbortSignal.timeout(15000) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "The order could not be confirmed.");
    return data;
}

export async function sendCustomerOrder({ restaurantId, tableId, items, store }) {
    let pending = pendingPurchaseFor(store.getState(), restaurantId);
    const session = await requestJson("/p/session", { method: pending ? "GET" : "POST" });
    if (!session.active) throw new Error("This order belongs to your earlier browser session. Please ask staff to check it before placing another order.");
    if (pending && session.mode !== "recovery") throw new Error("Order recovery is temporarily unavailable. Keep this order and contact staff.");
    if (!pending) {
        const payload = {
            restaurantId, tableId,
            items: items.map((line) => ({ menuItemId: line.menuItemId, variantId: line.variantId, modifierIds: line.modifierIds ? [...line.modifierIds] : [], qty: line.qty })),
        };
        if (session.mode === "recovery") {
            pending = store.getState().beginPurchase(restaurantId, { requestId: crypto.randomUUID(), payload, cartItems: JSON.parse(JSON.stringify(items)) });
        } else {
            const result = await requestJson("/p/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
            store.getState().setOrderId(result.order._id);
            return result;
        }
    }
    // Check this on retries too: a failed initial storage write must never
    // become a later network submission with only an in-memory identifier.
    const saved = JSON.parse(localStorage.getItem("smart-menu-cart"));
    if (saved?.state?.pendingPurchases?.[restaurantId]?.requestId !== pending.requestId) {
        throw new Error("Your browser could not save this purchase. Enable browser storage before ordering.");
    }
    const result = await requestJson("/p/orders", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...pending.payload, requestId: pending.requestId }),
    });
    if (!result.order?._id || !Number.isFinite(result.order.total)) throw new Error("The order response was incomplete. Keep this purchase and try again.");
    store.getState().confirmPurchase(restaurantId, pending.requestId, result.order._id);
    return result;
}

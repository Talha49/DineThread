import { create } from "zustand";
import { persist } from "zustand/middleware";
import { selectionKey } from "@/lib/catalogue-policy";

export function pendingPurchaseFor(state, restaurantId) {
    return Object.hasOwn(state.pendingPurchases, restaurantId) ? state.pendingPurchases[restaurantId] : undefined;
}

// Cart is scoped to whichever restaurant slug is currently active - if a
// customer previously ordered at a different restaurant in this browser,
// switching restaurants must not carry that cart/table/order over.
export const useCartStore = create(
    persist(
        (set, get) => ({
            restaurantId: null,
            tableId: null,
            items: [], // { key, menuItemId, name, variantName, modifierNames, unitPrice, qty }
            orderId: null,
            // Pending purchases survive navigation; an editable cart is never
            // used to reconstruct an uncertain submission.
            pendingPurchases: {},
            confirmedOrders: {},
            needsPriceConfirmation: false,

            ensureRestaurant: (restaurantId) => {
                if (get().restaurantId !== restaurantId) {
                    const orders = get().confirmedOrders;
                    set({ restaurantId, tableId: null, items: [], needsPriceConfirmation: false, orderId: Object.hasOwn(orders, restaurantId) ? orders[restaurantId] : null });
                }
            },

            setTable: (tableId) => set({ tableId }),

            addItem: (line) => {
                // Same item + same variant/modifiers combo just bumps quantity.
                const key = selectionKey(line);
                set((state) => {
                    const existing = state.items.find((i) => i.key === key);
                    if (existing) {
                        return {
                            items: state.items.map((i) => (i.key === key ? { ...i, qty: i.qty + line.qty } : i)),
                        };
                    }
                    return { items: [...state.items, { ...line, key }] };
                });
            },

            updateQty: (key, qty) => {
                if (qty <= 0) {
                    set((state) => ({ items: state.items.filter((i) => i.key !== key) }));
                    return;
                }
                set((state) => ({ items: state.items.map((i) => (i.key === key ? { ...i, qty } : i)) }));
            },

            removeItem: (key) => set((state) => ({ items: state.items.filter((i) => i.key !== key) })),

            clearCart: () => set({ items: [] }),

            applyCheckoutQuote: (restaurantId, originalItems, quotes) => set(state => {
                if (state.restaurantId !== restaurantId || JSON.stringify(state.items) !== JSON.stringify(originalItems)) return state;
                const byKey = new Map(quotes.map(quote => [quote.key, quote]));
                if (state.items.some(line => !byKey.has(selectionKey(line)))) return state;
                return { needsPriceConfirmation: true, items: state.items.map(line => ({ ...line, ...byKey.get(selectionKey(line)), key: line.key })) };
            }),

            beginPurchase: (restaurantId, purchase) => {
                const pending = pendingPurchaseFor(get(), restaurantId);
                if (pending) return pending;
                set((state) => ({ pendingPurchases: { ...state.pendingPurchases, [restaurantId]: purchase } }));
                return purchase;
            },

            confirmPurchase: (restaurantId, requestId, orderId) => set((state) => {
                const pending = pendingPurchaseFor(state, restaurantId);
                if (pending && pending.requestId !== requestId) return state;
                const pendingPurchases = { ...state.pendingPurchases };
                delete pendingPurchases[restaurantId];
                return {
                    pendingPurchases,
                    confirmedOrders: { ...state.confirmedOrders, [restaurantId]: orderId },
                    ...(state.restaurantId === restaurantId ? {
                        orderId,
                        needsPriceConfirmation: false,
                        items: JSON.stringify(state.items) === JSON.stringify(pending?.cartItems) ? [] : state.items,
                    } : {}),
                };
            }),

            syncPurchase: (restaurantId, journal) => set((state) => {
                const pendingPurchases = { ...state.pendingPurchases };
                if (journal.pending) pendingPurchases[restaurantId] = journal.pending;
                else delete pendingPurchases[restaurantId];
                return {
                    pendingPurchases,
                    confirmedOrders: { ...state.confirmedOrders, [restaurantId]: journal.orderId || null },
                    ...(state.restaurantId === restaurantId ? { orderId: journal.orderId || null } : {}),
                };
            }),

            setOrderId: (orderId) => set((state) => ({ orderId, items: [], confirmedOrders: { ...state.confirmedOrders, [state.restaurantId]: orderId } })),

            leaveOrder: () => set((state) => ({ orderId: null, confirmedOrders: { ...state.confirmedOrders, [state.restaurantId]: null } })),

            cartTotal: () => get().items.reduce((sum, i) => sum + i.unitPrice * i.qty, 0),
            cartCount: () => get().items.reduce((sum, i) => sum + i.qty, 0),
        }),
        { name: "smart-menu-cart" }
    )
);

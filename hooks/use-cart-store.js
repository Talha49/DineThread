import { create } from "zustand";
import { persist } from "zustand/middleware";

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

            ensureRestaurant: (restaurantId) => {
                if (get().restaurantId !== restaurantId) {
                    set({ restaurantId, tableId: null, items: [], orderId: null });
                }
            },

            setTable: (tableId) => set({ tableId }),

            addItem: (line) => {
                // Same item + same variant/modifiers combo just bumps quantity.
                const key = [line.menuItemId, line.variantName || "", (line.modifierNames || []).slice().sort().join(",")].join("|");
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

            setOrderId: (orderId) => set({ orderId, items: [] }),

            leaveOrder: () => set({ orderId: null }),

            cartTotal: () => get().items.reduce((sum, i) => sum + i.unitPrice * i.qty, 0),
            cartCount: () => get().items.reduce((sum, i) => sum + i.qty, 0),
        }),
        { name: "smart-menu-cart" }
    )
);

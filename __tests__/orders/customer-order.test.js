import { useCartStore } from "@/hooks/use-cart-store";
import { sendCustomerOrder } from "@/lib/customer-order";

const items = [{ key: "soup", menuItemId: "000000000000000000000001", name: "Soup", modifierIds: [], unitPrice: 8, qty: 1 }];
const input = { restaurantId: "test-cafe", tableId: "000000000000000000000002", items, store: useCartStore };
const response = (value, ok = true) => ({ ok, json: async () => value });
beforeEach(() => {
    localStorage.clear();
    useCartStore.setState({ restaurantId: input.restaurantId, tableId: input.tableId, items, orderId: null, pendingPurchases: {}, confirmedOrders: {} });
    global.fetch = jest.fn();
    if (!AbortSignal.timeout) AbortSignal.timeout = () => new AbortController().signal;
});
afterEach(() => jest.restoreAllMocks());

test("lost confirmation persists the original purchase and reload retries the same payload", async () => {
    fetch.mockResolvedValueOnce(response({ active: true, mode: "recovery" })).mockRejectedValueOnce(new TypeError("network"));
    await expect(sendCustomerOrder(input)).rejects.toThrow("network");
    const firstBody = JSON.parse(fetch.mock.calls[1][1].body);
    expect(JSON.parse(localStorage.getItem("smart-menu-cart")).state.pendingPurchases["test-cafe"].requestId).toBe(firstBody.requestId);
    useCartStore.getState().updateQty("soup", 3);
    await useCartStore.persist.rehydrate();
    fetch.mockResolvedValueOnce(response({ active: true, mode: "recovery" })).mockResolvedValueOnce(response({ order: { _id: "accepted-id", total: 8 } }));
    await sendCustomerOrder({ ...input, items: useCartStore.getState().items });
    expect(fetch.mock.calls[2][1].method).toBe("GET");
    expect(JSON.parse(fetch.mock.calls[3][1].body)).toEqual(firstBody);
    expect(useCartStore.getState().orderId).toBe("accepted-id");
    expect(useCartStore.getState().pendingPurchases["test-cafe"]).toBeUndefined();
});

test("conflict keeps the original snapshot, including after visiting another restaurant", async () => {
    fetch.mockResolvedValueOnce(response({ active: true, mode: "recovery" })).mockResolvedValueOnce(response({ message: "Conflict" }, false));
    await expect(sendCustomerOrder(input)).rejects.toThrow("Conflict");
    const pending = useCartStore.getState().pendingPurchases["test-cafe"];
    useCartStore.getState().ensureRestaurant("another-cafe");
    expect(useCartStore.getState().pendingPurchases["test-cafe"]).toEqual(pending);
    expect(useCartStore.getState().orderId).toBeNull();
});

test("a missing session cannot replace ownership of an uncertain purchase", async () => {
    useCartStore.getState().beginPurchase(input.restaurantId, { requestId: "original", payload: {} });
    fetch.mockResolvedValueOnce(response({ active: false, mode: "recovery" }));
    await expect(sendCustomerOrder(input)).rejects.toThrow("earlier browser session");
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(useCartStore.getState().pendingPurchases["test-cafe"].requestId).toBe("original");
});

test("a separate purchase gets a new identifier after confirmation", async () => {
    for (const id of ["first", "second"]) {
        fetch.mockResolvedValueOnce(response({ active: true, mode: "recovery" })).mockResolvedValueOnce(response({ order: { _id: id, total: 8 } }));
        await sendCustomerOrder(input);
        useCartStore.getState().leaveOrder();
    }
    expect(JSON.parse(fetch.mock.calls[1][1].body).requestId).not.toBe(JSON.parse(fetch.mock.calls[3][1].body).requestId);
});

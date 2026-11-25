import { useCartStore } from "@/hooks/use-cart-store";
import { sendCustomerOrder, startNewCustomerOrder, cancelPendingPurchase } from "@/lib/customer-order";
import { purchaseKey, readPurchaseJournal } from "@/lib/purchase-journal";

const items = [{ key: "soup", menuItemId: "000000000000000000000001", name: "Soup", modifierIds: [], unitPrice: 8, qty: 1 }];
const input = { restaurantId: "test-cafe", tableId: "000000000000000000000002", items, store: useCartStore };
const response = (value, ok = true) => ({ ok, json: async () => value });
beforeEach(() => {
    localStorage.clear();
    useCartStore.setState({ restaurantId: input.restaurantId, tableId: input.tableId, items, orderId: null, pendingPurchases: {}, confirmedOrders: {}, needsPriceConfirmation: false });
    global.fetch = jest.fn();
    Object.defineProperty(navigator, "locks", { configurable: true, value: { request: jest.fn(async (_key, _options, action) => action({})) } });
    if (!AbortSignal.timeout) AbortSignal.timeout = () => new AbortController().signal;
});
afterEach(() => jest.restoreAllMocks());

test('an invalid new cart is rejected before a pending request is saved or posted', async () => {
    fetch.mockResolvedValueOnce(response({ active: true, mode: 'recovery' }));
    await expect(sendCustomerOrder({ ...input, items: [{ ...items[0], qty: 21 }] })).rejects.toThrow('between 1 and 20');
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(readPurchaseJournal(input.restaurantId).pending).toBeNull();
});

test('a changed-price receipt releases the attempt and only explicit resubmission creates a new request', async () => {
    fetch.mockResolvedValueOnce(response({ active: true, mode: 'recovery' })).mockImplementationOnce(async (_url, options) => response({ outcome: 'rejected', requestId: JSON.parse(options.body).requestId, code: 'MENU_CHANGED', details: { quotes: [{ key: items[0].menuItemId + '||', unitPrice: 9, displayed: { selectionPricePence: 900, modifiers: [] } }] } }));
    await sendCustomerOrder(input);
    expect(useCartStore.getState().items[0].unitPrice).toBe(9);
    expect(useCartStore.getState().needsPriceConfirmation).toBe(true);
    expect(fetch).toHaveBeenCalledTimes(2);
    fetch.mockResolvedValueOnce(response({ active: true, mode: 'recovery' })).mockResolvedValueOnce(response({ order: { _id: 'confirmed', total: 9 } }));
    await sendCustomerOrder({ ...input, items: useCartStore.getState().items });
    expect(JSON.parse(fetch.mock.calls[3][1].body).requestId).not.toBe(JSON.parse(fetch.mock.calls[1][1].body).requestId);
    expect(JSON.parse(fetch.mock.calls[3][1].body).items[0].displayed.selectionPricePence).toBe(900);
});

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
        await startNewCustomerOrder(input);
    }
    expect(JSON.parse(fetch.mock.calls[1][1].body).requestId).not.toBe(JSON.parse(fetch.mock.calls[3][1].body).requestId);
});

test("durable rejection releases the saved purchase without clearing the editable cart", async () => {
    fetch.mockResolvedValueOnce(response({ active: true, mode: "recovery" })).mockImplementationOnce(async (_url, options) => response({ outcome: "rejected", requestId: JSON.parse(options.body).requestId, message: "Unavailable" }));
    expect((await sendCustomerOrder(input)).outcome).toBe("rejected");
    expect(readPurchaseJournal(input.restaurantId).pending).toBeNull();
    expect(useCartStore.getState().items).toEqual(items);
});

test("an uncertain cancellation retains the original purchase until a durable answer arrives", async () => {
    fetch.mockResolvedValueOnce(response({ active: true, mode: "recovery" })).mockRejectedValueOnce(new TypeError("offline"));
    await expect(sendCustomerOrder(input)).rejects.toThrow("offline");
    const original = readPurchaseJournal(input.restaurantId).pending;
    fetch.mockResolvedValueOnce(response({ active: true })).mockRejectedValueOnce(new TypeError("offline"));
    await expect(cancelPendingPurchase(input)).rejects.toThrow("offline");
    expect(readPurchaseJournal(input.restaurantId).pending).toEqual(original);
    fetch.mockResolvedValueOnce(response({ active: true })).mockResolvedValueOnce(response({ outcome: "cancelled", requestId: original.requestId }));
    await cancelPendingPurchase(input);
    expect(readPurchaseJournal(input.restaurantId).pending).toBeNull();
});

test("editing or overwriting the cart cannot overwrite the separate pending receipt", async () => {
    fetch.mockResolvedValueOnce(response({ active: true, mode: "recovery" })).mockRejectedValueOnce(new TypeError("offline"));
    await expect(sendCustomerOrder(input)).rejects.toThrow("offline");
    const journal = localStorage.getItem(purchaseKey(input.restaurantId));
    useCartStore.setState({ pendingPurchases: {}, items: [] }); // stale tab/cart write
    expect(localStorage.getItem(purchaseKey(input.restaurantId))).toBe(journal);
    fetch.mockResolvedValueOnce(response({ active: true, mode: "recovery" })).mockResolvedValueOnce(response({ order: { _id: "restored", total: 8 } }));
    await sendCustomerOrder(input);
    expect(JSON.parse(fetch.mock.calls[3][1].body).requestId).toBe(JSON.parse(journal).pending.requestId);
});

test("missing lock support and an occupied lock fail before sending", async () => {
    navigator.locks.request.mockImplementationOnce(async (_key, _options, action) => action(null));
    await expect(sendCustomerOrder(input)).rejects.toThrow("Another tab");
    Object.defineProperty(navigator, "locks", { configurable: true, value: undefined });
    await expect(sendCustomerOrder(input)).rejects.toThrow("secure connection");
    expect(fetch).not.toHaveBeenCalled();
});

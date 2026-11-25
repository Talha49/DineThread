import { createHash } from "node:crypto";
import Restaurant from "@/models/Restaurant";
import Table from "@/models/Table";
import MenuItem from "@/models/MenuItem";
import Order from "@/models/Order";
import { catalogueMode, displayedSelection, sameDisplayedSelection, pence, selectionKey } from "@/lib/catalogue-policy";
import { measureCatalogue } from "@/lib/order-research";

export class OrderSubmissionError extends Error {
    constructor(message, status, code, details) {
        super(message);
        this.status = status;
        this.code = code;
        this.details = details;
    }
}

// Missing outcome is an accepted legacy order, still accessible to staff.
export const acceptedOrderFilter = { submissionOutcome: { $nin: ["rejected", "cancelled"] } };
export const validRequestId = (id) => typeof id === "string" && /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(id);

export function normaliseOrder(data) {
    return {
        restaurantId: data.restaurantId.toLowerCase(),
        tableId: data.tableId.toLowerCase(),
        items: data.items.map((line) => ({
            menuItemId: line.menuItemId.toLowerCase(),
            variantId: line.variantId?.toLowerCase() || null,
            modifierIds: (line.modifierIds || []).map((id) => id.toLowerCase()).sort(),
            qty: line.qty,
            ...(line.displayed ? { displayed: { selectionPricePence: line.displayed.selectionPricePence, modifiers: [...line.displayed.modifiers].map(m => ({ ...m, id: m.id.toLowerCase() })).sort((a,b) => a.id.localeCompare(b.id)) } } : {}),
        })).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b), "en")),
    };
}

export function orderFingerprint(data) {
    return createHash("sha256").update(JSON.stringify(normaliseOrder(data))).digest("hex");
}

export function publicOrder(order) {
    const result = order.toObject ? order.toObject() : { ...order };
    delete result.ownerHash;
    delete result.requestId;
    delete result.requestFingerprint;
    delete result.submissionOutcome;
    delete result.rejectionCode;
    delete result.rejectionMessage;
    delete result.rejectionDetails;
    delete result.workflowHistory;
    result.workflowVersion ??= 0;
    return result;
}

const indexChecks = new WeakMap();
export async function ensureOrderRequestIndex() {
    if (!indexChecks.has(Order)) {
        const check = Order.collection.createIndex({ restaurant: 1, requestId: 1 }, {
            unique: true,
            name: "restaurant_request_unique",
            partialFilterExpression: { requestId: { $type: "string" } },
        }).catch((error) => {
            indexChecks.delete(Order);
            throw error;
        });
        indexChecks.set(Order, check);
    }
    await indexChecks.get(Order);
}

function replay(order, ownerHash, fingerprint) {
    if (order.ownerHash !== ownerHash) {
        throw new OrderSubmissionError("This request is not available in this browser session.", 403, "SESSION_MISMATCH");
    }
    if (order.requestFingerprint !== fingerprint) {
        throw new OrderSubmissionError("This purchase was submitted with different details. Keep the original request and contact staff.", 409, "REQUEST_CONFLICT");
    }
    if (order.submissionOutcome === "rejected" || order.submissionOutcome === "cancelled") {
        return { outcome: order.submissionOutcome, requestId: order.requestId, code: order.rejectionCode, message: order.rejectionMessage, details: order.rejectionDetails, replayed: true };
    }
    return { order: publicOrder(order), replayed: true };
}

// Both catalogue policies share authoritative pricing. Replay happens before
// this boundary so an accepted purchase retains its original snapshot.
export async function priceNewOrder(restaurant, data) {
    const table = await Table.findOne({ _id: data.tableId, restaurant: restaurant._id, isActive: true });
    if (!table) throw new OrderSubmissionError("Table not found", 400, "INVALID_TABLE");
    const ids = [...new Set(data.items.map((line) => line.menuItemId))];
    const menu = await MenuItem.find({ _id: { $in: ids }, restaurant: restaurant._id, isAvailable: true });
    const byId = new Map(menu.map((item) => [String(item._id), item]));
    const quotes = [];
    let changed = false;
    const items = data.items.map((line) => {
        const item = byId.get(line.menuItemId);
        if (!item) throw new OrderSubmissionError("One or more items are no longer available", 400, "INVALID_MENU");
        let unitPence = pence(item.price);
        let variantName;
        let variant;
        if (item.variants.length && !line.variantId) throw new OrderSubmissionError("Choose an available size before ordering", 400, "INVALID_MENU");
        if (line.variantId) {
            variant = item.variants.id(line.variantId);
            if (!variant) throw new OrderSubmissionError("Selected size is no longer available", 400, "INVALID_MENU");
            unitPence = pence(variant.price);
            variantName = variant.name;
        }
        const modifierNames = [];
        for (const id of line.modifierIds) {
            const modifier = item.modifiers.id(id);
            if (!modifier) throw new OrderSubmissionError("Selected add-on is no longer available", 400, "INVALID_MENU");
            unitPence += pence(modifier.price);
            modifierNames.push(modifier.name);
        }
        const displayed = displayedSelection(item, variant, line.modifierIds);
        if (!sameDisplayedSelection(line.displayed, displayed)) changed = true;
        quotes.push({ key: selectionKey(line), displayed, unitPrice: unitPence / 100 });
        return {
            menuItem: item._id, name: item.name, variantName, modifierNames,
            unitPrice: unitPence / 100, qty: line.qty, lineTotal: unitPence * line.qty / 100,
        };
    });
    if (catalogueMode() === "reconfirmation" && changed) {
        throw new OrderSubmissionError("Prices need your confirmation. Review the updated amounts before placing the order.", 400, "MENU_CHANGED", { quotes });
    }
    return { table: table._id, items, total: Math.round(items.reduce((sum, line) => sum + line.lineTotal, 0) * 100) / 100 };
}

export async function submitOrder({ data, requestId, ownerHash, mode = "recovery", cancel = false }) {
    if (!ownerHash) throw new OrderSubmissionError("Your browser session is missing. Contact staff before retrying an uncertain order.", 401, "SESSION_REQUIRED");
    if (mode === "recovery" && !validRequestId(requestId)) throw new OrderSubmissionError("Invalid purchase identifier", 400, "INVALID_REQUEST_ID");
    if (cancel && mode !== "recovery") throw new OrderSubmissionError("Recovery is unavailable", 409, "RECOVERY_UNAVAILABLE");
    requestId = requestId?.toLowerCase();
    const normalised = normaliseOrder(data);
    const escapedSlug = normalised.restaurantId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const restaurant = await Restaurant.findOne({ restaurantId: { $regex: new RegExp(`^${escapedSlug}$`, "i") } });
    if (!restaurant) throw new OrderSubmissionError("Restaurant not found", 404, "INVALID_RESTAURANT");
    const key = { restaurant: restaurant._id, requestId };
    const fingerprint = orderFingerprint(data);
    const findAccepted = () => Order.findOne(key).select("+ownerHash +requestFingerprint");
    if (mode === "recovery") {
        await ensureOrderRequestIndex();
        const accepted = await findAccepted();
        // Replay before consulting the current menu or table availability.
        if (accepted) return replay(accepted, ownerHash, fingerprint);
    }
    let priced, rejection;
    if (!cancel) {
        try {
            priced = await measureCatalogue(() => priceNewOrder(restaurant, normalised));
        } catch (error) {
            if (mode !== "recovery" || !(error instanceof OrderSubmissionError) || error.status !== 400) throw error;
            rejection = error;
        }
    }
    try {
        const order = await Order.create({
            restaurant: restaurant._id, ownerHash,
            ...(priced || { table: normalised.tableId, items: [], total: 0 }),
            submissionOutcome: cancel ? "cancelled" : rejection ? "rejected" : "accepted",
            ...(cancel ? { rejectionCode: "CANCELLED", rejectionMessage: "This purchase was not placed. You can edit the cart and order again." } : {}),
            ...(rejection ? { rejectionCode: rejection.code, rejectionMessage: rejection.message, rejectionDetails: rejection.details } : {}),
            ...(mode === "recovery" ? { requestId, requestFingerprint: fingerprint } : {}),
        });
        if (cancel || rejection) return { ...replay(order, ownerHash, fingerprint), replayed: false };
        return { order: publicOrder(order), replayed: false };
    } catch (error) {
        if (mode !== "recovery" || error.code !== 11000 || !error.keyPattern?.requestId) throw error;
        // Another overlapping request won the unique insert. Return its result,
        // but only after checking both ownership and the original payload.
        const accepted = await findAccepted();
        if (!accepted) throw error;
        return replay(accepted, ownerHash, fingerprint);
    }
}

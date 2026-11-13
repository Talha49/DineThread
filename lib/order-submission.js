import { createHash } from "node:crypto";
import Restaurant from "@/models/Restaurant";
import Table from "@/models/Table";
import MenuItem from "@/models/MenuItem";
import Order from "@/models/Order";

export class OrderSubmissionError extends Error {
    constructor(message, status, code) {
        super(message);
        this.status = status;
        this.code = code;
    }
}

export function normaliseOrder(data) {
    return {
        restaurantId: data.restaurantId.toLowerCase(),
        tableId: data.tableId.toLowerCase(),
        items: data.items.map((line) => ({
            menuItemId: line.menuItemId.toLowerCase(),
            variantId: line.variantId?.toLowerCase() || null,
            modifierIds: (line.modifierIds || []).map((id) => id.toLowerCase()).sort(),
            qty: line.qty,
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
    return { order: publicOrder(order), replayed: true };
}

// Shared pricing boundary for baseline and recovery. Fahad's menu-consistency
// work can replace this policy without changing request identity or replay.
export async function priceNewOrder(restaurant, data) {
    const table = await Table.findOne({ _id: data.tableId, restaurant: restaurant._id, isActive: true });
    if (!table) throw new OrderSubmissionError("Table not found", 400, "INVALID_TABLE");
    const ids = [...new Set(data.items.map((line) => line.menuItemId))];
    const menu = await MenuItem.find({ _id: { $in: ids }, restaurant: restaurant._id, isAvailable: true });
    const byId = new Map(menu.map((item) => [String(item._id), item]));
    const items = data.items.map((line) => {
        const item = byId.get(line.menuItemId);
        if (!item) throw new OrderSubmissionError("One or more items are no longer available", 400, "INVALID_MENU");
        let unitPrice = item.price;
        let variantName;
        if (line.variantId) {
            const variant = item.variants.id(line.variantId);
            if (!variant) throw new OrderSubmissionError("Selected size is no longer available", 400, "INVALID_MENU");
            unitPrice = variant.price;
            variantName = variant.name;
        }
        const modifierNames = [];
        for (const id of line.modifierIds) {
            const modifier = item.modifiers.id(id);
            if (!modifier) throw new OrderSubmissionError("Selected add-on is no longer available", 400, "INVALID_MENU");
            unitPrice += modifier.price;
            modifierNames.push(modifier.name);
        }
        return {
            menuItem: item._id, name: item.name, variantName, modifierNames,
            unitPrice, qty: line.qty, lineTotal: Math.round(unitPrice * line.qty * 100) / 100,
        };
    });
    return { table: table._id, items, total: Math.round(items.reduce((sum, line) => sum + line.lineTotal, 0) * 100) / 100 };
}

export async function submitOrder({ data, requestId, ownerHash, mode = "recovery" }) {
    if (!ownerHash) throw new OrderSubmissionError("Your browser session is missing. Contact staff before retrying an uncertain order.", 401, "SESSION_REQUIRED");
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
    const priced = await priceNewOrder(restaurant, normalised);
    try {
        const order = await Order.create({
            restaurant: restaurant._id, ...priced, ownerHash,
            ...(mode === "recovery" ? { requestId, requestFingerprint: fingerprint } : {}),
        });
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

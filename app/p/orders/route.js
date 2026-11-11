import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Restaurant from "@/models/Restaurant";
import Table from "@/models/Table";
import MenuItem from "@/models/MenuItem";
import Order from "@/models/Order";
import { PlaceOrderSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function POST(req) {
    try {
        const body = await req.json();
        const validation = PlaceOrderSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ message: "Invalid order", errors: validation.error.flatten() }, { status: 400 });
        }
        const { restaurantId, tableId, items } = validation.data;

        await dbConnect();

        const restaurant = await Restaurant.findOne({
            restaurantId: { $regex: new RegExp(`^${restaurantId}$`, "i") },
        });
        if (!restaurant) return NextResponse.json({ message: "Restaurant not found" }, { status: 404 });

        const table = await Table.findOne({ _id: tableId, restaurant: restaurant._id, isActive: true });
        if (!table) return NextResponse.json({ message: "Table not found" }, { status: 404 });

        // Re-price every line from the live MenuItem - never trust client-submitted prices.
        const menuItemIds = [...new Set(items.map((i) => i.menuItemId))];
        const menuItems = await MenuItem.find({ _id: { $in: menuItemIds }, restaurant: restaurant._id, isAvailable: true });
        const menuItemById = new Map(menuItems.map((mi) => [mi._id.toString(), mi]));

        const orderItems = [];
        for (const line of items) {
            const menuItem = menuItemById.get(line.menuItemId);
            if (!menuItem) {
                return NextResponse.json({ message: "One or more items are no longer available" }, { status: 400 });
            }

            let unitPrice = menuItem.price;
            let variantName;
            if (line.variantId) {
                const variant = menuItem.variants.id(line.variantId);
                if (!variant) return NextResponse.json({ message: "Selected size is no longer available" }, { status: 400 });
                unitPrice = variant.price;
                variantName = variant.name;
            }

            const modifierNames = [];
            for (const modId of line.modifierIds || []) {
                const modifier = menuItem.modifiers.id(modId);
                if (!modifier) return NextResponse.json({ message: "Selected add-on is no longer available" }, { status: 400 });
                unitPrice += modifier.price;
                modifierNames.push(modifier.name);
            }

            orderItems.push({
                menuItem: menuItem._id,
                name: menuItem.name,
                variantName,
                modifierNames,
                unitPrice,
                qty: line.qty,
                lineTotal: Math.round(unitPrice * line.qty * 100) / 100,
            });
        }

        const total = Math.round(orderItems.reduce((sum, i) => sum + i.lineTotal, 0) * 100) / 100;

        const order = await Order.create({
            restaurant: restaurant._id,
            table: table._id,
            items: orderItems,
            total,
        });

        return NextResponse.json({ order }, { status: 201 });
    } catch (error) {
        console.error("Place Order Error:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}

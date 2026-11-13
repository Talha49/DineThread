import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import { isSameOrigin, orderSessionHash } from "@/lib/order-session";
import { publicOrder } from "@/lib/order-submission";

export const dynamic = "force-dynamic";

// Deliberately narrow: a customer can only flip this one flag, never set
// status directly (that stays owner/kitchen-only via /api/orders).
export async function POST(req, { params }) {
    try {
        if (!isSameOrigin(req)) return NextResponse.json({ message: "Invalid origin" }, { status: 403 });
        const { id } = await params;
        if (!/^[0-9a-fA-F]{24}$/.test(id)) {
            return NextResponse.json({ message: "Order not found" }, { status: 404 });
        }

        const ownerHash = orderSessionHash(req);
        if (!ownerHash) return NextResponse.json({ message: "Order not found in this browser session" }, { status: 404 });
        await dbConnect();
        const order = await Order.findOne({ _id: id, ownerHash });
        if (!order) return NextResponse.json({ message: "Order not found" }, { status: 404 });

        order.billRequested = true;
        await order.save();

        return NextResponse.json({ order: publicOrder(order) }, { headers: { "Cache-Control": "no-store" } });
    } catch (error) {
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}

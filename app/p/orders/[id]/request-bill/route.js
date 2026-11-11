import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";

export const dynamic = "force-dynamic";

// Deliberately narrow: a customer can only flip this one flag, never set
// status directly (that stays owner/kitchen-only via /api/orders).
export async function POST(req, { params }) {
    try {
        const { id } = await params;
        if (!/^[0-9a-fA-F]{24}$/.test(id)) {
            return NextResponse.json({ message: "Order not found" }, { status: 404 });
        }

        await dbConnect();
        const order = await Order.findById(id);
        if (!order) return NextResponse.json({ message: "Order not found" }, { status: 404 });

        order.billRequested = true;
        await order.save();

        return NextResponse.json({ order });
    } catch (error) {
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}

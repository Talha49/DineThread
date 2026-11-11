import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";

export const dynamic = "force-dynamic";

// The order's own id is the customer's tracking ticket - it's an unguessable
// 24-char Mongo id, the same trust model already used for analytics events
// in this app. No login/session needed for something as low-sensitivity as
// "what did this table order."
export async function GET(req, { params }) {
    try {
        const { id } = await params;
        if (!/^[0-9a-fA-F]{24}$/.test(id)) {
            return NextResponse.json({ message: "Order not found" }, { status: 404 });
        }

        await dbConnect();
        const order = await Order.findById(id).populate("table", "label").lean();
        if (!order) return NextResponse.json({ message: "Order not found" }, { status: 404 });

        return NextResponse.json({ order });
    } catch (error) {
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}

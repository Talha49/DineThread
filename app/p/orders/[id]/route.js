import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import { orderSessionHash } from "@/lib/order-session";
import { publicOrder, acceptedOrderFilter } from "@/lib/order-submission";

export const dynamic = "force-dynamic";

// An order ID locates the record; the original browser session authorises it.
export async function GET(req, { params }) {
    try {
        const { id } = await params;
        if (!/^[0-9a-fA-F]{24}$/.test(id)) {
            return NextResponse.json({ message: "Order not found" }, { status: 404 });
        }

        const ownerHash = orderSessionHash(req);
        if (!ownerHash) return NextResponse.json({ message: "Order not found in this browser session" }, { status: 404 });
        await dbConnect();
        const order = await Order.findOne({ _id: id, ownerHash, ...acceptedOrderFilter }).populate("table", "label").lean();
        if (!order) return NextResponse.json({ message: "Order not found" }, { status: 404 });

        return NextResponse.json({ order: publicOrder(order) }, { headers: { "Cache-Control": "no-store" } });
    } catch (error) {
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}

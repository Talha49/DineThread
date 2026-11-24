import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import Restaurant from "@/models/Restaurant";
import { acceptedOrderFilter, publicOrder } from "@/lib/order-submission";

export async function GET(req) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth-token")?.value;
        const user = token ? await verifyJWT(token) : null;

        if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        await dbConnect();
        const restaurant = await Restaurant.findOne({ owner: user.id });
        if (!restaurant) return NextResponse.json({ message: "Restaurant not found" }, { status: 404 });

        const isHistory = req.nextUrl.searchParams.get("view") === "history";

        // The board itself only shows the active pipeline; paid orders move
        // here instead, newest first, capped so this never turns into an
        // unbounded full-history dump.
        const orders = await Order.find({
            restaurant: restaurant._id,
            ...acceptedOrderFilter,
            status: isHistory ? "paid" : { $ne: "paid" },
        })
            .populate("table", "label")
            .sort(isHistory ? { statusUpdatedAt: -1 } : { createdAt: 1 })
            .limit(isHistory ? 200 : 0)
            .lean();

        const [summary] = isHistory ? await Order.aggregate([
            { $match: { restaurant: restaurant._id, ...acceptedOrderFilter, status: 'paid' } },
            { $group: { _id: null, paidCount: { $sum: 1 }, totalPence: { $sum: { $round: [{ $multiply: ['$total', 100] }, 0] } } } },
            { $project: { _id: 0, paidCount: 1, totalPence: 1 } },
        ]) : [];
        return NextResponse.json({ orders: orders.map(publicOrder), ...(isHistory ? { summary: summary || { paidCount: 0, totalPence: 0 } } : {}) }, { headers: { 'Cache-Control': 'no-store' } });
    } catch (error) {
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}

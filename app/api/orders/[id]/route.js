import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import Restaurant from "@/models/Restaurant";
import { UpdateOrderStatusSchema } from "@/lib/validations";

export async function PATCH(req, { params }) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth-token")?.value;
        const user = token ? await verifyJWT(token) : null;

        if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const body = await req.json();
        const validation = UpdateOrderStatusSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ message: "Invalid input", errors: validation.error.flatten() }, { status: 400 });
        }

        await dbConnect();
        const restaurant = await Restaurant.findOne({ owner: user.id });
        if (!restaurant) return NextResponse.json({ message: "Restaurant not found" }, { status: 404 });

        const order = await Order.findOne({ _id: id, restaurant: restaurant._id });
        if (!order) return NextResponse.json({ message: "Order not found" }, { status: 404 });

        order.status = validation.data.status;
        order.statusUpdatedAt = new Date();
        await order.save();
        await order.populate("table", "label");

        return NextResponse.json({ order });
    } catch (error) {
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}

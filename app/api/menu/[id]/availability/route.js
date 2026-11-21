import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import dbConnect from "@/lib/mongodb";
import MenuItem from "@/models/MenuItem";
import Restaurant from "@/models/Restaurant";

export async function PUT(req, { params }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    const user = token ? await verifyJWT(token) : null;

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { isAvailable } = await req.json();

    await dbConnect();

    const restaurant = await Restaurant.findOne({ owner: user.id });
    
    if (!restaurant) return NextResponse.json({ message: "Restaurant not found" }, { status: 404 });

    const updatedItem = await MenuItem.findOneAndUpdate(
        { _id: id, restaurant: restaurant._id },
        { isAvailable },
        { new: true }
    );

    if (!updatedItem) {
        return NextResponse.json({ message: "Item not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ success: true, item: updatedItem });

  } catch (error) {
    console.error("Error toggling availability:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

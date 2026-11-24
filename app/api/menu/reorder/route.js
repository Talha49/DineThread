import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import dbConnect from "@/lib/mongodb";
import MenuItem from "@/models/MenuItem";
import Restaurant from "@/models/Restaurant";
import mongoose from "mongoose";

export async function PUT(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    const user = token ? await verifyJWT(token) : null;

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { itemIds } = await req.json();
    if (!Array.isArray(itemIds)) {
      return NextResponse.json({ message: "Invalid input: itemIds must be an array" }, { status: 400 });
    }

    await dbConnect();

    // Verify restaurant ownership
    const restaurant = await Restaurant.findOne({ owner: user.id });
    if (!restaurant) {
      return NextResponse.json({ message: "Restaurant not found" }, { status: 404 });
    }

    // Prepare bulk operations
    const ops = itemIds.map((id, index) => ({
      updateOne: {
        filter: { 
          _id: new mongoose.Types.ObjectId(id), 
          restaurant: restaurant._id 
        },
        update: { $set: { sortOrder: index } },
      },
    }));

    if (ops.length > 0) {
      const result = await MenuItem.bulkWrite(ops);
      console.log(`Reordered ${result.modifiedCount} menu items`);
    }

    return NextResponse.json({ message: "Menu items reordered successfully" });
  } catch (error) {
    console.error("Reorder Menu Items Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

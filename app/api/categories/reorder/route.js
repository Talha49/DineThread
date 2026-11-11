import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import dbConnect from "@/lib/mongodb";
import Category from "@/models/Category";
import Restaurant from "@/models/Restaurant";

export async function PUT(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    const user = token ? await verifyJWT(token) : null;

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { categoryIds } = await req.json();
    if (!Array.isArray(categoryIds)) {
      return NextResponse.json({ message: "Invalid input: categoryIds must be an array" }, { status: 400 });
    }

    await dbConnect();

    // Verify restaurant ownership
    const restaurant = await Restaurant.findOne({ owner: user.id });
    if (!restaurant) {
      return NextResponse.json({ message: "Restaurant not found" }, { status: 404 });
    }

    // Prepare bulk operations
    const ops = categoryIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id, restaurant: restaurant._id },
        update: { $set: { sortOrder: index } },
      },
    }));

    if (ops.length > 0) {
      await Category.bulkWrite(ops);
    }

    return NextResponse.json({ message: "Categories reordered successfully" });
  } catch (error) {
    console.error("Reorder Categories Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import dbConnect from "@/lib/mongodb";
import Category from "@/models/Category";
import Restaurant from "@/models/Restaurant";

export async function GET(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    const user = token ? await verifyJWT(token) : null;

    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const restaurant = await Restaurant.findOne({ owner: user.id });
    if (!restaurant) return NextResponse.json({ message: "Restaurant not found" }, { status: 404 });

    // Sort by 'sortOrder'
    const categories = await Category.find({ restaurant: restaurant._id }).sort({ sortOrder: 1 });

    return NextResponse.json({ categories });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    const user = token ? await verifyJWT(token) : null;
    
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { name, emoji } = await req.json();
    if (!name) return NextResponse.json({ message: "Name is required" }, { status: 400 });

    await dbConnect();
    const restaurant = await Restaurant.findOne({ owner: user.id });
    if (!restaurant) return NextResponse.json({ message: "Restaurant not found" }, { status: 404 });

    // Check existing
    const existing = await Category.findOne({ restaurant: restaurant._id, name: { $regex: new RegExp(`^${name}$`, "i") } });
    if (existing) {
        return NextResponse.json({ message: "Category with this name already exists" }, { status: 400 });
    }

    // Find max sortOrder
    const lastCategory = await Category.findOne({ restaurant: restaurant._id }).sort({ sortOrder: -1 });
    const nextOrder = lastCategory ? (lastCategory.sortOrder || 0) + 1 : 0;

    const category = await Category.create({
        name,
        restaurant: restaurant._id,
        emoji: emoji || "🍽️",
        sortOrder: nextOrder
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    if (error.code === 11000) {
        return NextResponse.json({ message: "Category already exists" }, { status: 400 });
    }
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

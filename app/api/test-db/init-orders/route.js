import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import dbConnect from "@/lib/mongodb";
import Category from "@/models/Category";
import MenuItem from "@/models/MenuItem";
import Restaurant from "@/models/Restaurant";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    const user = token ? await verifyJWT(token) : null;

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Find the user's restaurant
    const restaurant = await Restaurant.findOne({ owner: user.id });
    if (!restaurant) {
      return NextResponse.json({ message: "Restaurant not found" }, { status: 404 });
    }

    // 1. Initialize Categories
    const categories = await Category.find({ restaurant: restaurant._id }).sort({ createdAt: 1 });
    const catOps = categories.map((cat, index) => ({
      updateOne: {
        filter: { _id: cat._id },
        update: { $set: { sortOrder: index } },
      },
    }));

    if (catOps.length > 0) {
      await Category.bulkWrite(catOps);
    }

    // 2. Initialize Menu Items per Category
    const items = await MenuItem.find({ restaurant: restaurant._id }).sort({ category: 1, createdAt: 1 });
    
    const groupedItems = items.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});

    const itemOps = [];
    Object.keys(groupedItems).forEach((catName) => {
      groupedItems[catName].forEach((item, index) => {
        itemOps.push({
          updateOne: {
            filter: { _id: item._id },
            update: { $set: { sortOrder: index } },
          },
        });
      });
    });

    if (itemOps.length > 0) {
      await MenuItem.bulkWrite(itemOps);
    }

    return NextResponse.json({ 
      message: "Sort orders initialized successfully",
      categoriesCount: catOps.length,
      itemsCount: itemOps.length 
    });

  } catch (error) {
    console.error("Initialization Error:", error);
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}

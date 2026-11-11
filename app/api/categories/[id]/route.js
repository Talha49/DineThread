import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import dbConnect from "@/lib/mongodb";
import Category from "@/models/Category";
import MenuItem from "@/models/MenuItem";
import Restaurant from "@/models/Restaurant";

export async function PUT(req, { params }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    const user = token ? await verifyJWT(token) : null;

    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { name, emoji } = await req.json();

    await dbConnect();
    const restaurant = await Restaurant.findOne({ owner: user.id });
    const category = await Category.findOne({ _id: id, restaurant: restaurant._id });
    
    if (!category) return NextResponse.json({ message: "Category not found" }, { status: 404 });

    const oldName = category.name;

    // Check duplicate name if changing
    if (name && name !== oldName) {
         const existing = await Category.findOne({ 
             restaurant: restaurant._id, 
             name: { $regex: new RegExp(`^${name}$`, "i") },
             _id: { $ne: id }
         });
         if (existing) return NextResponse.json({ message: "Category name taken" }, { status: 400 });
         
         // Update category
         category.name = name;
         if (emoji) category.emoji = emoji;
         await category.save();

         // Update all associated Menu Items
         await MenuItem.updateMany(
             { restaurant: restaurant._id, category: oldName },
             { category: name }
         );
    } else {
        if (emoji) category.emoji = emoji;
        await category.save();
    }

    return NextResponse.json({ category });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    const user = token ? await verifyJWT(token) : null;

    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    await dbConnect();
    const restaurant = await Restaurant.findOne({ owner: user.id });
    
    const category = await Category.findOne({ _id: id, restaurant: restaurant._id });
    if (!category) return NextResponse.json({ message: "Category not found" }, { status: 404 });

    // Check if items use this category
    const itemsCount = await MenuItem.countDocuments({ restaurant: restaurant._id, category: category.name });
    
    if (itemsCount > 0) {
        return NextResponse.json({ message: `Cannot delete: ${itemsCount} items are in this category. Move or delete them first.` }, { status: 400 });
    }

    await Category.deleteOne({ _id: id });

    return NextResponse.json({ message: "Category deleted" });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

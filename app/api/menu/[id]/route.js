import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import dbConnect from "@/lib/mongodb";
import MenuItem from "@/models/MenuItem";
import Restaurant from "@/models/Restaurant";
import { MenuItemSchema } from "@/lib/validations";
import { del } from '@vercel/blob';

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    await dbConnect();
    const item = await MenuItem.findById(id);

    if (!item) return NextResponse.json({ message: "Item not found" }, { status: 404 });

    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    const user = token ? await verifyJWT(token) : null;

    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();

    await dbConnect();
    const restaurant = await Restaurant.findOne({ owner: user.id });
    if (!restaurant) return NextResponse.json({ message: "Restaurant not found" }, { status: 404 });

    // Validate Input
    const validation = MenuItemSchema.partial().safeParse(body);
    if (!validation.success) {
        return NextResponse.json({ message: "Invalid input", errors: validation.error.flatten() }, { status: 400 });
    }

    // Explicitly update all fields to ensure variants/modifiers are saved
    const updateData = {
        name: validation.data.name,
        price: validation.data.price,
        description: validation.data.description,
        category: validation.data.category,
        imageUrl: validation.data.imageUrl,
        isAvailable: validation.data.isAvailable,
        isFeatured: validation.data.isFeatured,
        variants: validation.data.variants || [],
        modifiers: validation.data.modifiers || []
    };

    const updatedItem = await MenuItem.findOneAndUpdate(
        { _id: id, restaurant: restaurant._id },
        { $set: updateData },
        { new: true, runValidators: true }
    );

    if (!updatedItem) return NextResponse.json({ message: "Item not found or unauthorized" }, { status: 404 });

    return NextResponse.json({ item: updatedItem });
  } catch (error) {
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
    if (!restaurant) return NextResponse.json({ message: "Restaurant not found" }, { status: 404 });

    // Find the item first to get the image URL
    const itemToDelete = await MenuItem.findOne({ _id: id, restaurant: restaurant._id });
    
    if (!itemToDelete) return NextResponse.json({ message: "Item not found or unauthorized" }, { status: 404 });

    // Attempt to delete image from Blob storage if it exists
    if (itemToDelete.imageUrl) {
        try {
            await del(itemToDelete.imageUrl);
        } catch (blobError) {
            console.error("Failed to delete blob image:", blobError);
        }
    }

    await MenuItem.deleteOne({ _id: id });

    return NextResponse.json({ message: "Item deleted successfully" });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

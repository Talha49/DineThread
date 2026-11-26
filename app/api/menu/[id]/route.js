import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import dbConnect from "@/lib/mongodb";
import MenuItem from "@/models/MenuItem";
import Restaurant from "@/models/Restaurant";
import { MenuItemSchema } from "@/lib/validations";
import { cleanUpSavedImage } from '@/lib/menu-images';

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

    // Omitted arrays are unchanged; description-only edits must preserve options.
    const updateData = Object.fromEntries(Object.entries(validation.data).filter(([key]) => Object.hasOwn(body, key)));

    const filter = { _id: id, restaurant: restaurant._id };
    const editsImage = Object.hasOwn(updateData, "imageUrl");
    let previousImage;
    if (editsImage) {
        const current = await MenuItem.findOne(filter).select("imageUrl").lean();
        if (!current) return NextResponse.json({ message: "Item not found or unauthorized" }, { status: 404 });
        previousImage = current.imageUrl;
        if (Object.hasOwn(body, "previousImageUrl") && body.previousImageUrl !== (previousImage || "")) {
            return NextResponse.json({ message: "The photo has changed. Reopen the item to edit it." }, { status: 409 });
        }
        filter.imageUrl = previousImage ?? null;
    }
    const updatedItem = await MenuItem.findOneAndUpdate(
        filter,
        { $set: updateData },
        { new: true, runValidators: true }
    );

    if (!updatedItem) {
        if (editsImage) return NextResponse.json({ message: "The item changed. Reopen it to edit the photo." }, { status: 409 });
        return NextResponse.json({ message: "Item not found or unauthorized" }, { status: 404 });
    }
    if (editsImage && previousImage !== updatedItem.imageUrl) {
        await cleanUpSavedImage(user.id, previousImage);
    }
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

    const itemToDelete = await MenuItem.findOneAndDelete({ _id: id, restaurant: restaurant._id });
    
    if (!itemToDelete) return NextResponse.json({ message: "Item not found or unauthorized" }, { status: 404 });

    await cleanUpSavedImage(user.id, itemToDelete.imageUrl);

    return NextResponse.json({ message: "Item deleted successfully" });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import dbConnect from "@/lib/mongodb";
import MenuItem from "@/models/MenuItem";
import Restaurant from "@/models/Restaurant";
import { MenuItemSchema } from "@/lib/validations";
import mongoose from "mongoose";

export async function GET(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    const user = token ? await verifyJWT(token) : null;

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    // Always safer to fetch the Restaurant Object ID based on the authenticated user to prevent IDOR
    const restaurant = await Restaurant.findOne({ owner: user.id });
    if (!restaurant) {
        return NextResponse.json({ message: "Restaurant setup required" }, { status: 404 });
    }

    const query = { restaurant: restaurant._id };

    if (category && category !== "all") {
      query.category = category;
    }

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    // Prioritize featured items, then manual sortOrder
    const items = await MenuItem.find(query).sort({ isFeatured: -1, sortOrder: 1, createdAt: -1 });

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Error fetching menu:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    const user = token ? await verifyJWT(token) : null;

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // 1. Get Restaurant
    const restaurant = await Restaurant.findOne({ owner: user.id });
    if (!restaurant) {
        return NextResponse.json({ message: "Restaurant not found" }, { status: 404 });
    }

    // 2. Check Plan Limits (Free = 15 items)
    if (restaurant.plan === 'free') {
        const count = await MenuItem.countDocuments({ restaurant: restaurant._id });
        if (count >= 15) {
            return NextResponse.json({ message: "Free tier limit reached (15 items). Upgrade to Pro for unlimited items." }, { status: 403 });
        }
    }

    // 3. Validate Input
    const body = await req.json();
    console.log('[API /menu POST] Received body:', {
        name: body.name,
        hasVariants: body.variants?.length > 0,
        variantsCount: body.variants?.length || 0,
        modifiersCount: body.modifiers?.length || 0
    });
    
    const validation = MenuItemSchema.safeParse(body);
    
    if (!validation.success) {
        console.error('[API /menu POST] Validation failed:', validation.error.flatten());
        return NextResponse.json({ message: "Invalid input", errors: validation.error.flatten() }, { status: 400 });
    }

    console.log('[API /menu POST] Validation passed. Data:', {
        name: validation.data.name,
        variantsCount: validation.data.variants?.length || 0,
        modifiersCount: validation.data.modifiers?.length || 0
    });

    // 4. Find max sortOrder within this category
    const lastItem = await MenuItem.findOne({ 
        restaurant: restaurant._id, 
        category: validation.data.category 
    }).sort({ sortOrder: -1 });
    const nextOrder = lastItem ? (lastItem.sortOrder || 0) + 1 : 0;

    // 5. Create Item - Explicit Mapping for maximum reliability
    const newItemData = {
        name: validation.data.name,
        price: validation.data.price || 0,
        description: validation.data.description || "",
        category: validation.data.category,
        imageUrl: validation.data.imageUrl || "",
        isAvailable: validation.data.isAvailable ?? true,
        isFeatured: validation.data.isFeatured || false,
        restaurant: restaurant._id,
        sortOrder: nextOrder,
        variants: validation.data.variants || [],
        modifiers: validation.data.modifiers || []
    };

    const newItem = await MenuItem.create(newItemData);

    return NextResponse.json({ item: newItem }, { status: 201 });

  } catch (error) {
    console.error("Error creating menu item:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

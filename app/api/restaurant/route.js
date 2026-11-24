import { NextResponse } from "next/server";
import { CreateRestaurantSchema } from "@/lib/validations";
import dbConnect from "@/lib/mongodb";
import Restaurant from "@/models/Restaurant";
import User from "@/models/User";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";

export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    const user = token ? await verifyJWT(token) : null;

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // 1. Validate Input
    const validatedFields = CreateRestaurantSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        { message: "Invalid input", errors: validatedFields.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, restaurantId, type, brandColor, logoUrl } = validatedFields.data;

    await dbConnect();

    // 2. Generate Unique Final ID (slug + random suffix)
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const finalRestaurantId = `${restaurantId}_${randomSuffix}`.toLowerCase();

    // 3. Create Restaurant
    const restaurant = await Restaurant.create({
      name,
      restaurantId: finalRestaurantId,
      owner: user.id,
      brandColor: brandColor || "#4f46e5",
      logoUrl: logoUrl || "",
      fontFamily: "Inter",
    });

    // 4. Update User with restaurant reference
    await User.findByIdAndUpdate(user.id, {
      restaurant: restaurant._id
    });

    return NextResponse.json(
      { message: "Restaurant created successfully", restaurant },
      { status: 201 }
    );
  } catch (error) {
    console.error("Restaurant creation error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

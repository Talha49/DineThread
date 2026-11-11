import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Restaurant from "@/models/Restaurant";
import MenuItem from "@/models/MenuItem";

export async function GET() {
  await dbConnect();

  try {
    // 1. Create a Test User
    const testEmail = `test-${Date.now()}@example.com`;
    const user = await User.create({
      name: "Test User",
      email: testEmail,
      password: "password123",
    });

    // 2. Create a Test Restaurant
    const testSlug = `test-venue-${Date.now()}`;
    const restaurant = await Restaurant.create({
      name: "Test Venue",
      restaurantId: testSlug,
      owner: user._id,
      brandColor: "#000000",
    });

    // 3. Create a Menu Item
    const menuItem = await MenuItem.create({
      name: "Signature Burger",
      price: 15.99,
      description: "A delicious test burger",
      category: "Mains",
      restaurant: restaurant._id,
    });

    return NextResponse.json({
      success: true,
      message: "Database connection and models verified!",
      data: {
        user: { id: user._id, email: user.email },
        restaurant: { id: restaurant._id, slug: restaurant.restaurantId },
        menuItem: { id: menuItem._id, name: menuItem.name }
      }
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

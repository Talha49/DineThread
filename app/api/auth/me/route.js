import { NextResponse } from "next/server";
import { verifyJWT } from "@/lib/jwt";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Restaurant from "@/models/Restaurant";

export async function GET(req) {
  try {
    const token = req.cookies.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const decoded = await verifyJWT(token);
    if (!decoded) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    await dbConnect();
    const user = await User.findById(decoded.id).lean();
    
    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // Fetch restaurant data
    const restaurant = await Restaurant.findOne({ owner: user._id }).lean();

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        restaurantId: restaurant?.restaurantId || null,
        plan: restaurant?.plan || "free",
      }
    });
  } catch (error) {
    console.error("Me API Error:", error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}

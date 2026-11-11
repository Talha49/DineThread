import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Restaurant from "@/models/Restaurant";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (!slug || slug.length < 3) {
      return NextResponse.json({ available: false, message: "Too short" });
    }

    await dbConnect();
    const existing = await Restaurant.findOne({ restaurantId: slug.toLowerCase() });

    return NextResponse.json({ 
        available: !existing,
        message: existing ? "Already taken" : "Available"
    });
  } catch (error) {
    console.error("Slug check error:", error);
    return NextResponse.json({ available: false, message: "Error checking availability" }, { status: 500 });
  }
}

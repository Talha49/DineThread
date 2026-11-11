import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Restaurant from "@/models/Restaurant";

export async function GET() {
    await dbConnect();
    const restaurant = await Restaurant.findOne({});
    if (!restaurant) return NextResponse.json({ error: "No restaurant found" });
    
    return NextResponse.json({
        success: true,
        restaurantName: restaurant.name,
        vibeTokens: restaurant.experienceConfig.vibeTokens
    });
}

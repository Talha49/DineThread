import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import dbConnect from "@/lib/mongodb";
import Restaurant from "@/models/Restaurant";

export async function GET(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    const user = token ? await verifyJWT(token) : null;

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    let restaurant = await Restaurant.findOne({ owner: user.id });

    if (!restaurant) {
      return NextResponse.json({ message: "Restaurant not found" }, { status: 404 });
    }

    return NextResponse.json(restaurant);
  } catch (error) {
    console.error("Error fetching restaurant:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

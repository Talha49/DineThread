import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Restaurant from "@/models/Restaurant";
import AnalyticsEvent from "@/models/AnalyticsEvent";

export const dynamic = "force-dynamic";

// Public, unauthenticated by design - this is called from the public menu
// page itself, which has no owner session. Never trust the body beyond the
// two fields it declares, and never let a bad/missing restaurant 500 the
// visitor's page - tracking failing silently is fine, showing them a menu
// isn't.
export async function POST(req) {
  try {
    const { restaurantId, type } = await req.json();

    if (!restaurantId || !["view", "qr_scan"].includes(type)) {
      return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
    }

    await dbConnect();

    const restaurant = await Restaurant.findOne({
      restaurantId: { $regex: new RegExp(`^${restaurantId}$`, "i") },
    }).select({ _id: 1 }).lean();

    if (!restaurant) {
      return NextResponse.json({ message: "Restaurant not found" }, { status: 404 });
    }

    await AnalyticsEvent.create({ restaurant: restaurant._id, type });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Analytics track error:", error);
    // Still 200 - a tracking failure should never surface as an error to a visitor.
    return NextResponse.json({ ok: false });
  }
}

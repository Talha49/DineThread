import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import dbConnect from "@/lib/mongodb";
import Restaurant from "@/models/Restaurant";
import AnalyticsEvent from "@/models/AnalyticsEvent";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    const user = token ? await verifyJWT(token) : null;
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    await dbConnect();

    const restaurant = await Restaurant.findOne({ owner: user.id }).select({ _id: 1 }).lean();
    if (!restaurant) return NextResponse.json({ message: "Restaurant not found" }, { status: 404 });

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(startOfToday);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // today + 6 previous days = 7 buckets

    const [totalViews, totalScans, todayCount, dailyBuckets] = await Promise.all([
      AnalyticsEvent.countDocuments({ restaurant: restaurant._id, type: "view" }),
      AnalyticsEvent.countDocuments({ restaurant: restaurant._id, type: "qr_scan" }),
      AnalyticsEvent.countDocuments({ restaurant: restaurant._id, createdAt: { $gte: startOfToday } }),
      AnalyticsEvent.aggregate([
        { $match: { restaurant: restaurant._id, createdAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    // Fill in every day in the 7-day window, even ones with zero events -
    // a sparkline with missing days in the middle reads as broken, not quiet.
    const bucketMap = new Map(dailyBuckets.map((b) => [b._id, b.count]));
    const last7Days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      last7Days.push({ date: key, count: bucketMap.get(key) || 0 });
    }

    return NextResponse.json({
      totalViews,
      totalScans,
      todayCount,
      last7Days,
    });
  } catch (error) {
    console.error("Analytics summary error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

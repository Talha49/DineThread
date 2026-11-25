import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import dbConnect from "@/lib/mongodb";
import Table from "@/models/Table";
import Restaurant from "@/models/Restaurant";
import { CreateTableSchema } from "@/lib/validations";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    const user = token ? await verifyJWT(token) : null;

    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const restaurant = await Restaurant.findOne({ owner: user.id });
    if (!restaurant) return NextResponse.json({ message: "Restaurant not found" }, { status: 404 });

    const tables = await Table.find({ restaurant: restaurant._id }).sort({ createdAt: 1 });

    return NextResponse.json({ tables });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    const user = token ? await verifyJWT(token) : null;

    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const validation = CreateTableSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ message: "Invalid input", errors: validation.error.flatten() }, { status: 400 });
    }
    const { label } = validation.data;

    await dbConnect();
    const restaurant = await Restaurant.findOne({ owner: user.id });
    if (!restaurant) return NextResponse.json({ message: "Restaurant not found" }, { status: 404 });

    const existing = await Table.findOne({ restaurant: restaurant._id, label: { $regex: new RegExp(`^${label}$`, "i") } });
    if (existing) {
      return NextResponse.json({ message: "A table with this label already exists" }, { status: 400 });
    }

    const table = await Table.create({ restaurant: restaurant._id, label });

    return NextResponse.json({ table }, { status: 201 });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ message: "A table with this label already exists" }, { status: 400 });
    }
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import dbConnect from "@/lib/mongodb";
import Table from "@/models/Table";
import Restaurant from "@/models/Restaurant";
import { UpdateTableSchema } from "@/lib/validations";

export async function PATCH(req, { params }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    const user = token ? await verifyJWT(token) : null;

    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const validation = UpdateTableSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ message: "Invalid input", errors: validation.error.flatten() }, { status: 400 });
    }
    const { label, isActive } = validation.data;

    await dbConnect();
    const restaurant = await Restaurant.findOne({ owner: user.id });
    if (!restaurant) return NextResponse.json({ message: "Restaurant not found" }, { status: 404 });

    const table = await Table.findOne({ _id: id, restaurant: restaurant._id });
    if (!table) return NextResponse.json({ message: "Table not found" }, { status: 404 });

    if (label && label !== table.label) {
      const existing = await Table.findOne({
        restaurant: restaurant._id,
        label: { $regex: new RegExp(`^${label}$`, "i") },
        _id: { $ne: id },
      });
      if (existing) return NextResponse.json({ message: "A table with this label already exists" }, { status: 400 });
      table.label = label;
    }
    if (typeof isActive === "boolean") table.isActive = isActive;

    await table.save();

    return NextResponse.json({ table });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    const user = token ? await verifyJWT(token) : null;

    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    await dbConnect();
    const restaurant = await Restaurant.findOne({ owner: user.id });
    if (!restaurant) return NextResponse.json({ message: "Restaurant not found" }, { status: 404 });

    const table = await Table.findOne({ _id: id, restaurant: restaurant._id });
    if (!table) return NextResponse.json({ message: "Table not found" }, { status: 404 });

    await Table.deleteOne({ _id: id });

    return NextResponse.json({ message: "Table deleted" });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

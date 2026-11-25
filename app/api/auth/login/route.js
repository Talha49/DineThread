import { NextResponse } from "next/server";
import { signJWT } from "@/lib/jwt";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Restaurant from "@/models/Restaurant";
import { UserLoginSchema } from "@/lib/validations";

export async function POST(req) {
  try {
    const body = await req.json();
    const validatedFields = UserLoginSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json({ error: "Invalid email or password format" }, { status: 400 });
    }

    const { email, password } = validatedFields.data;
    const normalizedEmail = email.toLowerCase().trim();

    await dbConnect();
    const user = await User.findOne({ email: normalizedEmail }).select("+password");

    if (!user || !user.password) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Fetch associated restaurant if any
    const restaurant = await Restaurant.findOne({ owner: user._id }).lean();

    // Create JWT
    const token = await signJWT({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        restaurantId: restaurant?.restaurantId || null,
        plan: restaurant?.plan || "free",
      }
    });

    // Set HTTP-only cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


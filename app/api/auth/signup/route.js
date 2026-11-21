import { NextResponse } from "next/server";
import { UserRegisterSchema } from "@/lib/validations";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { signJWT } from "@/lib/jwt";

export async function POST(req) {
  try {
    const body = await req.json();

    // 1. Validate Input
    const validatedFields = UserRegisterSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        { message: "Invalid input", errors: validatedFields.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, password } = validatedFields.data;
    const normalizedEmail = email.toLowerCase().trim();

    await dbConnect();

    // 2. Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 }
      );
    }

    // 3. Create User (Password hashing handled by Mongoose pre-save hook)
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
    });

    // 4. Generate JWT session token
    const token = await signJWT({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
    });

    const response = NextResponse.json(
      {
        success: true,
        message: "User created successfully",
        userId: user._id.toString(),
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          restaurantId: null,
          plan: "free",
        }
      },
      { status: 201 }
    );

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
    console.error("Signup error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}


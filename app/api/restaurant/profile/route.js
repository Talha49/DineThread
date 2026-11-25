import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import dbConnect from "@/lib/mongodb";
import Restaurant from "@/models/Restaurant";
import { UpdateBusinessProfileSchema } from "@/lib/validations";

export async function PUT(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    const user = token ? await verifyJWT(token) : null;
    
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // 1. Get Restaurant
    const restaurant = await Restaurant.findOne({ owner: user.id });
    if (!restaurant) {
        return NextResponse.json({ message: "Restaurant not found" }, { status: 404 });
    }

    // 2. Validate Body
    const body = await req.json();
    console.log("Profile Rebuild - Incoming Body:", JSON.stringify(body, null, 2));

    const validation = UpdateBusinessProfileSchema.safeParse(body);

    if (!validation.success) {
        console.error("Profile Rebuild - Validation Fail:", validation.error.flatten());
        return NextResponse.json({ message: "Invalid input", errors: validation.error.flatten() }, { status: 400 });
    }

    // 3. Assign to the grouped object
    const bpData = validation.data.businessProfile;
    
    restaurant.businessProfile = {
        description: bpData.description || "",
        address: bpData.address || "",
        phone: bpData.phone || "",
        whatsapp: bpData.whatsapp || "",
        socialLinks: {
            instagram: bpData.socialLinks?.instagram || "",
            facebook: bpData.socialLinks?.facebook || "",
            twitter: bpData.socialLinks?.twitter || "",
        },
        openingHours: (bpData.openingHours || []).map(h => ({
            day: h.day,
            open: h.open || "09:00",
            close: h.close || "22:00",
            isClosed: !!h.isClosed
        }))
    };

    // Explicitly mark as modified
    restaurant.markModified('businessProfile');

    console.log("Profile Rebuild - Pre-save Object Keys:", Object.keys(restaurant.toObject()));
    console.log("Profile Rebuild - businessProfile defined in schema?", !!restaurant.schema.path('businessProfile'));

    const savedDoc = await restaurant.save();
    console.log("Profile Rebuild - Save Successful. Business profile in saved doc?", !!savedDoc.businessProfile);
    if (savedDoc.businessProfile) {
        console.log("Profile Rebuild - Saved Description:", savedDoc.businessProfile.description);
    }

    return NextResponse.json({ 
        message: "Business profile saved successfully", 
        restaurant: savedDoc 
    });

  } catch (error) {
    console.error("Profile Rebuild - CRITICAL ERROR:", error);
    
    // Gracefully handle Mongoose Validation Errors
    if (error.name === 'ValidationError') {
      const errorMessages = Object.values(error.errors).map(err => err.message);
      return NextResponse.json({ 
        message: "Validation Error", 
        errors: errorMessages 
      }, { status: 400 });
    }

    return NextResponse.json({ message: "Server error", detail: error.message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import dbConnect from "@/lib/mongodb";
import Restaurant from "@/models/Restaurant";
import { UpdateBrandingSchema } from "@/lib/validations";

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

    const body = await req.json();
    
    // 3. Validate Input
    const validation = UpdateBrandingSchema.safeParse(body);
    if (!validation.success) {
        return NextResponse.json({ 
            message: "Invalid input", 
            errors: validation.error.flatten() 
        }, { status: 400 });
    }

    const { brandColor, fontFamily, logoUrl, experienceConfig } = validation.data;

    // 4. Update Fields
    if (brandColor) restaurant.brandColor = brandColor;
    if (fontFamily) restaurant.fontFamily = fontFamily;
    if (logoUrl !== undefined) restaurant.logoUrl = logoUrl;
    
    if (experienceConfig) {
        // Import utilities for cleaning and merging
        const { deepMerge, removeUndefined } = await import('@/lib/object-utils');
        
        // Ensure experienceConfig root exists
        if (!restaurant.experienceConfig) {
            restaurant.experienceConfig = {};
        }
        
        // Update layoutID if provided
        if (experienceConfig.layoutID !== undefined) {
            restaurant.experienceConfig.layoutID = experienceConfig.layoutID;
        }
        
        // Update vibeTokens if provided
        if (experienceConfig.vibeTokens) {
            if (!restaurant.experienceConfig.vibeTokens) {
                restaurant.experienceConfig.vibeTokens = {};
            }
            if (experienceConfig.vibeTokens.dna) {
                const clean = removeUndefined(experienceConfig.vibeTokens.dna);
                const existing = removeUndefined(restaurant.experienceConfig.vibeTokens.dna || {});
                restaurant.experienceConfig.vibeTokens.dna = deepMerge(existing, clean);
            }
            if (experienceConfig.vibeTokens.palette) {
                const clean = removeUndefined(experienceConfig.vibeTokens.palette);
                const existing = removeUndefined(restaurant.experienceConfig.vibeTokens.palette || {});
                restaurant.experienceConfig.vibeTokens.palette = deepMerge(existing, clean);
            }
            if (experienceConfig.vibeTokens.atmosphere) {
                const clean = removeUndefined(experienceConfig.vibeTokens.atmosphere);
                const existing = removeUndefined(restaurant.experienceConfig.vibeTokens.atmosphere || {});
                restaurant.experienceConfig.vibeTokens.atmosphere = deepMerge(existing, clean);
            }
        }
        
        // Update themeConfig if provided - FULL REPLACE.
        // The Design Studio always sends a complete, self-contained config
        // (every field is filled in via validatePresetConfig on the client), so
        // deep-merging it onto the previous saved value is wrong: deepMerge can
        // only add/overwrite keys, never remove one that's missing from the new
        // payload. That silently left stale fields (e.g. an old background image
        // URL) stuck in the DB forever, even after switching background type or
        // hitting "Reset Studio". A full replace is what a config editor needs.
        if (experienceConfig.themeConfig) {
            restaurant.experienceConfig.themeConfig = removeUndefined(experienceConfig.themeConfig);
        }
        
        // Update layoutConfig if provided - CLEAN BOTH EXISTING AND NEW DATA
        if (experienceConfig.layoutConfig) {
            const clean = removeUndefined(experienceConfig.layoutConfig);
            const existing = removeUndefined(restaurant.experienceConfig.layoutConfig || {});
            restaurant.experienceConfig.layoutConfig = deepMerge(existing, clean);
        }
        
        // Update seasonalAtmosphere if provided - CLEAN BOTH EXISTING AND NEW DATA
        if (experienceConfig.seasonalAtmosphere) {
            const clean = removeUndefined(experienceConfig.seasonalAtmosphere);
            const existing = removeUndefined(restaurant.experienceConfig.seasonalAtmosphere || {});
            restaurant.experienceConfig.seasonalAtmosphere = deepMerge(existing, clean);
        }
        
        // Update visualDNA if provided - CLEAN BOTH EXISTING AND NEW DATA
        if (experienceConfig.visualDNA) {
            const clean = removeUndefined(experienceConfig.visualDNA);
            const existing = removeUndefined(restaurant.experienceConfig.visualDNA || {});
            restaurant.experienceConfig.visualDNA = deepMerge(existing, clean);
        }
        
        // Update designSystem if provided - FULL REPLACE (see themeConfig note above;
        // Design Studio always sends the complete {config, appliedPreset, lastEdited,
        // version} object, so merging onto the old one only reintroduces stale data).
        if (experienceConfig.designSystem) {
            restaurant.experienceConfig.designSystem = removeUndefined(experienceConfig.designSystem);
        }

        // Update customThemes if provided - FULL REPLACE. The client always
        // sends its complete local list (after appending or filtering out a
        // theme), so replacing is correct here for the same reason as
        // themeConfig/designSystem above.
        if (experienceConfig.customThemes !== undefined) {
            restaurant.experienceConfig.customThemes = experienceConfig.customThemes;
        }
        
        // Mark experienceConfig as modified to ensure Mongoose saves it
        restaurant.markModified('experienceConfig');
    }

    await restaurant.save();

    return NextResponse.json({ message: "Branding updated successfully", restaurant });

  } catch (error) {
    console.error("Error updating branding:", error);
    console.error("Error details:", error.message);
    
    // Gracefully handle Mongoose Validation Errors
    if (error.name === 'ValidationError') {
      const errorMessages = Object.values(error.errors).map(err => err.message);
      console.error("Validation errors:", errorMessages);
      return NextResponse.json({ 
        message: "Validation Error", 
        errors: errorMessages 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      message: "Server error", 
      error: error.message 
    }, { status: 500 });
  }
}

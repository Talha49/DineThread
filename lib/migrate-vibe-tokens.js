import dbConnect from "./mongodb";
import Restaurant from "../models/Restaurant";

/**
 * Migration Utility: Legacy Branding -> Vibe Studio Tokens
 * This script ensures all existing restaurants have the new vibeTokens structure
 * populated with their existing branding data to prevent any visual regressions.
 */
export async function migrateToVibeTokens() {
    await dbConnect();
    
    console.log("🚀 Starting Vibe Token Migration...");
    
    const restaurants = await Restaurant.find({});
    let migratedCount = 0;
    
    for (const restaurant of restaurants) {
        // Skip if already migrated or has deep token data (optional check)
        // We force update to ensure the structure is exactly as per the new schema
        
        const legacyDNA = restaurant.experienceConfig?.visualDNA || {};
        const legacyColor = restaurant.brandColor || "#4f46e5";
        
        const vibeTokens = {
            dna: {
                radius: legacyDNA.borderRadius ? `${legacyDNA.borderRadius}px` : "1.5rem",
                glass: legacyDNA.glassmorphism || 20,
                motion: restaurant.experienceConfig?.motionProfile || "liquid-spring",
                glow: "none"
            },
            palette: {
                primary: legacyColor,
                accent: "#f43f5e", // Default accent
                surface: "glass-white",
                background: "minimal"
            },
            atmosphere: {
                active: "none",
                intensity: 50,
                effects: []
            }
        };

        await Restaurant.findByIdAndUpdate(restaurant._id, {
            $set: {
                "experienceConfig.vibeTokens": vibeTokens
            }
        });
        
        migratedCount++;
    }
    
    console.log(`✅ Migration Complete. ${migratedCount} restaurants updated.`);
    return migratedCount;
}

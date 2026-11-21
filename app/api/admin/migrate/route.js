import { NextResponse } from "next/server";
import { migrateToVibeTokens } from "@/lib/migrate-vibe-tokens";

/**
 * Temp Admin Migration Trigger
 * This route should be deleted after production migration.
 */
export async function GET() {
    try {
        const count = await migrateToVibeTokens();
        return NextResponse.json({ 
            success: true, 
            message: `Migration successful. ${count} restaurants updated.` 
        });
    } catch (error) {
        console.error("Migration failed:", error);
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
}

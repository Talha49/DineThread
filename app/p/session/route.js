import { NextResponse } from "next/server";
import { isSameOrigin, newOrderSession, ORDER_SESSION_COOKIE, readOrderSession, submissionMode } from "@/lib/order-session";

export const dynamic = "force-dynamic";

export async function GET(req) {
    return NextResponse.json({ active: !!readOrderSession(req), mode: submissionMode() }, {
        headers: { "Cache-Control": "no-store" },
    });
}

export async function POST(req) {
    if (!isSameOrigin(req)) return NextResponse.json({ message: "Invalid origin" }, { status: 403 });
    const existing = readOrderSession(req);
    const response = NextResponse.json({ active: true, mode: submissionMode() }, {
        headers: { "Cache-Control": "no-store" },
    });
    if (!existing) {
        response.cookies.set(ORDER_SESSION_COOKIE, newOrderSession(), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 30,
        });
    }
    return response;
}

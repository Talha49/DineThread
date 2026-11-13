import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { PlaceOrderSchema } from "@/lib/validations";
import { isSameOrigin, orderSessionHash, submissionMode } from "@/lib/order-session";
import { OrderSubmissionError, submitOrder } from "@/lib/order-submission";

export const dynamic = "force-dynamic";

export async function POST(req) {
    try {
        if (!isSameOrigin(req)) return NextResponse.json({ message: "Invalid origin" }, { status: 403 });
        const body = await req.json();
        const validation = PlaceOrderSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ message: "Invalid order", code: "INVALID_ORDER", errors: validation.error.flatten() }, { status: 400 });
        }
        const mode = submissionMode();
        const requestId = body.requestId;
        if (mode === "recovery" && (typeof requestId !== "string" || !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(requestId))) {
            return NextResponse.json({ message: "A valid purchase identifier is required", code: "INVALID_REQUEST_ID" }, { status: 400 });
        }
        const ownerHash = orderSessionHash(req);
        if (!ownerHash) throw new OrderSubmissionError("Your browser session is missing. Contact staff before retrying an uncertain order.", 401, "SESSION_REQUIRED");
        await dbConnect();
        const result = await submitOrder({ data: validation.data, requestId: mode === "recovery" ? requestId.toLowerCase() : undefined, ownerHash, mode });
        return NextResponse.json(result, { status: result.replayed ? 200 : 201, headers: { "Cache-Control": "no-store" } });
    } catch (error) {
        if (error instanceof SyntaxError) return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
        if (error instanceof OrderSubmissionError) {
            return NextResponse.json({ message: error.message, code: error.code }, { status: error.status });
        }
        console.error("Order submission failed:", error.name, error.code);
        return NextResponse.json({ message: "The order could not be confirmed. Keep this purchase and try again.", code: "UNCONFIRMED" }, { status: 500 });
    }
}

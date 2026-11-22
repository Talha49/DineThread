import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { PlaceOrderSchema } from "@/lib/validations";
import { isSameOrigin, orderSessionHash, submissionMode } from "@/lib/order-session";
import { OrderSubmissionError, submitOrder, validRequestId } from "@/lib/order-submission";

export const dynamic = "force-dynamic";

export async function POST(req) {
    try {
        if (!isSameOrigin(req)) return NextResponse.json({ message: "Invalid origin" }, { status: 403 });
        const body = await req.json();
        const parsed = PlaceOrderSchema.safeParse(body);
        if (!parsed.success || !validRequestId(body.requestId)) return NextResponse.json({ message: "Invalid purchase" }, { status: 400 });
        await dbConnect();
        // If acceptance wins the insert race, return that confirmation instead
        // of promising that an already-placed order was cancelled.
        const result = await submitOrder({ data: parsed.data, requestId: body.requestId, ownerHash: orderSessionHash(req), mode: submissionMode(), cancel: true });
        return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
    } catch (error) {
        if (error instanceof OrderSubmissionError) return NextResponse.json({ message: error.message, code: error.code }, { status: error.status });
        if (error instanceof SyntaxError) return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
        return NextResponse.json({ message: "Cancellation is not confirmed. Keep this purchase and try again." }, { status: 500 });
    }
}

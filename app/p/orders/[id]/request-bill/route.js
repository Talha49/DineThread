import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { isSameOrigin, orderSessionHash } from "@/lib/order-session";
import { applyWorkflow, WorkflowError } from '@/lib/order-workflow';
import { BillRequestSchema } from '@/lib/validations';
import { traceWorkflow } from '@/lib/workflow-research';

export const dynamic = "force-dynamic";

// Deliberately narrow: a customer can only flip this one flag, never set
// status directly (that stays owner/kitchen-only via /api/orders).
export async function POST(req, { params }) {
    return traceWorkflow(req, () => handleBill(req, params));
}
async function handleBill(req, params) {
    try {
        if (!isSameOrigin(req)) return NextResponse.json({ message: "Invalid origin" }, { status: 403 });
        const { id } = await params;
        if (!/^[0-9a-fA-F]{24}$/.test(id)) {
            return NextResponse.json({ message: "Order not found" }, { status: 404 });
        }

        const ownerHash = orderSessionHash(req);
        if (!ownerHash) return NextResponse.json({ message: "Order not found in this browser session" }, { status: 404 });
        await dbConnect();
        const validation = BillRequestSchema.safeParse(await req.json());
        if (!validation.success) return NextResponse.json({ message: 'Invalid bill request' }, { status: 400 });
        const result = await applyWorkflow({ scope: { _id: id, ownerHash }, ...validation.data, type: 'bill', actor: `customer:${ownerHash}` });
        return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
    } catch (error) {
        if (error instanceof WorkflowError) return NextResponse.json({ message: error.message, code: error.code }, { status: error.status });
        if (error instanceof SyntaxError) return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 });
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}

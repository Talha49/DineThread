import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import dbConnect from "@/lib/mongodb";
import Restaurant from "@/models/Restaurant";
import { UpdateOrderStatusSchema } from "@/lib/validations";
import { applyWorkflow, WorkflowError } from '@/lib/order-workflow';
import { isSameOrigin } from '@/lib/order-session';
import { traceWorkflow } from '@/lib/workflow-research';

export async function PATCH(req, { params }) {
    return traceWorkflow(req, () => handlePatch(req, params));
}
async function handlePatch(req, params) {
    try {
        if (!isSameOrigin(req)) return NextResponse.json({ message: 'Invalid origin' }, { status: 403 });
        const cookieStore = await cookies();
        const token = cookieStore.get("auth-token")?.value;
        const user = token ? await verifyJWT(token) : null;

        if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        if (!/^[0-9a-fA-F]{24}$/.test(id)) return NextResponse.json({ message: 'Order not found' }, { status: 404 });
        const body = await req.json();
        const validation = UpdateOrderStatusSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ message: "Invalid input", errors: validation.error.flatten() }, { status: 400 });
        }

        await dbConnect();
        const restaurant = await Restaurant.findOne({ owner: user.id });
        if (!restaurant) return NextResponse.json({ message: "Restaurant not found" }, { status: 404 });

        const result = await applyWorkflow({ scope: { _id: id, restaurant: restaurant._id }, ...validation.data, type: 'status', actor: `staff:${user.id}` });
        return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
    } catch (error) {
        if (error instanceof WorkflowError) return NextResponse.json({ message: error.message, code: error.code }, { status: error.status });
        if (error instanceof SyntaxError) return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 });
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}

import { appendFile } from "node:fs/promises";

// Opt-in local experiment instrumentation. Labels are observations only; they
// never participate in validation, purchase identity or duplicate prevention.
export async function traceOrderAttempt(req, action) {
    const file = process.env.ORDER_RESEARCH_LOG;
    const local = /^mongodb:\/\/(127\.0\.0\.1|localhost):\d+\//.test(process.env.MONGODB_URI || "");
    if (process.env.ORDER_RESEARCH_ENABLED !== "1" || !file || !local) return action();
    const label = {
        purchase: req.headers.get("x-research-purchase"),
        attempt: req.headers.get("x-research-attempt"),
        mode: process.env.ORDER_SUBMISSION_MODE || "recovery",
    };
    const started = process.hrtime.bigint().toString();
    await appendFile(file, JSON.stringify({ ...label, event: "start", tick: started }) + "\n");
    const response = await action();
    const body = await response.clone().json();
    await appendFile(file, JSON.stringify({ ...label, event: "end", tick: process.hrtime.bigint().toString(), status: response.status, orderId: body.order?._id, total: body.order?.total, replayed: body.replayed, outcome: body.outcome }) + "\n");
    return response;
}

import { createHash, randomBytes } from "node:crypto";

export const ORDER_SESSION_COOKIE = "dinethread-order-session";

export function readOrderSession(req) {
    const value = req.cookies.get(ORDER_SESSION_COOKIE)?.value;
    return value && /^[a-f0-9]{64}$/.test(value) ? value : null;
}

export function orderSessionHash(req) {
    const session = readOrderSession(req);
    return session ? createHash("sha256").update(session).digest("hex") : null;
}

export function newOrderSession() {
    return randomBytes(32).toString("hex");
}

export function isSameOrigin(req) {
    const origin = req.headers.get("origin");
    if (!origin) return true;
    try {
        const source = new URL(origin);
        // Next's internal URL can use localhost behind a reverse proxy.
        // Host is the browser-facing authority and cannot be set by fetch().
        const host = req.headers.get("host") || new URL(req.url).host;
        return (source.protocol === "https:" || source.protocol === "http:") && source.host === host;
    } catch {
        return false;
    }
}

export function submissionMode() {
    // Baseline is an explicit server-side switch for isolated research runs.
    return process.env.ORDER_SUBMISSION_MODE === "baseline" ? "baseline" : "recovery";
}

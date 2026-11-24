import { appendFile } from 'node:fs/promises';

// Synthetic local timing only. No scheduling delay or policy change is injected.
export async function traceWorkflow(req, action) {
    const file = process.env.WORKFLOW_RESEARCH_LOG;
    const local = /^mongodb:\/\/(127\.0\.0\.1|localhost):\d+\//.test(process.env.MONGODB_URI || '');
    if (!file || process.env.ORDER_RESEARCH_ENABLED !== '1' || !local) return action();
    const label = { history: req.headers.get('x-research-history'), attempt: req.headers.get('x-research-attempt') };
    await appendFile(file, JSON.stringify({ ...label, event: 'start', tick: process.hrtime.bigint().toString() }) + '\n');
    const response = await action(), body = await response.clone().json();
    await appendFile(file, JSON.stringify({ ...label, event: 'end', tick: process.hrtime.bigint().toString(), status: response.status, version: body.order?.workflowVersion, action: body.action, code: body.code }) + '\n');
    return response;
}

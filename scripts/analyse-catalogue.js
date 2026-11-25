const fs = require('node:fs');
const path = require('node:path');
const { check } = require('./catalogue-oracle');
const records = fs.readFileSync(path.join(process.argv[2], 'observations.jsonl'), 'utf8').trim().split('\n').map(JSON.parse);
const median = values => { const a = [...values].sort((x, y) => x - y), m = Math.floor(a.length / 2); return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2; };
const stats = values => ({ count: values.length, median: median(values), min: Math.min(...values), max: Math.max(...values) });
const result = { source: path.basename(process.argv[2]), violations: records.filter(r => check(r).length).length, versions: {}, conditions: {} };
for (const mode of ['baseline', 'recovery']) {
    const rows = records.filter(r => r.mode === mode);
    result.versions[mode] = { observations: rows.length, accepted: rows.filter(r => r.accepted.length === 1).length, correctionRejections: rows.filter(r => r.oracle.rejected).length, priceConfirmationResponses: rows.flatMap(r => r.attempts).filter(a => a.body.code === 'MENU_CHANGED').length, checkoutMs: stats(rows.map(r => r.checkoutMs)), validationMs: stats(rows.flatMap(r => r.validationMs)), violations: rows.filter(r => check(r).length).length };
}
for (const condition of [...new Set(records.map(r => r.condition))]) {
    const paired = [];
    for (const round of [...new Set(records.map(r => r.round))]) {
        const values = mode => records.filter(r => r.condition === condition && r.round === round && r.mode === mode).map(r => r.checkoutMs);
        paired.push(median(values('recovery')) - median(values('baseline')));
    }
    result.conditions[condition] = { pairedRoundMedianCheckoutDifferenceMs: stats(paired) };
}
fs.writeFileSync('research/catalogue/summary.json', JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));

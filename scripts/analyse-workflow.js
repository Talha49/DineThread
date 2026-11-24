const fs = require('node:fs');
const path = require('node:path');
const { check } = require('./workflow-oracle');
const rows = fs.readFileSync(path.join(process.argv[2], 'observations.jsonl'), 'utf8').trim().split('\n').map(JSON.parse);
const median = values => { const a = [...values].sort((x, y) => x - y), m = Math.floor(a.length / 2); return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2; };
const stats = values => ({ count: values.length, median: median(values), min: Math.min(...values), max: Math.max(...values) });
const result = { source: path.basename(process.argv[2]), versions: {}, schedules: {} };
for (const mode of ['baseline', 'recovery']) {
    const current = rows.filter(r => r.mode === mode), defects = {};
    for (const row of current) for (const defect of check(row)) defects[defect] = (defects[defect] || 0) + 1;
    result.versions[mode] = { histories: current.length, defectiveHistories: current.filter(r => check(r).length).length, defects, concurrentHistories: current.filter(r => r.schedule !== 'delayed').length, overlapEstablished: current.filter(r => r.maxOverlap >= 2).length, validFollowups: current.filter(r => r.attempts.some(a => a.index === 'refreshed' && a.status === 200)).length, historyMedianApiMs: stats(current.map(r => median(r.attempts.map(a => a.elapsedMs)))) };
}
for (const schedule of [...new Set(rows.map(r => r.schedule))]) {
    const differences = [];
    for (const round of [...new Set(rows.map(r => r.round))]) {
        const a = rows.find(r => r.round === round && r.schedule === schedule && r.mode === 'baseline');
        const b = rows.find(r => r.round === round && r.schedule === schedule && r.mode === 'recovery');
        differences.push(median(b.attempts.map(t => t.elapsedMs)) - median(a.attempts.map(t => t.elapsedMs)));
    }
    result.schedules[schedule] = { pairedHistoryMedianApiDifferenceMs: stats(differences) };
}
fs.writeFileSync('research/workflow/summary.json', JSON.stringify(result, null, 2)); console.log(JSON.stringify(result, null, 2));

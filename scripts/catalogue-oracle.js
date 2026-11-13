// Independent fixed-fixture oracle. Do not import application pricing here.
function expected(condition, size, mode) {
    return {
        rejected: ['unavailable', 'deleted-option'].includes(condition),
        conflicts: mode === 'baseline' ? 0 : ({ increase: 1, decrease: 1, 'modifier-price': 1, 'second-change': 2 }[condition] || 0),
        totalPence: 1100 * size + ({ increase: 200, decrease: -200, 'modifier-price': 50, 'second-change': mode === 'baseline' ? 200 : 300 }[condition] || 0),
    };
}
function check({ condition, size, mode, attempts, accepted }) {
    const oracle = expected(condition, size, mode), defects = [];
    if (accepted.length !== (oracle.rejected ? 0 : 1)) defects.push('accepted-count');
    if (!oracle.rejected && accepted.some(o => Math.round(o.total * 100) !== oracle.totalPence)) defects.push('accepted-total');
    if (attempts.filter(a => a.body.code === 'MENU_CHANGED').length !== oracle.conflicts) defects.push('confirmation-count');
    if (oracle.rejected && attempts.at(-1).body.code !== 'INVALID_MENU') defects.push('correction-response');
    return defects;
}
module.exports = { expected, check };
if (require.main === module) {
    const fs = require('node:fs');
    const records = fs.readFileSync(process.argv[2], 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse);
    const failures = records.filter(r => check(r).length);
    console.log(JSON.stringify({ observations: records.length, failures: failures.map(r => ({ round: r.round, condition: r.condition, size: r.size, mode: r.mode, defects: check(r) })) }, null, 2));
    process.exitCode = failures.length ? 1 : 0;
}

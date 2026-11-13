const fs = require('node:fs');
const path = require('node:path');
const folders = {
  baselineKeyboard: 'accessibility-baseline-keyboard-1794590305450',
  revisedKeyboard: 'accessibility-recovery-keyboard-1794595000192',
  baselineChromium: 'accessibility-baseline-axe-1794594733235',
  revisedChromium: 'accessibility-recovery-axe-1794595704683',
  baselineFirefox: 'accessibility-baseline-axe-1794595353743',
  revisedFirefox: 'accessibility-recovery-axe-1794595920330',
};
const summary = {};
for (const [name, folder] of Object.entries(folders)) {
  const runs = JSON.parse(fs.readFileSync(path.join('qa-results', folder, 'results.json')));
  const states = runs.flatMap(r => r.states);
  const rules = states.flatMap(s => (s.violations || []).map(v => v.id));
  summary[name] = { folder, runs: runs.length, functionalPass: runs.filter(r => r.functionalPass).length,
    states: states.length, overflow: states.filter(s => s.overflow).length,
    blockedKeyboardSteps: runs.flatMap(r => r.keyboard).filter(k => !k.reachable).length,
    statesWithViolations: states.filter(s => s.violations?.length).length,
    ruleOccurrences: rules.length, uniqueRules: [...new Set(rules)].sort() };
}
fs.writeFileSync('research/accessibility/summary.json', JSON.stringify(summary, null, 2) + '\n');
console.log(JSON.stringify(summary, null, 2));

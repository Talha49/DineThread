// Summarise actual evidence without mixing pilots with measured observations.
const fs=require('node:fs/promises');
const path=require('node:path');
const {gzipSync}=require('node:zlib');
const {createHash}=require('node:crypto');
const assert=require('node:assert/strict');
const {median,percentile}=require('./order-api-experiment');
const {root}=require('./order-test-environment');
function sum(rows, key) {
 return rows.reduce((total, row) => {
  assert.ok(Number.isSafeInteger(row[key]) && row[key] >= 0, 'Invalid batch count: ' + key);
  return total + row[key];
 }, 0);
}
const fmt=n=>n===null?'n/a':n.toFixed(2);
const spread=values=>values.length?`${fmt(percentile(values,.25))}-${fmt(percentile(values,.75))}`:'n/a';
async function jsonl(file){return(await fs.readFile(file,'utf8')).trim().split('\n').filter(Boolean).map(JSON.parse);}
async function main(){
 const [apiPath, browserPath, flag, destination, ...extra] = process.argv.slice(2);
 if (!apiPath || !browserPath || flag !== '--out' || !destination || extra.length) {
  throw new Error('Usage: node scripts/analyse-order-results.js API_DIR BROWSER_DIR --out NEW_DIRECTORY');
 }
 const apiDir = await fs.realpath(apiPath);
 const browserDir = await fs.realpath(browserPath);
 const parent = await fs.realpath(path.dirname(path.resolve(destination)));
 const target = path.join(parent, path.basename(path.resolve(destination)));
 for (const source of [apiDir, browserDir, await fs.realpath(path.join(root, 'research/order-recovery'))]) {
  const relative = path.relative(source, target);
  if (!relative || (!relative.startsWith('..' + path.sep) && relative !== '..' && !path.isAbsolute(relative))) {
   throw new Error('Output must be outside all input and archive directories.');
  }
 }
 async function requireNewTarget() {
  try { await fs.lstat(target); }
  catch (error) { if (error.code === 'ENOENT') return; throw error; }
  throw new Error('Output already exists: ' + target);
 }
 await requireNewTarget();
 const apiResult=JSON.parse(await fs.readFile(path.join(apiDir,'results.json'),'utf8'));
 const browserResult=JSON.parse(await fs.readFile(path.join(browserDir,'results.json'),'utf8'));
 assert.ok(apiResult.pilot === false && browserResult.pilot === false, 'Both runs must be recorded as measured.');
 const api=apiResult.results,browser=browserResult.results,attempts=await jsonl(path.join(apiDir,'api-attempts.jsonl'));

 const conditions=[...new Set(api.map(r=>r.condition))], modes=['baseline','recovery'];
 const aggregates=[];
 for(const condition of conditions)for(const mode of modes){
  const rows=api.filter(r=>r.condition===condition&&r.mode===mode);
  const calls=attempts.filter(r=>r.condition===condition&&r.mode===mode);
  const creates=calls.filter(r=>r.status>=200&&r.status<300&&r.body?.order&&!r.body.replayed).map(r=>r.elapsedMs);
  const replays=calls.filter(r=>r.status>=200&&r.status<300&&r.body?.order&&r.body.replayed).map(r=>r.elapsedMs);
  const overlaps=rows.map(r=>r.minimumConcurrentOverlap).filter(n=>n!==null);
  aggregates.push({
   condition, mode, batches:rows.length,
   purchases:sum(rows,'purchases'), storedOrders:sum(rows,'storedOrders'),
   duplicatePurchases:sum(rows,'duplicatePurchases'), extraOrders:sum(rows,'extraOrders'),
   lostPurchases:sum(rows,'lostPurchases'), mergedOrders:sum(rows,'mergedOrders'),
   incorrectTotals:sum(rows,'incorrectTotals'), recovered:sum(rows,'recovered'),
   conflicts:sum(rows,'conflicts'), minimumConcurrentOverlap:overlaps.length?Math.min(...overlaps):null,
   creationBatchMedianMs:median(rows.map(r=>r.creationMedianMs).filter(n=>n!==null)),
   creationBatchIqr:spread(rows.map(r=>r.creationMedianMs).filter(n=>n!==null)),
   creationAttemptP95Ms:percentile(creates,.95),
   replayBatchMedianMs:median(rows.map(r=>r.replayMedianMs).filter(n=>n!==null)),
   replayAttemptP95Ms:percentile(replays,.95),
  });
 }
 const deltas=conditions.map(condition=>{
  const a=api.filter(r=>r.condition===condition&&r.mode==='baseline'),b=api.filter(r=>r.condition===condition&&r.mode==='recovery');
  const paired=a.filter(x=>x.creationMedianMs!==null&&b.find(y=>y.batch===x.batch).creationMedianMs!==null).map(x=>b.find(y=>y.batch===x.batch).creationMedianMs-x.creationMedianMs);
  return {condition,medianDifferenceMs:median(paired),iqr:spread(paired),minMs:paired.length?Math.min(...paired):null,maxMs:paired.length?Math.max(...paired):null};
 });
 const csvHeader=Object.keys(aggregates[0]);
 const manifestApi=JSON.parse(await fs.readFile(path.join(apiDir,'source-manifest.json'),'utf8'));
 const manifestBrowser=JSON.parse(await fs.readFile(path.join(browserDir,'source-manifest.json'),'utf8'));
 const protocol=JSON.parse(await fs.readFile(path.join(apiDir,'protocol.json'),'utf8'));
 if(manifestApi.commit!==manifestBrowser.commit||manifestApi.buildId!==manifestBrowser.buildId)throw new Error('Measured runs used different code/build versions.');
 assert.ok(manifestApi.commit && manifestApi.buildId, 'Missing measured build identity');
 assert.deepEqual(protocol, JSON.parse(await fs.readFile(path.join(browserDir,'protocol.json'),'utf8')), 'Protocol differs between runs');
 assert.deepEqual(api, await jsonl(path.join(apiDir,'api-batches.jsonl')));
 assert.deepEqual(browser, await jsonl(path.join(browserDir,'browser-results.jsonl')));
 assert.equal(manifestApi.dirty,'','API run did not use a clean checkout');
 assert.equal(manifestBrowser.dirty,'','Browser run did not use a clean checkout');
 assert.deepEqual(manifestApi.hashes,manifestBrowser.hashes,'Source files changed between measured runs');
 assert.deepEqual(conditions,protocol.conditions,'Measured API conditions do not match the frozen protocol');
 assert.equal(api.length,conditions.length*2*protocol.apiBatches);
 assert.equal(new Set(api.map(r=>`${r.condition}/${r.mode}/${r.batch}`)).size,api.length);
 assert.ok(api.every(r=>r.purchases===protocol.purchasesPerBatch));
 assert.equal(browser.length,protocol.browserConditions.length*2*protocol.browserPairedTrialsPerCondition);
 assert.equal(new Set(browser.map(r=>`${r.condition}/${r.mode}/${r.trial}`)).size,browser.length);
 for(const condition of conditions)for(const mode of modes)assert.equal(api.filter(r=>r.condition===condition&&r.mode===mode).length,protocol.apiBatches);
 for(const condition of protocol.browserConditions)for(const mode of modes)assert.equal(browser.filter(r=>r.condition===condition&&r.mode===mode).length,protocol.browserPairedTrialsPerCondition);
 const copies = { normal:1, sequential:3, 'two-copy':2, 'five-copy':5, 'separate-identical':1, 'changed-payload':2, 'lost-confirmation':2 };
 const attemptKeys = new Set(attempts.map(r => [r.mode,r.purchase,r.attempt].join('/')));
 assert.equal(attemptKeys.size, attempts.length, 'Repeated attempt record');
 for (const attempt of attempts) {
  assert.ok(attempt.purchase.startsWith(attempt.condition + '/' + attempt.batch + '/'), 'Attempt condition or batch differs from purchase');
 }
 let expectedAttempts = 0;
 for (const row of api) {
  assert.ok(Number.isInteger(row.batch) && row.batch >= 0 && row.batch < protocol.apiBatches);
  for (let i = 0; i < row.purchases; i++) {
   for (let j = 0; j < copies[row.condition]; j++) {
    expectedAttempts++;
    assert.ok(attemptKeys.has([row.mode,row.condition,row.batch,i,j].join('/')), 'Missing raw attempt');
   }
  }
 }
 assert.equal(attempts.length, expectedAttempts);
 const apiFaults = await jsonl(path.join(apiDir, 'faults.jsonl'));
 const dropped = attempts.filter(r => r.condition === 'lost-confirmation' && r.attempt === 0);
 const faultKeys = new Set(apiFaults.map(f => f.mode + '/' + f.purchase));
 assert.equal(apiFaults.length, dropped.length, 'Incomplete API fault log');
 assert.equal(faultKeys.size, apiFaults.length, 'Repeated API fault record');
 assert.ok(apiFaults.every(f => f.event === 'drop-after-commit' && f.committedId), 'Missing committed order on fault');
 assert.ok(dropped.every(r => r.status === null && faultKeys.has(r.mode + '/' + r.purchase)), 'Missing dropped confirmation');
 const browserFaults = await jsonl(path.join(browserDir, 'browser-faults.jsonl'));
 const trialKey = row => [row.condition, row.mode, row.trial].join('/');
 const faultsByTrial = new Map(browserFaults.map(f => [trialKey(f), f]));
 assert.equal(browserFaults.length, browser.length, 'Incomplete browser fault log');
 assert.equal(faultsByTrial.size, browser.length, 'Repeated browser fault record');
 for (const row of browser) {
  const fault = faultsByTrial.get(trialKey(row));
  assert.ok(fault?.verifiedBeforeAbort === true && fault.committedId && fault.committedId === row.acceptedId
      && fault.total === row.acceptedTotal, 'Browser fault does not match accepted order');
  assert.equal(typeof row.recovered, 'boolean', 'Missing browser recovery outcome');
 }
 for (const row of browser) assert.ok(Number.isInteger(row.trial) && row.trial >= 0 && row.trial < protocol.browserPairedTrialsPerCondition);
 const failures = [];
 for (const row of api) {
  if (row.mode === 'recovery' && (row.extraOrders || row.lostPurchases || row.mergedOrders || row.incorrectTotals ||
      (row.condition === 'changed-payload' && row.conflicts !== row.purchases) ||
      (row.condition === 'lost-confirmation' && row.recovered !== row.purchases))) {
   failures.push({type:'recovery-outcome', condition:row.condition, batch:row.batch});
  }
  if (['two-copy','five-copy'].includes(row.condition) && !(row.minimumConcurrentOverlap >= 2)) {
   failures.push({type:'unverified-overlap', mode:row.mode, condition:row.condition, batch:row.batch});
  }
 }
 for (const row of browser.filter(r => r.mode === 'recovery' && !r.recovered)) {
  failures.push({type:'browser-recovery', condition:row.condition, trial:row.trial});
 }
 const lines=[
 '# Aby – measured order recovery results','',
 `Measured implementation: ${manifestApi.commit}. Next.js build: ${manifestApi.buildId}. Protocol frozen: ${protocol.frozenAt}.`,
 '',
 `Local synthetic trials. Acceptance issues recorded: ${failures.length}. See summary.json for individual issues.`,
 '',
 '## API correctness','',
 '| Condition | Version | Intended purchases | Accepted orders | Extra orders | Lost purchases | Merged orders | Original-confirmation recoveries |',
 '|---|---|---:|---:|---:|---:|---:|---:|',
 ...aggregates.map(r=>`| ${r.condition} | ${r.mode} | ${r.purchases} | ${r.storedOrders} | ${r.extraOrders} | ${r.lostPurchases} | ${r.mergedOrders} | ${r.condition==='lost-confirmation'?`${r.recovered}/${r.purchases}`:'not interrupted'} |`),
 '',
 '',
 '## Response time','',
 'Creation values below are medians of the 20 batch medians; IQRs describe those batch medians. The paired difference uses recovery minus baseline for the same batch. P95 values in the CSV/JSON describe individual successful creation or replay attempts, not independent experimental samples. Failed attempts and dropped confirmations remain in the raw attempt log.',
 '',
 '| Condition | Baseline creation median (ms) | Recovery creation median (ms) | Paired median difference (ms) | Paired difference IQR (ms) |',
 '|---|---:|---:|---:|---|',
 ...deltas.map(d=>`| ${d.condition} | ${fmt(aggregates.find(r=>r.condition===d.condition&&r.mode==='baseline').creationBatchMedianMs)} | ${fmt(aggregates.find(r=>r.condition===d.condition&&r.mode==='recovery').creationBatchMedianMs)} | ${fmt(d.medianDifferenceMs)} | ${d.iqr} |`),
 '',
 'A missing creation timing is marked n/a when every creation confirmation was intentionally dropped. These timings compare the combined implementations. Baseline retry-created orders and recovery replays perform different work. They do not isolate index cost or establish a production latency guarantee.',
 '',
 '## Browser recovery','',
 '| Interrupted-confirmation condition | Baseline recovery | Recovery design | Recovery-design median time (ms) | IQR (ms) | Range (ms) |',
 '|---|---:|---:|---:|---|---|',
 ...protocol.browserConditions.map(condition=>{
  const a=browser.filter(r=>r.mode==='baseline'&&r.condition===condition);
  const b=browser.filter(r=>r.mode==='recovery'&&r.condition===condition);
  const times=b.filter(r=>r.recovered && Number.isFinite(r.recoveryMs)).map(r=>r.recoveryMs);
  return `| ${condition} | ${a.filter(r=>r.recovered).length}/${a.length} | ${b.filter(r=>r.recovered).length}/${b.length} | ${fmt(median(times))} | ${spread(times)} | ${fmt(times.length?Math.min(...times):null)}-${fmt(times.length?Math.max(...times):null)} |`;
 }),
 '',
 'Recovery checks require the original stored identifier, accepted total and a single order. A quickly displayed second order counts as a recovery failure. Each restart trial retains MongoDB and the browser context while restarting the application process. Timing starts at the first permitted retry after reconnection; server startup/page-loading time is outside that timer.',
 '',
 ];
 const lock = await fs.open(target + '.lock','wx');
 let stage;
 try {
 await requireNewTarget();
 stage = await fs.mkdtemp(path.join(parent,'.order-analysis-'));
 const output = stage;
 await fs.writeFile(path.join(output,'api-summary.csv'),[csvHeader.join(','),...aggregates.map(row=>csvHeader.map(k=>row[k]??'').join(','))].join('\n')+'\n');
 await fs.writeFile(path.join(output,'summary.json'),JSON.stringify({commit:manifestApi.commit, buildId:manifestApi.buildId, api:aggregates,pairedCreationDifferences:deltas,browser,failures},null,2));
 await fs.writeFile(path.join(output,'RESULTS.md'),lines.join('\n'));
 const evidence=path.join(output,'evidence');await fs.mkdir(evidence,{recursive:true});
 const sharedFiles = ['protocol.json', 'results.json', 'source-manifest.json', 'server-baseline.jsonl', 'server-recovery.jsonl'];
 const apiFiles = [...sharedFiles, 'api-attempts.jsonl', 'api-batches.jsonl', 'database-observations.jsonl', 'expected-workload.json', 'environment.json', 'faults.jsonl'];
 const screenshots = modes.flatMap(mode => protocol.browserConditions.map(condition => mode + '-' + condition + '.png'));
 const browserFiles = [...sharedFiles, 'browser-expected.jsonl', 'browser-faults.jsonl', 'browser-results.jsonl', 'browser-version.txt', ...screenshots];
 const dirs=[['api-measured',apiDir,apiFiles],['browser-measured',browserDir,browserFiles]];
 const manifest=[];
 for(const [label,dir,files]of dirs)for(const file of files.sort()){
  const bytes=await fs.readFile(path.join(dir,file));
  assert.ok(bytes.length > 0, 'Empty evidence file: ' + file);
  const encoding=file.endsWith('.png')?'identity':'gzip';
  const destination=`${label}--${file}${encoding==='gzip'?'.gz':''}`;
  await fs.writeFile(path.join(evidence,destination),encoding==='gzip'?gzipSync(bytes):bytes);
  manifest.push({file:destination,encoding,originalBytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});
 }
 await fs.writeFile(path.join(evidence,'manifest.json'),JSON.stringify(manifest,null,2));
 await requireNewTarget();
 await fs.rename(stage,target);
 stage = null;
 } finally {
  try { if (stage) await fs.rm(stage,{recursive:true,force:true}); }
  finally { await lock.close(); await fs.unlink(target + '.lock'); }
 }
 console.log(JSON.stringify({output:target, issues:failures.length, sourceCommit:manifestApi.commit,apiBatches:api.length,apiAttempts:attempts.length,browserTrials:browser.length,baselineExtra:sum(api.filter(r=>r.mode==='baseline'),'extraOrders'),recoveryExtra:sum(api.filter(r=>r.mode==='recovery'),'extraOrders'),recoveryLost:sum(api.filter(r=>r.mode==='recovery'),'lostPurchases'),recoveryMerged:sum(api.filter(r=>r.mode==='recovery'),'mergedOrders'),recoveredBrowser:browser.filter(r=>r.mode==='recovery'&&r.recovered).length},null,2));
}
main().catch(error=>{console.error(error);process.exitCode=1;});

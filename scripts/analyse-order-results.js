// Summarise actual evidence without mixing pilots with measured observations.
const fs=require('node:fs/promises');
const path=require('node:path');
const {gzipSync}=require('node:zlib');
const {createHash}=require('node:crypto');
const assert=require('node:assert/strict');
const {median,percentile}=require('./order-api-experiment');
const {root}=require('./order-test-environment');
const sum=(rows,key)=>rows.reduce((n,r)=>n+(r[key]||0),0);
const fmt=n=>n===null?'n/a':n.toFixed(2);
const spread=values=>values.length?`${fmt(percentile(values,.25))}-${fmt(percentile(values,.75))}`:'n/a';
async function jsonl(file){return(await fs.readFile(file,'utf8')).trim().split('\n').filter(Boolean).map(JSON.parse);}
async function main(){
 const [apiDir,browserDir]=process.argv.slice(2).map(p=>path.resolve(p));
 if(!apiDir||!browserDir)throw new Error('Supply measured API and browser evidence directories.');
 const apiResult=JSON.parse(await fs.readFile(path.join(apiDir,'results.json'),'utf8'));
 const browserResult=JSON.parse(await fs.readFile(path.join(browserDir,'results.json'),'utf8'));
 if(apiResult.pilot||browserResult.pilot)throw new Error('Pilots cannot be analysed as measured results.');
 const api=apiResult.results,browser=browserResult.results,attempts=await jsonl(path.join(apiDir,'api-attempts.jsonl'));
 const output=path.join(root,'research/order-recovery');
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
 await fs.writeFile(path.join(output,'api-summary.csv'),[csvHeader.join(','),...aggregates.map(row=>csvHeader.map(k=>row[k]??'').join(','))].join('\n')+'\n');
 await fs.writeFile(path.join(output,'summary.json'),JSON.stringify({api:aggregates,pairedCreationDifferences:deltas,browser},null,2));
 const manifestApi=JSON.parse(await fs.readFile(path.join(apiDir,'source-manifest.json'),'utf8'));
 const manifestBrowser=JSON.parse(await fs.readFile(path.join(browserDir,'source-manifest.json'),'utf8'));
 const protocol=JSON.parse(await fs.readFile(path.join(apiDir,'protocol.json'),'utf8'));
 if(manifestApi.commit!==manifestBrowser.commit||manifestApi.buildId!==manifestBrowser.buildId)throw new Error('Measured runs used different code/build versions.');
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
 // A completion statement is permitted only when all recorded acceptance checks pass.
 for(const row of api.filter(r=>r.mode==='recovery'))for(const key of ['extraOrders','lostPurchases','mergedOrders','incorrectTotals'])assert.equal(row[key],0,`${row.condition}/${row.batch}: ${key}`);
 assert.ok(api.filter(r=>r.mode==='recovery'&&r.condition==='lost-confirmation').every(r=>r.recovered===r.purchases));
 assert.ok(api.filter(r=>r.mode==='recovery'&&r.condition==='changed-payload').every(r=>r.conflicts===r.purchases));
 assert.ok(browser.filter(r=>r.mode==='recovery').every(r=>r.recovered));
 assert.ok(api.filter(r=>['two-copy','five-copy'].includes(r.condition)).every(r=>r.minimumConcurrentOverlap>=2));
 const lines=[
 '# Aby: order-processing results and completion record','',
 `Measured implementation: ${manifestApi.commit}. Next.js build: ${manifestApi.buildId}. Protocol frozen: ${protocol.frozenAt}.`,
 '',
 'These are measured local synthetic workloads from the signed specification. Pilot and warm-up observations are excluded from the tables. The raw evidence, including a retained failed pilot, is packaged with this record. No dissertation text or signed specification was changed.',
 '',
 '## API correctness','',
 '| Condition | Version | Intended purchases | Accepted orders | Extra orders | Lost purchases | Merged orders | Original-confirmation recoveries |',
 '|---|---|---:|---:|---:|---:|---:|---:|',
 ...aggregates.map(r=>`| ${r.condition} | ${r.mode} | ${r.purchases} | ${r.storedOrders} | ${r.extraOrders} | ${r.lostPurchases} | ${r.mergedOrders} | ${r.condition==='lost-confirmation'?`${r.recovered}/${r.purchases}`:'not interrupted'} |`),
 '',
 'Normal submissions and separate identical purchases show no observed correctness improvement because both versions behaved correctly in those conditions. Repeated attempts deliberately expose the baseline behaviour. A changed-payload attempt is not a new intended purchase: recovery returns a conflict and retains the original accepted result.',
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
  const times=b.map(r=>r.recoveryMs);
  return `| ${condition} | ${a.filter(r=>r.recovered).length}/${a.length} | ${b.filter(r=>r.recovered).length}/${b.length} | ${fmt(median(times))} | ${spread(times)} | ${fmt(Math.min(...times))}-${fmt(Math.max(...times))} |`;
 }),
 '',
 'Recovery checks require the original stored identifier, accepted total and a single order. A quickly displayed second order counts as a recovery failure. Each restart trial retains MongoDB and the browser context while restarting the application process. Timing starts at the first permitted retry after reconnection; server startup/page-loading time is outside that timer.',
 '',
 '## What is complete for this implementation stage','',
 '- Persistent purchase identity and submitted-cart snapshot; database uniqueness and stored-result replay; changed-payload conflicts; same-content independent purchases.',
 '- Durable rejection and cancellation resolution, including races with acceptance and delayed retries. Terminal receipts never enter the kitchen queue.',
 '- Shared-tab coordination and a purchase journal separate from editable-cart storage. Missing cookies or unsafe storage/lock conditions fail without replacing an uncertain purchase.',
 '- Menu validation integration and initial kitchen queue checks. Lost-confirmation recovery after menu changes; cross-session read/bill/replay regression checks.',
 '- 93 regression tests, production build, targeted lint, desktop/mobile keyboard recovery and focus-return checks. Pilot cancellation/rejection/shared-tab checks and the signed specification\'s measured API/browser workload.',
 '',
 '## Boundaries and remaining work','',
 'This completes the specified local implementation/testing workload for Aby, excluding the explicitly optional ten-copy extension. It does not complete the whole dissertation. The other four components still need their own implementation/evaluation and final group integration. Recheck this boundary when Fahad\'s pricing or Ali\'s kitchen interfaces change. Literature synthesis, critical self-evaluation and report writing remain.',
 '',
 'The study uses one local Windows host, a temporary standalone MongoDB and one Chrome version (desktop/mobile emulation). It does not cover real devices, WAN behaviour, database crashes/replica failover, retention expiry, load capacity, or external payment/inventory transactions. Twenty paired batches are a practical budget, not a power calculation. Other desktop activity and local scheduling may affect timings. No statistical-significance or commercial-demand claim is made.',
 '',
 'Deployment is still separate: drain legacy active orders before enabling browser ownership; preserve HTTPS/public Host/cookies and verify the target environment. No live database or deployment was changed. The report should acknowledge Codex assistance and preserve the group-code provenance already recorded in the implementation notes.',
 ];
 await fs.writeFile(path.join(output,'RESULTS.md'),lines.join('\n')+'\n');
 const evidence=path.join(output,'evidence');await fs.mkdir(evidence,{recursive:true});
 const dirs=[['api-measured',apiDir],['browser-measured',browserDir],...protocol.pilotEvidence.map(p=>[path.basename(p),path.join(root,p)]),[path.basename(protocol.retainedFailedPilot),path.join(root,protocol.retainedFailedPilot)]];
 const manifest=[];
 for(const [label,dir]of dirs)for(const file of await fs.readdir(dir)){
  if(!/\.(json|jsonl|txt|png)$/.test(file))continue;
  const bytes=await fs.readFile(path.join(dir,file));
  const encoding=file.endsWith('.png')?'identity':'gzip';
  const destination=`${label}--${file}${encoding==='gzip'?'.gz':''}`;
  await fs.writeFile(path.join(evidence,destination),encoding==='gzip'?gzipSync(bytes):bytes);
  manifest.push({file:destination,encoding,originalBytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});
 }
 await fs.writeFile(path.join(evidence,'manifest.json'),JSON.stringify(manifest,null,2));
 console.log(JSON.stringify({sourceCommit:manifestApi.commit,apiBatches:api.length,apiAttempts:attempts.length,browserTrials:browser.length,baselineExtra:sum(api.filter(r=>r.mode==='baseline'),'extraOrders'),recoveryExtra:sum(api.filter(r=>r.mode==='recovery'),'extraOrders'),recoveryLost:sum(api.filter(r=>r.mode==='recovery'),'lostPurchases'),recoveryMerged:sum(api.filter(r=>r.mode==='recovery'),'mergedOrders'),recoveredBrowser:browser.filter(r=>r.mode==='recovery'&&r.recovered).length,evidenceFiles:manifest.length},null,2));
}
main().catch(error=>{console.error(error);process.exitCode=1;});

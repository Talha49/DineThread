// Matched API experiments. The expected workload is saved before either version runs.
const fs = require('node:fs/promises');
const path = require('node:path');
const { createHash } = require('node:crypto');
const assert = require('node:assert/strict');
const os = require('node:os');
const { createEnvironment, ids, sleep, root, recordSource } = require('./order-test-environment');
const conditions = ['normal', 'sequential', 'two-copy', 'five-copy', 'separate-identical', 'changed-payload', 'lost-confirmation'];
const percentile = (values, p) => values.length ? [...values].sort((a,b) => a-b)[Math.max(0, Math.ceil(values.length*p)-1)] : null;
const median = values => { const a = [...values].sort((x,y) => x-y), n = a.length; return n ? n%2 ? a[(n-1)/2] : (a[n/2-1]+a[n/2])/2 : null; };
function stableUuid(label) { const s = createHash('sha256').update(label).digest('hex').slice(0,32).split(''); s[12]='4'; s[16]='8'; return `${s.slice(0,8).join('')}-${s.slice(8,12).join('')}-${s.slice(12,16).join('')}-${s.slice(16,20).join('')}-${s.slice(20).join('')}`; }
function workload(condition, batch, count, seed) {
    return Array.from({ length: count }, (_,i) => {
        const purchase = `${condition}/${batch}/${i}`, qty = condition === 'separate-identical' ? 1 + Math.floor(i/2)%3 : 1+i%3;
        return { purchase, expectedAccepted: true, expectedOrders: 1, expectedTotal: 8*qty, requestId: stableUuid(`${seed}/${purchase}`), payload: { restaurantId: 'order-research', tableId: String(ids.table), items: [{ menuItemId: String(ids.item), modifierIds: [], qty }] } };
    });
}
async function attempt(env, mode, expected, index, protocol, changes={}) {
    const payload = { ...expected.payload, requestId: expected.requestId };
    if (changes.changed) payload.items = [{ ...payload.items[0], qty: payload.items[0].qty+1 }];
    const started = performance.now();
    try {
        const response = await fetch((changes.drop ? env.proxyBases[mode] : env.bases[mode])+'/p/orders', {
            method:'POST', headers: { 'content-type':'application/json', cookie: `dinethread-order-session=${'a'.repeat(64)}`, 'x-research-purchase':expected.purchase, 'x-research-attempt':String(index), ...(changes.drop ? { 'x-drop-confirmation':'yes' } : {}) },
            body:JSON.stringify(payload), signal:AbortSignal.timeout(protocol.requestTimeoutMs),
        });
        const body = await response.json();
        return { purchase:expected.purchase, attempt:index, elapsedMs:performance.now()-started, status:response.status, body, ...changes };
    } catch(error) { return { purchase:expected.purchase, attempt:index, elapsedMs:performance.now()-started, status:null, error:error.name, ...changes }; }
}
async function readTrace(env, mode) {
    return (await fs.readFile(env.logPath(mode),'utf8')).trim().split('\n').filter(Boolean).map(JSON.parse);
}
function maxOverlap(entries) {
    const events = entries.map(e=>[BigInt(e.tick), e.event==='start'?1:-1]).sort((a,b)=>a[0]<b[0]?-1:a[0]>b[0]?1:b[1]-a[1]);
    let active=0,max=0; for(const [,delta] of events) { active+=delta; max=Math.max(max,active); } return max;
}
async function batchRun(env, mode, expected, condition, protocol, output) {
    await env.reset(mode);
    await attempt(env,mode,{ ...expected[0], purchase:'warmup',requestId:stableUuid('warmup')},0,protocol);
    await env.database(mode).collection('orders').deleteMany({});
    const records=[], overlap=[];
    for(const purchase of expected) {
        const firstSent=performance.now();
        if(condition==='two-copy'||condition==='five-copy') {
            records.push(...await Promise.all(Array.from({length:condition==='two-copy'?2:5},(_,i)=>attempt(env,mode,purchase,i,protocol))));
        } else {
            records.push(await attempt(env,mode,purchase,0,protocol,{drop:condition==='lost-confirmation'}));
            const copies=condition==='sequential'?3:['changed-payload','lost-confirmation'].includes(condition)?2:1;
            for(let i=1;i<copies;i++) { await sleep(protocol.retryDelayMs); records.push(await attempt(env,mode,purchase,i,protocol,{changed:condition==='changed-payload'})); }
        }
        const current=records.filter(r=>r.purchase===purchase.purchase);
        // At the fixed observation deadline only missing/unknown requests need
        // waiting; settled acknowledgements already establish their outcome.
        if(current.every(r=>!r.body?.order)) await sleep(Math.max(0,protocol.observationDeadlineMs-(performance.now()-firstSent)));
    }
    const trace=(await readTrace(env,mode)).filter(e=>expected.some(p=>p.purchase===e.purchase));
    const orders=await env.database(mode).collection('orders').find({submissionOutcome:{$nin:['rejected','cancelled']}}).toArray();
    const stored=new Map(orders.map(o=>[String(o._id),o]));
    const mappings=expected.map(p=>({ purchase:p.purchase, ids:[...new Set(trace.filter(e=>e.purchase===p.purchase && e.orderId).map(e=>e.orderId))].filter(id=>stored.has(id)) }));
    const idPurchases=new Map(); for(const m of mappings) for(const id of m.ids) idPurchases.set(id,[...(idPurchases.get(id)||[]),m.purchase]);
    let duplicates=0,extraOrders=0,lost=0,incorrectTotals=0,recovered=0,conflicts=0;
    for(const p of expected) {
        const mapping=mappings.find(m=>m.purchase===p.purchase);
        if(mapping.ids.length>1) { duplicates++; extraOrders+=mapping.ids.length-1; }
        if(!mapping.ids.length) lost++;
        if(mapping.ids.some(id=>stored.get(id).total!==p.expectedTotal)) incorrectTotals++;
        const calls=records.filter(r=>r.purchase===p.purchase);
        if(condition==='lost-confirmation') {
            const fault=env.drops.find(d=>d.mode===mode && d.purchase===p.purchase);
            assert.ok(fault,'No verified commit-before-drop evidence');
            assert.equal(calls[0].status,null,'Fault unexpectedly delivered a confirmation');
            const retry=calls[1];
            if(retry.body?.order?._id===fault.committedId && retry.body.order.total===p.expectedTotal && retry.elapsedMs<=protocol.recoveryDeadlineMs && mapping.ids.length===1) recovered++;
        }
        if(condition==='changed-payload' && calls[1].status===409) conflicts++;
        if(condition==='two-copy'||condition==='five-copy') {
            const max=maxOverlap(trace.filter(e=>e.purchase===p.purchase)); overlap.push(max);
            assert.ok(max>=2,`Concurrent attempts did not overlap for ${mode}/${p.purchase}`);
        }
    }
    assert.equal(new Set(mappings.flatMap(m=>m.ids)).size,orders.length,'Committed orders are missing from independent trace mapping');
    const creates=records.filter(r=>r.status>=200&&r.status<300&&r.body?.order&&!r.body.replayed).map(r=>r.elapsedMs);
    const replays=records.filter(r=>r.status>=200&&r.status<300&&r.body?.replayed&&r.body?.order).map(r=>r.elapsedMs);
    const result={mode,condition,batch:Number(expected[0].purchase.split('/')[1]),purchases:expected.length,storedOrders:orders.length,duplicatePurchases:duplicates,extraOrders,lostPurchases:lost,mergedOrders:[...idPurchases.values()].filter(v=>v.length>1).length,incorrectTotals,recovered,conflicts,minimumConcurrentOverlap:overlap.length?Math.min(...overlap):null,creationMedianMs:median(creates),creationP95Ms:percentile(creates,.95),replayMedianMs:median(replays),replayP95Ms:percentile(replays,.95),failedAttempts:records.filter(r=>r.status===null||r.status>=400).length};
    await fs.appendFile(path.join(output,'api-batches.jsonl'),JSON.stringify(result)+'\n');
    await fs.appendFile(path.join(output,'api-attempts.jsonl'),records.map(r=>JSON.stringify({...r,mode,condition,batch:result.batch})).join('\n')+'\n');
    await fs.appendFile(path.join(output,'database-observations.jsonl'),JSON.stringify({mode,condition,batch:result.batch,mappings,orders})+'\n');
    return result;
}
async function main() {
    const pilot=process.argv.includes('--pilot');
    const protocolPath=path.join(root,'research/order-recovery/protocol.json');
    const protocol=JSON.parse(await fs.readFile(protocolPath,'utf8'));
    if(!pilot) assert.ok(protocol.frozenAt,'Protocol must be frozen after the pilot, before measurements');
    const output=path.join(root,'qa-results',`api-${pilot?'pilot':'measured'}-${Date.now()}`);
    await fs.mkdir(output,{recursive:true});
    await recordSource(output);
    const batches=pilot?2:protocol.apiBatches, count=pilot?5:protocol.purchasesPerBatch;
    const expected=conditions.flatMap(condition=>Array.from({length:batches},(_,batch)=>({condition,batch,purchases:workload(condition,batch,count,protocol.seed)})));
    await fs.writeFile(path.join(output,'expected-workload.json'),JSON.stringify(expected,null,2));
    await fs.copyFile(protocolPath,path.join(output,'protocol.json'));
    await fs.writeFile(path.join(output,'environment.json'),JSON.stringify({at:new Date().toISOString(),pilot,node:process.version,platform:process.platform,arch:process.arch,cpus:os.cpus().map(c=>c.model),memoryBytes:os.totalmem(),protocolSha256:createHash('sha256').update(await fs.readFile(protocolPath)).digest('hex')},null,2));
    const env=await createEnvironment(output), results=[];
    try {
        for(const group of expected) {
            const order=(group.batch+conditions.indexOf(group.condition))%2?['recovery','baseline']:['baseline','recovery'];
            for(const mode of order) results.push(await batchRun(env,mode,group.purchases,group.condition,protocol,output));
            console.log(`${group.condition} pair ${group.batch+1}/${batches}`);
        }
        await fs.writeFile(path.join(output,'results.json'),JSON.stringify({pilot,results},null,2));
        console.log('EVIDENCE_DIRECTORY='+output);
    } catch(error) {
        await fs.writeFile(path.join(output,'failure.json'),JSON.stringify({message:error.message,stack:error.stack},null,2));
        console.error('FAILED_EVIDENCE_DIRECTORY='+output); throw error;
    } finally { await env.close(); }
}
if(require.main===module) main().catch(error=>{console.error(error);process.exitCode=1;});
module.exports={workload,median,percentile,stableUuid};

const fs = require('node:fs');
const path = require('node:path');
const quantile = (values, p) => {
  const sorted = values.filter(Number.isFinite).sort((a,b)=>a-b);
  if(!sorted.length) return null;
  const index=(sorted.length-1)*p, low=Math.floor(index);
  return sorted[low]+(sorted[Math.ceil(index)]-sorted[low])*(index-low);
};
const distribution = values => ({ n:values.filter(Number.isFinite).length, min:quantile(values,0), q25:quantile(values,.25), median:quantile(values,.5), q75:quantile(values,.75), max:quantile(values,1) });
const summaries=[];
for(const folder of process.argv.slice(2)) {
  const phase=JSON.parse(fs.readFileSync(path.join(folder,'environment.json'))).phase;
  const records=JSON.parse(fs.readFileSync(path.join(folder,'results.json')));
  const runs=records.filter(r=>r.strategy&&!r.warmup&&r.rate);
  const groups=[...new Set(runs.map(r=>`${r.width}/${r.layout}/${r.rate}`))];
  const conditions=groups.map(key=>{
    const group=runs.filter(r=>`${r.width}/${r.layout}/${r.rate}`===key);
    const a=group.filter(r=>r.strategy==='immediate'), b=group.filter(r=>r.strategy==='coalesced');
    const pairs=a.map(x=>({a:x,b:b.find(y=>y.pair===x.pair)})).filter(p=>p.b);
    const perMode=list=>({runs:list.length,delayMs:distribution(list.map(r=>r.finalDelayMs)),messages:distribution(list.map(r=>r.messages)),
      achievedDurationMs:distribution(list.map(r=>r.actualDurationMs)),timeouts:list.filter(r=>!r.acknowledgement).length,
      mismatches:list.filter(r=>r.mismatch||r.acknowledgement?.matches===false).length,hidden:list.filter(r=>r.hidden).length,
      reactCommits:phase==='profile'?distribution(list.map(r=>r.profiles?.length)):null,reactRenderMs:phase==='profile'?distribution(list.map(r=>r.profiles?.reduce((n,p)=>n+p.actualDuration,0))):null});
    return {condition:key,immediate:perMode(a),coalesced:perMode(b),pairs:pairs.map(({a,b})=>({pair:a.pair,delayDifferenceMs:b.finalDelayMs!==null&&a.finalDelayMs!==null?b.finalDelayMs-a.finalDelayMs:null,messageDifference:b.messages-a.messages})),
      pairedDelayDifferenceMs:distribution(pairs.map(({a,b})=>b.finalDelayMs!==null&&a.finalDelayMs!==null?b.finalDelayMs-a.finalDelayMs:NaN))};
  });
  summaries.push({folder,phase:JSON.parse(fs.readFileSync(path.join(folder,'environment.json'))).phase,conditions,
    correctness:records.filter(r=>r.type==='correctness').length,warmups:records.filter(r=>r.warmup).length});
}
fs.mkdirSync('research/theme',{recursive:true}); fs.writeFileSync('research/theme/summary.json',JSON.stringify(summaries,null,2)+'\n');
for (const summary of summaries) {
  console.log(summary.folder);
  for (const condition of summary.conditions) console.log(condition.condition, JSON.stringify({
    pairs: condition.pairs.length,
    immediateMedianMs: condition.immediate.delayMs.median,
    coalescedMedianMs: condition.coalesced.delayMs.median,
    pairedDifferenceMs: condition.pairedDelayDifferenceMs.median,
    immediateMessages: condition.immediate.messages.median,
    coalescedMessages: condition.coalesced.messages.median,
    immediateCommits: condition.immediate.reactCommits?.median ?? 'not measured',
    coalescedCommits: condition.coalesced.reactCommits?.median ?? 'not measured',
  }));
}

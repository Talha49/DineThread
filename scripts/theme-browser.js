const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { createEnvironment, recordSource } = require('./order-test-environment');
const phase = process.argv[2] || 'pilot';
const output = path.resolve('qa-results', `theme-${phase}-${Date.now()}`);
const protocol = require('../research/theme/protocol.json');
const results = [];
let env, browser, page;
let displayRecorded = false;
const reuse = process.argv.includes('--reuse');
const pages = new Map();
let pageGroup;

async function flushEvidence() { await fs.writeFile(path.join(output, 'results.json'), JSON.stringify(results, null, 2)); }
async function ready() {
  await page.waitForFunction(() => window.__themeEditor?.getConfig() && window.__themePreview?.controller.snapshot().acknowledged > 0, { timeout: 20000 });
  await page.getByText('PREPARING YOUR MENU...', { exact: true }).waitFor({ state: 'hidden' });
  const frame = page.frames().find(f => f.url().includes('/menu/'));
  await frame.getByText('PREPARING YOUR MENU...', { exact: true }).waitFor({ state: 'hidden' });
  await page.evaluate(() => document.fonts.ready);
  await frame.evaluate(() => document.fonts.ready);
}
async function ack() {
  await page.waitForFunction(() => { const s = window.__themePreview?.controller.snapshot(); return s && s.acknowledged === s.revision; }, { timeout: 15000 });
  return page.evaluate(() => window.__themePreview.events.filter(e => e.type === 'ack').at(-1));
}
async function setup(strategy, layout, width) {
  const group = `${layout}-${width}`;
  if(reuse && pageGroup !== group) { for(const p of pages.values()) await p.context().close(); pages.clear(); pageGroup=group; }
  if(reuse && pages.has(strategy)) {
    page=pages.get(strategy); await page.bringToFront();
    await page.evaluate(() => window.__themeEditor.edit(structuredClone(window.__themeInitial)));
    await ack(); return page.context();
  }
  if (page && !reuse) await page.context().close();
  const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
  const cookie = await env.staffCookie('recovery');
  await context.addCookies([{ name: 'auth-token', value: cookie.slice('auth-token='.length), url: env.bases.recovery }]);
  await context.addInitScript(value => sessionStorage.setItem('theme-strategy', value), strategy);
  page = await context.newPage();
  if(reuse) pages.set(strategy,page);
  page.on('pageerror', error => { fs.appendFile(path.join(output, 'page-errors.txt'), error.stack + '\n').catch(() => {}); });
  await page.goto(env.bases.recovery + '/research/theme'); await page.bringToFront(); await ready();
  if (!displayRecorded) {
    const display = await page.evaluate(async () => {
      const ticks=[]; for(let i=0;i<61;i++) await new Promise(resolve=>requestAnimationFrame(t=>{ticks.push(t);resolve();}));
      return {screen:{width:screen.width,height:screen.height,pixelRatio:devicePixelRatio},visibility:document.visibilityState,
        frameIntervalsMs:ticks.slice(1).map((t,i)=>t-ticks[i]),note:'RAF intervals are observed scheduling intervals, not a physical refresh-rate certificate'};
    });
    await fs.writeFile(path.join(output,'display.json'),JSON.stringify(display,null,2)); displayRecorded=true;
  }
  await page.evaluate(layout => {
    const c = structuredClone(window.__themeEditor.getConfig()); c.layoutID = layout;
    c.colors.brand.primary = '#123456'; c.typography.sizes.base = 16; c.menuItem.card.padding = 20;
    window.__themeEditor.edit(c); window.__themeInitial = c;
  }, layout);
  await ack();
  return context;
}
async function readPublic(expected) {
  const frame = page.frames().find(f => f.url().includes('/menu/'));
  const fontVariable={Inter:'--font-inter',Outfit:'--font-outfit','Playfair Display':'--font-playfair',Montserrat:'--font-montserrat','Bebas Neue':'--font-bebas'}[expected.typography.fonts.heading.family];
  async function inspectFont(target) {
    const result=await target.evaluate(async variable=>{
      await document.fonts.ready;
      const css=getComputedStyle(document.querySelector('.theme-root'));
      return {heading:css.getPropertyValue('--font-heading').trim(),expected:css.getPropertyValue(variable).trim(),loaded:[...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family)};
    },fontVariable);
    assert.ok(result.heading);assert.equal(result.heading,result.expected);
    const primary=result.heading.split(',')[0].replaceAll('"','').trim();
    assert.ok(result.loaded.includes(primary),'Selected heading font must actually load, not only its fallback');
    return result;
  }
  const previewFont=await inspectFont(frame);
  const preview = await frame.locator('.theme-root').evaluate(el => {
    const css = getComputedStyle(el); return { primary: css.getPropertyValue('--color-primary').trim(), base: css.getPropertyValue('--text-base').trim(), padding: css.getPropertyValue('--item-card-padding').trim(), layout: el.dataset.layout };
  });
  assert.deepEqual(preview, { primary: expected.colors.brand.primary, base: `${expected.typography.sizes.base}px`, padding: `${expected.menuItem.card.padding}px`, layout: expected.layoutID || 'grid' });
  assert.equal(await page.evaluate(() => window.__themeEditor.save()), true);
  const saved = await env.database('recovery').collection('restaurants').findOne({ _id: env.ids.restaurant });
  assert.deepEqual(saved.experienceConfig.designSystem.config, expected);
  assert.deepEqual(saved.experienceConfig.themeConfig, expected);
  const publicPage = await page.context().newPage(); await publicPage.goto(env.bases.recovery + '/menu/order-research');
  await publicPage.locator('.theme-root').waitFor();
  const reopened = await publicPage.locator('.theme-root').evaluate(el => {
    const css = getComputedStyle(el); return { primary: css.getPropertyValue('--color-primary').trim(), base: css.getPropertyValue('--text-base').trim(), padding: css.getPropertyValue('--item-card-padding').trim(), layout: el.dataset.layout };
  });
  assert.deepEqual(reopened, preview); const publicFont=await inspectFont(publicPage);
  assert.equal(publicFont.heading,previewFont.heading);
  await publicPage.close(); await page.bringToFront();
  return { preview, reopened, previewFont, publicFont, savedConfigMatches: true };
}
async function correctness() {
  for (const layout of protocol.layouts) for (const strategy of ['immediate', 'coalesced']) for (const scenario of protocol.correctness) {
    await setup(strategy, layout, 1280);
    let expected = await page.evaluate(() => structuredClone(window.__themeInitial));
    expected.colors.brand.primary = '#654321'; expected.typography.sizes.base = 18; expected.menuItem.card.padding = 24;
    expected.typography.fonts.heading.family=['Inter','Outfit','Playfair Display','Montserrat','Bebas Neue'][protocol.correctness.indexOf(scenario)%5];
    if (scenario === 'single') expected.menuItem.card.padding = 0;
    if (scenario === 'layout-switch') expected.layoutID = layout === 'list' ? 'grid' : 'list';
    if (scenario === 'single' || scenario === 'layout-switch') await page.evaluate(c => window.__themeEditor.edit(c), expected);
    if (['burst','save-during-burst'].includes(scenario)) {
      const before = await page.evaluate(async ({ c, saveNow }) => {
        for (let i=0;i<30;i++) { const next = structuredClone(c); next.typography.sizes.base = 19 + i % 10; window.__themeEditor.edit(next); }
        window.__themeEditor.edit(c);
        const snapshot = window.__themePreview.controller.snapshot();
        const saved = saveNow ? await window.__themeEditor.save() : null;
        return { ...snapshot, saved };
      }, { c: expected, saveNow: scenario === 'save-during-burst' });
      if (scenario === 'save-during-burst') {
        assert.equal(before.saved, true);
        if (strategy === 'coalesced') assert.ok(before.sent < before.revision, 'Save must start while delivery is pending');
        const record = await env.database('recovery').collection('restaurants').findOne({ _id: env.ids.restaurant });
        assert.deepEqual(record.experienceConfig.themeConfig, expected);
        results.push({ type: 'save-check', layout, strategy, scenario, pendingAtLastEdit: before.sent < before.revision, savedLatest: true });
      }
    }
    if (scenario === 'reset') {
      await page.evaluate(c => window.__themeEditor.edit(c), expected); await ack();
      assert.equal(await page.evaluate(async () => { await window.__themeEditor.reset(); return true; }), true);
      expected = await page.evaluate(() => structuredClone(window.__themeEditor.getConfig()));
      assert.equal(expected.colors.brand.primary, '#4f46e5'); assert.equal(expected.typography.sizes.base, 16); assert.equal(expected.menuItem.card.padding, 20); assert.equal(expected.background.type, 'solid');
    }
    if (scenario === 'invalid') {
      await page.evaluate(c => window.__themeEditor.edit(c), expected); await ack();
      await page.evaluate(c => { const bad = structuredClone(c); bad.typography.sizes.base = -100; window.__themeEditor.edit(bad); }, expected);
      assert.deepEqual(await page.evaluate(() => window.__themeEditor.getConfig()), expected);
      const badPayload = { experienceConfig: { themeConfig: { typography: { sizes: { base: -100 } } } } };
      const response = await page.request.put(env.bases.recovery + '/api/restaurant/branding', { data: badPayload }); assert.equal(response.status(), 400);
    }
    if (scenario === 'reload') {
      await page.evaluate(c => window.__themeEditor.edit(c), expected); await ack();
      const old = await page.evaluate(() => window.__themePreview.controller.snapshot().session);
      await page.locator('iframe').evaluate(el => { el.src = el.src; });
      await page.waitForFunction(previous => { const s=window.__themePreview.controller.snapshot(); return s.session && s.session!==previous && s.acknowledged===s.revision; }, old);
    }
    if (scenario === 'outdated') {
      await page.evaluate(c => window.__themeEditor.edit(c), expected); await ack();
      await page.evaluate(() => {
        const snapshot = window.__themePreview.controller.snapshot();
        const stale = { type:'THEME_UPDATE', connection:snapshot.connection, session:snapshot.session, revision:snapshot.revision-1, data:{ ...snapshot.latest, experienceConfig:{ ...snapshot.latest.experienceConfig, layoutID:'list' } } };
        document.querySelector('iframe').contentWindow.postMessage(stale,location.origin);
        window.dispatchEvent(new MessageEvent('message',{origin:location.origin,source:window,data:{type:'THEME_ACK',connection:snapshot.connection,session:snapshot.session,revision:snapshot.revision+100}}));
      }); await page.waitForTimeout(100);
    }
    const finalAck = await ack(); assert.equal(finalAck.matches,true);
    const check = await readPublic(expected);
    await page.screenshot({ path:path.join(output,`${layout}-${strategy}-${scenario}.png`) });
    results.push({ type:'correctness',layout,strategy,scenario,...check,revision:finalAck.revision,pass:true }); await flushEvidence();
    console.log(`${layout} ${strategy} ${scenario} passed`);
  }
}
async function dashboard() {
  for(const width of [1280,390]) {
    await setup('coalesced','grid',width);
    await page.goto(env.bases.recovery+'/dashboard/settings');
    await page.getByRole('button',{name:'Identity',exact:true}).click();
    await page.locator('input[type="color"]').fill('#13579b');
    await page.getByRole('button',{name:/Outfit/}).click();
    const response=page.waitForResponse(r=>r.url().endsWith('/api/restaurant/branding')&&r.request().method()==='PUT');
    await page.getByTitle('Save Design',{exact:true}).click(); assert.equal((await response).status(),200);
    if(!await page.locator('iframe').count()) await page.getByRole('button',{name:'Preview',exact:true}).click();
    await ready(); const confirmation=await ack(); assert.equal(confirmation.styles.primary,'#13579b');
    const frame=page.frames().find(f=>f.url().includes('/menu/'));
    const fonts=await frame.evaluate(async()=>{
      await document.fonts.ready;
      const root=document.querySelector('.theme-root'), css=getComputedStyle(root);
      return { heading:css.getPropertyValue('--font-heading').trim(), bundled:css.getPropertyValue('--font-outfit').trim(),
        loaded:[...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family) };
    });
    assert.equal(fonts.heading,fonts.bundled);assert.ok(fonts.loaded.includes(fonts.heading.split(',')[0].replaceAll('"','').trim()),'Selected bundled font must load');
    const expected=await page.evaluate(()=>window.__themeEditor.getConfig()); assert.equal(expected.typography.fonts.heading.family,'Outfit');
    const stored=await env.database('recovery').collection('restaurants').findOne({_id:env.ids.restaurant});
    assert.deepEqual(stored.experienceConfig.themeConfig,expected);
    await page.screenshot({path:path.join(output,`dashboard-${width}.png`)});
    results.push({type:'dashboard',width,pass:true,savedConfigMatches:true,acknowledgement:confirmation,fonts});await flushEvidence();
    console.log(`Dashboard controls ${width} passed`);
  }
}
async function sequence(strategy, layout, width, rate, pair, warmup=false) {
  await setup(strategy,layout,width);
  // Warm-up and preparation are excluded; the input driver calls the same
  // editor handler as the controls and yields between scheduled events.
  await page.waitForTimeout(150);
  let cdp, metricsBefore, tracing = false;
  if (phase === 'profile') {
    cdp = await page.context().newCDPSession(page); await cdp.send('Performance.enable');
    metricsBefore=(await cdp.send('Performance.getMetrics')).metrics;
    if (pair === 0) { await cdp.send('Tracing.start',{categories:'devtools.timeline,v8,blink.user_timing',transferMode:'ReturnAsStream'}); tracing=true; }
  }
  const record = await page.evaluate(async ({ rate, strategy, layout, width, pair, warmup }) => {
    const editor=window.__themeEditor, pipe=window.__themePreview; pipe.events.length=0;
    const iframe=document.querySelector('iframe'); iframe.contentWindow.__themeProfiles=[];
    const times=[],visibility=[]; const initial=structuredClone(window.__themeInitial);
    const start=performance.now(); let finalRevision, finalEditAt;
    for(let i=0;i<rate.edits;i++) {
      const due=start+i*rate.durationMs/(rate.edits-1);
      const remaining=due-performance.now(); if(remaining>0) await new Promise(r=>setTimeout(r,remaining));
      else if(i) await new Promise(r=>setTimeout(r,0));
      const next=structuredClone(initial);
      next.colors.brand.primary=i%2?'#654321':'#234567'; next.typography.sizes.base=16+i%5; next.menuItem.card.padding=16+i%9;
      finalEditAt=performance.now(); times.push(finalEditAt); visibility.push(document.visibilityState, iframe.contentDocument.visibilityState);
      editor.edit(next); finalRevision=pipe.controller.snapshot().revision;
    }
    const limit=performance.now()+10000;
    while(pipe.controller.snapshot().acknowledged<finalRevision && performance.now()<limit) await new Promise(r=>setTimeout(r,5));
    const acknowledgement=pipe.events.find(e=>e.type==='ack'&&e.revision===finalRevision);
    const sends=pipe.events.filter(e=>e.type==='sent');
    const root=iframe.contentDocument.querySelector('.theme-root'), css=getComputedStyle(root);
    const expected={primary:(rate.edits-1)%2?'#654321':'#234567',base:`${16+(rate.edits-1)%5}px`,padding:`${16+(rate.edits-1)%9}px`,layout};
    const actual={primary:css.getPropertyValue('--color-primary').trim(),base:css.getPropertyValue('--text-base').trim(),padding:css.getPropertyValue('--item-card-padding').trim(),layout:root.dataset.layout};
    return {strategy,layout,width,rate:rate.name,pair,warmup,times,actualDurationMs:times.at(-1)-times[0],finalRevision,finalEditAt,acknowledgement,
      finalDelayMs:acknowledgement?acknowledgement.at-finalEditAt:null,messages:sends.length,expected,actual,mismatch:JSON.stringify(expected)!==JSON.stringify(actual),
      hidden:visibility.some(v=>v!=='visible')||pipe.events.some(e=>e.visibility&&e.visibility!=='visible'),
      profiles:iframe.contentWindow.__themeProfiles||[],eventSummary:pipe.events.filter(e=>e.type!=='sent'&&e.type!=='edit')};
  }, {rate,strategy,layout,width,pair,warmup});
  if(cdp) {
    record.browserMetrics=(await cdp.send('Performance.getMetrics')).metrics;
    record.browserMetricsBefore=metricsBefore;
    record.browserMetricDeltas=Object.fromEntries(['ScriptDuration','TaskDuration','RecalcStyleDuration','LayoutDuration','LayoutCount','RecalcStyleCount'].map(name=>[name,
      record.browserMetrics.find(m=>m.name===name)?.value-metricsBefore.find(m=>m.name===name)?.value]));
    record.traced=tracing;
    if(tracing) {
      const completed=new Promise(resolve=>cdp.once('Tracing.tracingComplete',resolve)); await cdp.send('Tracing.end');
      const {stream}=await completed; let chunks='';
      for(;;){const part=await cdp.send('IO.read',{handle:stream});chunks+=part.data;if(part.eof)break;}
      await cdp.send('IO.close',{handle:stream});
      await fs.writeFile(path.join(output,`${layout}-${strategy}-trace.json`),chunks);
    }
    await cdp.detach();
  }
  results.push(record); await flushEvidence();
  assert.equal(record.hidden,false,'Foreground visibility was lost'); assert.equal(record.mismatch,false); assert.ok(record.acknowledgement,'Final acknowledgement timed out'); assert.equal(record.acknowledgement.matches,true);
  if(phase==='profile') assert.ok(record.profiles.length>0,'The profiling build must produce actual React measurements');
  console.log(`${phase} ${width} ${layout} ${rate.name} pair ${pair} ${strategy}: ${record.finalDelayMs.toFixed(2)}ms, ${record.messages} messages`);
}
async function timing() {
  const matrices=phase==='profile'?[{width:1280,layouts:protocol.layouts,pairsPerLayoutRate:5}]:phase==='pilot'?[{width:1280,layouts:protocol.layouts,pairsPerLayoutRate:2}]:protocol.main;
  for(const m of matrices) for(const layout of m.layouts||protocol.layouts) for(const rate of protocol.rates.filter(r=>phase!=='profile'||r.name==='rapid')) {
    if(phase==='main') for(const strategy of ['immediate','coalesced']) await sequence(strategy,layout,m.width,rate,-1,true);
    for(let pair=0;pair<m.pairsPerLayoutRate;pair++) for(const strategy of pair%2?['coalesced','immediate']:['immediate','coalesced']) await sequence(strategy,layout,m.width,rate,pair);
  }
}
async function main() {
  await fs.mkdir(output,{recursive:true}); await recordSource(output);
  await fs.writeFile(path.join(output,'protocol.json'),JSON.stringify(protocol,null,2));
  env=await createEnvironment(output,{env:{recovery:{ORDER_SUBMISSION_MODE:'recovery',CATALOGUE_MODE:'reconfirmation',WORKFLOW_MODE:'conditional'}}});
  await env.database('recovery').collection('restaurants').updateOne({_id:env.ids.restaurant},{$set:{plan:'pro'}});
  // A fixed 24-item, four-category menu gives each selected layout real work.
  const db=env.database('recovery'); await db.collection('menuitems').deleteMany({}); await db.collection('categories').deleteMany({});
  for(let c=0;c<4;c++) {
    await db.collection('categories').insertOne({restaurant:env.ids.restaurant,name:`Course ${c+1}`,sortOrder:c});
    await db.collection('menuitems').insertMany(Array.from({length:6},(_,i)=>({restaurant:env.ids.restaurant,name:`Dish ${c*6+i+1}`,description:'Synthetic menu fixture',category:`Course ${c+1}`,price:8+i,isAvailable:true,variants:[],modifiers:[]})));
  }
  browser=await chromium.launch({executablePath:process.env.QA_CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:false});
  await fs.writeFile(path.join(output,'environment.json'),JSON.stringify({browser:browser.version(),node:process.version,os:os.version(),cpus:os.cpus().map(c=>c.model),memory:os.totalmem(),headless:false,phase,reuse},null,2));
  if(phase==='correctness') await correctness(); else if(phase==='dashboard') await dashboard(); else await timing();
}
main().catch(async error=>{await fs.writeFile(path.join(output,'failure.txt'),error.stack);if(page&&!page.isClosed())await page.screenshot({path:path.join(output,'failure.png')}).catch(()=>{});console.error(error);process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();if(env)await env.close();console.log(output);});

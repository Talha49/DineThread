const fs=require('node:fs/promises');
const path=require('node:path');
const assert=require('node:assert/strict');
const { chromium }=require('playwright');
const { createEnvironment, root, recordSource }=require('./order-test-environment');

async function openCart(page, base) {
    await page.goto(base+'/menu/order-research');
    try { await page.getByRole('button',{name:'Open cart and order status'}).waitFor({timeout:30000}); }
    catch (error) { console.error('Cart startup:', await page.locator('body').innerText()); throw error; }
    await page.getByText('Test soup',{exact:true}).click();
    await page.getByRole('button',{name:/^Add -/}).click();
    await page.getByRole('button',{name:'Open cart and order status'}).click();
    await page.getByRole('button',{name:'Table 1',exact:true}).click();
}
async function browserTrial(env,browser,mode,condition,trial,protocol,output) {
    await env.reset(mode);
    const mobile=trial%2===0;
    const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:1000},isMobile:mobile,hasTouch:mobile,reducedMotion:mobile?'reduce':'no-preference'});
    const page=await context.newPage(), errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    let accepted,attempt=0,verified=false;
    const purchase=`browser/${condition}/${trial}`;
    await fs.appendFile(path.join(output,'browser-expected.jsonl'),JSON.stringify({mode,condition,trial,purchase,expectedTotal:8,expectedOrders:1})+'\n');
    try {
        await page.route('**/p/orders',async route=>{
            const headers={...route.request().headers(),'x-research-purchase':purchase,'x-research-attempt':String(attempt++)};
            if(accepted) return route.continue({headers});
            const response=await route.fetch({headers});
            assert.equal(response.status(),201);
            accepted=await response.json();
            const order=await env.database(mode).collection('orders').findOne({requestId:JSON.parse(route.request().postData()).requestId,...(mode==='baseline'?{total:8}:{})});
            // Baseline stores no request identifier; look up the returned ID independently.
            const {ObjectId}=require('mongodb');
            const committed=await env.database(mode).collection('orders').findOne({_id:new ObjectId(accepted.order._id)});
            assert.ok(committed); assert.equal(committed.total,8);
            if(mode==='recovery') assert.equal(String(order._id),accepted.order._id);
            verified=true;
            await fs.appendFile(path.join(output,'browser-faults.jsonl'),JSON.stringify({mode,condition,trial,committedId:accepted.order._id,total:committed.total,verifiedBeforeAbort:true})+'\n');
            await route.abort('failed');
        });
        await openCart(page,env.bases[mode]);
        await page.getByRole('button',{name:/^Place Order/}).click();
        await page.getByRole('alert').filter({hasText:'Confirmation has not arrived'}).waitFor({timeout:protocol.requestTimeoutMs+2000});
        assert.ok(verified);
        if(condition==='application-restart') {
            await env.stop(mode);
            assert.equal(await env.database(mode).collection('orders').countDocuments(),1);
            await env.start(mode); // Database stays alive throughout.
        }
        if(condition!=='lost-confirmation') {
            await page.reload();
            await page.getByRole('button',{name:'Open cart and order status'}).click();
        }
        await new Promise(resolve=>setTimeout(resolve,protocol.retryDelayMs));
        const recoveryStart=performance.now();
        await page.getByRole('button',{name:mode==='recovery'?'Retry same purchase':/^Place Order/}).click();
        await page.getByRole('heading',{name:'Order Status',exact:true}).waitFor({timeout:protocol.recoveryDeadlineMs});
        const elapsedMs=performance.now()-recoveryStart;
        const state=await page.evaluate(()=>JSON.parse(localStorage.getItem('smart-menu-cart')).state);
        const response=await context.request.get(env.bases[mode]+'/p/orders/'+state.orderId);
        const shown=await response.json();
        const count=await env.database(mode).collection('orders').countDocuments({submissionOutcome:{$nin:['rejected','cancelled']}});
        const text=await page.getByRole('dialog',{name:'Cart and order status'}).innerText();
        const result={mode,condition,trial,viewport:mobile?'mobile':'desktop',acceptedId:accepted.order._id,displayedId:state.orderId,acceptedTotal:8,displayedTotal:shown.order?.total,renderedTotalPresent:text.includes('$8.00'),storedOrders:count,recoveryMs:elapsedMs,lostConfirmationAfterCommit:verified,databaseKeptDuringRestart:condition==='application-restart',pageErrors:errors};
        result.recovered=state.orderId===accepted.order._id&&shown.order?.total===8&&result.renderedTotalPresent&&count===1&&elapsedMs<=protocol.recoveryDeadlineMs;
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
        assert.deepEqual(errors,[]);
        if(trial===0) await page.screenshot({path:path.join(output,`${mode}-${condition}.png`)});
        await fs.appendFile(path.join(output,'browser-results.jsonl'),JSON.stringify(result)+'\n');
        return result;
    } catch(error) {
        await fs.appendFile(path.join(output,'browser-results.jsonl'),JSON.stringify({mode,condition,trial,recovered:false,error:error.message,acceptedId:accepted?.order?._id,lostConfirmationAfterCommit:verified,pageErrors:errors})+'\n');
        await page.screenshot({path:path.join(output,`${mode}-${condition}-${trial}-failure.png`)});
        throw error;
    } finally {await context.close();}
}
async function extraRecoveryChecks(env,browser,output) {
    const mode='recovery',base=env.bases[mode],db=env.database(mode);
    const results=[];
    // Reject an unavailable item, allow editing and a genuinely new request.
    await env.reset(mode);
    const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
    const page=await context.newPage();
    try {
        await openCart(page,base);
        await db.collection('menuitems').updateOne({_id:env.ids.item},{$set:{isAvailable:false}});
        await page.getByRole('button',{name:/^Place Order/}).click();
        await page.getByRole('alert').filter({hasText:'No order was placed'}).waitFor();
        assert.equal(await db.collection('orders').countDocuments({submissionOutcome:'accepted'}),0);
        await page.screenshot({path:path.join(output,'mobile-rejected.png')});
        await db.collection('menuitems').updateOne({_id:env.ids.item},{$set:{isAvailable:true}});
        await page.getByRole('button',{name:/^Place Order/}).click();
        await page.getByRole('heading',{name:'Order Status',exact:true}).waitFor();
        assert.equal(await db.collection('orders').countDocuments({submissionOutcome:'accepted'}),1);
        results.push('durable rejection, editable cart and fresh purchase');
    }finally{await context.close();}
    // No request reaches the app, then cancellation wins before a delayed copy.
    await env.reset(mode);
    const cancelContext=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
    const cancelPage=await cancelContext.newPage();
    try {
        let original;
        await cancelPage.route('**/p/orders',async route=>{original=route.request().postData();await route.abort('failed');});
        await openCart(cancelPage,base);
        await cancelPage.getByRole('button',{name:/^Place Order/}).click();
        await cancelPage.getByRole('button',{name:'Retry same purchase'}).waitFor();
        await cancelPage.getByRole('button',{name:'Cancel pending purchase'}).click();
        await cancelPage.getByRole('alert').filter({hasText:'was not placed'}).waitFor();
        const delayed=await cancelContext.request.post(base+'/p/orders',{data:JSON.parse(original)});
        assert.equal((await delayed.json()).outcome,'cancelled');
        assert.equal(await db.collection('orders').countDocuments({submissionOutcome:'accepted'}),0);
        await cancelPage.screenshot({path:path.join(output,'mobile-cancelled.png')});
        results.push('cancel-before-acceptance blocks delayed execution');
    }finally{await cancelContext.close();}
    // A second tab shares the durable journal while the first holds the lock.
    await env.reset(mode);
    const tabs=await browser.newContext({viewport:{width:1440,height:1000}});
    const first=await tabs.newPage();
    let second;
    let release;
    try {
        await openCart(first,base);
        second=await tabs.newPage();
        await second.goto(base+'/menu/order-research');
        await second.getByRole('button',{name:'Open cart and order status'}).click();
        let reached;
        const gate=new Promise(r=>release=r),arrived=new Promise(r=>reached=r);
        await first.route('**/p/orders',async route=>{const response=await route.fetch();reached();await gate;await route.fulfill({response});});
        await first.bringToFront();
        await first.getByRole('button',{name:/^Place Order/}).click();
        await arrived;
        await second.bringToFront();
        await second.getByRole('button',{name:'Retry same purchase'}).click();
        await second.getByRole('alert').filter({hasText:'Another tab'}).waitFor();
        release();
        await first.bringToFront();
        await first.getByRole('heading',{name:'Order Status',exact:true}).waitFor();
        await second.bringToFront();
        await second.getByRole('heading',{name:'Order Status',exact:true}).waitFor();
        const a=await first.evaluate(()=>JSON.parse(localStorage.getItem('dinethread-purchase:order-research')).orderId);
        const b=await second.evaluate(()=>JSON.parse(localStorage.getItem('smart-menu-cart')).state.orderId);
        assert.equal(a,b);assert.equal(await db.collection('orders').countDocuments({submissionOutcome:'accepted'}),1);
        await second.screenshot({path:path.join(output,'desktop-shared-tabs.png')});
        results.push('two-tab lock and shared confirmation');
    }finally{release?.();await tabs.close();}
    await fs.writeFile(path.join(output,'additional-ui-checks.json'),JSON.stringify(results,null,2));
}
async function main(){
    const pilot=process.argv.includes('--pilot'),protocolPath=path.join(root,'research/order-recovery/protocol.json');
    const protocol=JSON.parse(await fs.readFile(protocolPath,'utf8'));
    if(!pilot) assert.ok(protocol.frozenAt);
    const output=path.join(root,'qa-results',`browser-${pilot?'pilot':'measured'}-${Date.now()}`);
    const env=await createEnvironment(output);
    await recordSource(output);
    const browser=await chromium.launch({headless:true,...(process.env.QA_CHROME_PATH?{executablePath:process.env.QA_CHROME_PATH}:{})});
    await fs.copyFile(protocolPath,path.join(output,'protocol.json'));
    await fs.writeFile(path.join(output,'browser-version.txt'),browser.version());
    const results=[];
    try{
        for(const [index,condition] of protocol.browserConditions.entries()) for(let trial=0;trial<(pilot?1:protocol.browserPairedTrialsPerCondition);trial++){
            for(const mode of (index+trial)%2?['recovery','baseline']:['baseline','recovery']) results.push(await browserTrial(env,browser,mode,condition,trial,protocol,output));
            console.log(`${condition} pair ${trial+1}`);
        }
        if(pilot) await extraRecoveryChecks(env,browser,output);
        await fs.writeFile(path.join(output,'results.json'),JSON.stringify({pilot,results},null,2));
        console.log('EVIDENCE_DIRECTORY='+output);
    }catch(error){await fs.writeFile(path.join(output,'failure.json'),JSON.stringify({message:error.message,stack:error.stack},null,2));console.error('FAILED_EVIDENCE_DIRECTORY='+output);throw error;}
    finally{await browser.close();await env.close();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});

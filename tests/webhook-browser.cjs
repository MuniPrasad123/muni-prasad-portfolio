/* eslint-disable @typescript-eslint/no-require-imports -- Isolated CommonJS browser validation. */
const fs=require('node:fs'),assert=require('node:assert/strict');
const {openBrowser}=require('@remotion/renderer');
const base=process.env.WEBHOOK_PREVIEW_URL||'http://localhost:3002';
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const review='.cache/episode015/review';
(async()=>{
  fs.mkdirSync(review,{recursive:true});
  const browser=await openBrowser('chrome');
  try{
    const page=await browser.newPage({context:()=>null,logLevel:'error',indent:false,pageIndex:0,onBrowserLog:null,onLog:()=>{}});
    const errors=[];page.on('error',e=>errors.push(String(e)));
    async function open(path){await page.goto({url:base+path,timeout:120000});}
    async function click(id){await page.evaluate(id=>{const button=document.getElementById(id);if(!button||button.disabled)throw Error('Unavailable control: '+id);button.click()},id);await wait(60);}
    async function choose(mode){await page.evaluate(mode=>document.querySelector(`[data-mode="${mode}"]`).click(),mode);await wait(60);}
    async function metrics(){return page.evaluate(()=>Object.fromEntries([...document.querySelectorAll('#metrics>div')].map(div=>[div.querySelector('dt').textContent,div.querySelector('dd').textContent])));}
    async function finish(){for(let i=0;i<12;i++){if(await page.evaluate(()=>document.getElementById('next').disabled))return;await click('next')}throw Error('Scenario did not finish');}
    await page.setViewport({width:1100,height:1000,deviceScaleFactor:1});
    await open('/blog/episodes/015/customer-lab.html');
    const modes=await page.evaluate(()=>[...document.querySelectorAll('[data-mode]')].map(button=>button.dataset.mode));
    assert.equal(modes.length,7);
    for(const mode of modes){
      await choose(mode);await finish();const m=await metrics();assert.equal(m['Provider charges (assumed)'],'1');
      if(mode==='unsafe'){assert.equal(m['Email intents'],'3');assert.equal(m['Shipment intents'],'3');assert.equal(m['Success state transitions'],'1');}
      if(['safe','newid','worker'].includes(mode)){assert.equal(m['Email intents'],'1');assert.equal(m['Outbox business intents'],'1');assert.equal(m['Success state transitions'],'1');}
      if(['forged','merchant'].includes(mode)){assert.equal(m['Inbox rows'],'0');assert.equal(m['Outbox business intents'],'0');assert.match(m['HTTP acknowledgement'],/400/);}
      if(mode==='refund'){assert.equal(m['Payment state'],'REFUNDED');assert.equal(m['Outbox business intents'],'0');assert.match(await page.evaluate(()=>document.getElementById('decision').textContent),/REFUNDED/);}
    }
    await choose('safe');await click('next');await click('previous');assert.match(await page.evaluate(()=>document.getElementById('step-count').textContent),/Step 1/);
    await page.evaluate(()=>{const speed=document.getElementById('speed');speed.value='1200';speed.dispatchEvent(new Event('change',{bubbles:true}))});
    await click('play');await wait(1400);await click('play');
    const paused=await metrics();await wait(1400);assert.deepEqual(await metrics(),paused);
    await click('reset');assert.equal((await metrics())['Inbox rows'],'0');
    await click('motion');assert.equal(await page.evaluate(()=>document.body.dataset.motion),'paused');
    await page.evaluate(()=>document.querySelector('.node').click());assert.match(await page.evaluate(()=>document.getElementById('component-help').textContent),/Maya:/);
    await page.evaluate(()=>{for(const [q,value] of Object.entries({q1:'b',q2:'a',q3:'c'}))document.querySelector(`input[name=${q}][value=${value}]`).click()});await click('grade');assert.match(await page.evaluate(()=>document.getElementById('score').textContent),/3\/3/);
    await page._client().send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
    assert.equal(await page.evaluate(()=>getComputedStyle(document.querySelector('.wire span')).animationName),'none');
    await page.bringToFront();await page.evaluate(()=>document.getElementById('next').focus());
    await page._client().send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',text:'\r',unmodifiedText:'\r',windowsVirtualKeyCode:13,nativeVirtualKeyCode:13});await page._client().send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,nativeVirtualKeyCode:13});await wait(100);
    assert.equal((await metrics())['Inbox rows'],'1');
    const axeSource=fs.readFileSync('.cache/episode015/tools/node_modules/axe-core/axe.min.js','utf8');await page.evaluate(axeSource);
    const a11y=await page.evaluate(async()=>{const r=await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});return r.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)}))});
    fs.writeFileSync(review+'/lab-accessibility.json',JSON.stringify(a11y,null,2));assert.deepEqual(a11y,[]);
    for(const width of [1100,390]){
      await page.setViewport({width,height:1000,deviceScaleFactor:1});await choose('unsafe');await finish();
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
      const shot=await page._client().send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(`${review}/lab-${width}.png`,Buffer.from(shot.value.data,'base64'));
    }
    await open('/blog/episodes/015/lab.html');await click('next');assert.match(await page.evaluate(()=>document.getElementById('step-count').textContent),/1 \/ 4/);await click('previous');await click('reset');
    for(const width of [1440,390]){
      await page.setViewport({width,height:1000,deviceScaleFactor:1});await open('/blog/payment-webhook-idempotency-inbox-outbox');
      assert.equal(await page.evaluate(()=>document.querySelector('link[rel=canonical]').href),'https://www.muniprasad.in/blog/payment-webhook-idempotency-inbox-outbox');
      assert.ok(await page.evaluate(()=>document.body.textContent.includes('Maya')));
      assert.ok(await page.evaluate(()=>document.querySelector('#original-webhook-lab iframe').getAttribute('src')==='/blog/episodes/015/lab.html'));
      if(width===1440){
        assert.equal(await page.evaluate(()=>document.querySelector('video').getAttribute('src')),'/blog/episodes/015/lesson-redesign.mp4');
        for(let i=0;i<100;i++){if(await page.evaluate(()=>document.querySelector('video').readyState>=1))break;await wait(100)}
        const media=await page.evaluate(()=>{const v=document.querySelector('video');return {duration:v.duration,controls:v.controls,track:v.querySelector('track').getAttribute('src'),error:v.error?.message}});
        assert.ok(media.duration>105&&media.duration<106,JSON.stringify(media));assert.equal(media.controls,true);assert.equal(media.error,undefined);assert.match(media.track,/captions-redesign.vtt/);
        await page.evaluate(()=>{const video=document.querySelector('video');video.muted=true;video.textTracks[0].mode='hidden';[...document.querySelectorAll('#lesson-video button')].find(button=>button.textContent==='Play video').click()});
        await wait(700);assert.ok(await page.evaluate(()=>document.querySelector('video').currentTime>0));
        await page.evaluate(()=>document.querySelector('video').pause());assert.ok(await page.evaluate(()=>document.querySelector('video').muted));
        await page.evaluate(()=>document.querySelectorAll('.video-chapters button')[3].click());await wait(300);assert.ok(await page.evaluate(()=>document.querySelector('video').currentTime>=41));await page.evaluate(()=>document.querySelector('video').pause());
        for(let i=0;i<50;i++){if(await page.evaluate(()=>document.querySelector('video').textTracks[0].cues?.length>0))break;await wait(100)}
        assert.equal(await page.evaluate(()=>document.querySelector('video').textTracks[0].cues.length),35);
      }
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
      const top=await page._client().send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(`${review}/after-${width}.png`,Buffer.from(top.value.data,'base64'));
      await page.evaluate(()=>document.getElementById('webhook-customer-title').closest('section').scrollIntoView({block:'center',behavior:'instant'}));
      const story=await page._client().send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(`${review}/story-${width}.png`,Buffer.from(story.value.data,'base64'));
      await wait(700);
      const height=await page.evaluate(()=>Number.parseInt(document.querySelector('#interactive-lab iframe').style.height));assert.ok(height>=100&&height<6000,'iframe auto-height '+height);
    }
    assert.deepEqual(errors,[]);
    console.log('PASS: 7 scenarios; lost ACK/duplicates/signature/merchant/refund/worker; all controls, keyboard, reduced motion, quiz; zero WCAG A/AA lab violations; original controls; canonical route; desktop/mobile overflow and frame resize.');
  }finally{await browser.close({silent:true})}
})().catch(error=>{console.error(error);process.exitCode=1});

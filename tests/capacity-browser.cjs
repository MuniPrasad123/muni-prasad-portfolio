/* eslint-disable @typescript-eslint/no-require-imports -- Isolated browser validation. */
const fs=require('node:fs'),assert=require('node:assert/strict');
const {openBrowser}=require('@remotion/renderer');
const base=process.env.CAPACITY_PREVIEW_URL||'http://localhost:3002';
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const review='.cache/episode016/review';
(async()=>{
 fs.mkdirSync(review,{recursive:true});const browser=await openBrowser('chrome');
 try{
 const page=await browser.newPage({context:()=>null,logLevel:'error',indent:false,pageIndex:0,onBrowserLog:null,onLog:()=>{}});
 const errors=[];page.on('error',e=>errors.push(String(e)));
 const open=path=>page.goto({url:base+path,timeout:120000});
 async function click(id){await page.evaluate(id=>document.getElementById(id).click(),id);await wait(80)}
 async function choose(mode){await page.evaluate(mode=>document.querySelector(`[data-mode="${mode}"]`).click(),mode)}
 const metrics=()=>page.evaluate(()=>Object.fromEntries([...document.querySelectorAll('#metrics>div')].map(d=>[d.querySelector('dt').textContent,d.querySelector('dd').textContent])));
 async function finish(){for(let n=0;n<12;n++){if(await page.evaluate(()=>document.getElementById('next').disabled))return;await click('next')}throw Error('Unfinished scenario')}
 await page.setViewport({width:1100,height:1000,deviceScaleFactor:1});await open('/blog/episodes/016/advanced-capacity-lab.html');
 const modes=await page.evaluate(()=>[...document.querySelectorAll('[data-mode]')].map(b=>b.dataset.mode));assert.equal(modes.length,9);
 for(const mode of modes){await choose(mode);await finish();const m=await metrics();
 if(['safe','unknown','busy','restart'].includes(mode)){assert.equal(m['Asha’s payment status'],'CONFIRMED');assert.equal(m['Asha’s provider calls'],'1');assert.equal(m['Confirmation outbox intents'],'1')}
 if(mode==='conflict'){assert.match(m['Customer/API result'],/409/);assert.equal(m['Asha’s provider calls'],'1');assert.match(await page.evaluate(()=>document.getElementById('customer-message').textContent),/another payload/)}
 }
 await choose('unknown');for(let n=0;n<4;n++)await click('next');assert.equal((await metrics())['Asha’s payment status'],'UNKNOWN');assert.equal((await metrics())['Asha’s local permit held'],'Yes');await click('next');assert.equal((await metrics())['Asha’s provider calls'],'1');await click('next');assert.equal((await metrics())['Asha’s local permit held'],'No');await click('previous');await click('reset');
 await page.evaluate(()=>{for(const [id,value] of Object.entries({demand:500,capacity:20,queue:10,db:20})){const el=document.getElementById(id);el.value=value;el.dispatchEvent(new Event('input'))}});assert.match(await page.evaluate(()=>document.getElementById('safe-summary').textContent),/20 active \+ 10 waiting. 470/);
 await choose('safe');await page.evaluate(()=>document.getElementById('speed').value='1200');await click('play');await wait(1400);await click('play');const paused=await metrics();await wait(1400);assert.deepEqual(await metrics(),paused);await click('reset');await click('motion');assert.equal(await page.evaluate(()=>document.body.dataset.motion),'paused');
 await page.evaluate(()=>document.querySelector('.node').click());assert.match(await page.evaluate(()=>document.getElementById('component-help').textContent),/Asha:/);
 await page.evaluate(()=>document.querySelector('input[value=no]').click());await click('grade');assert.match(await page.evaluate(()=>document.getElementById('feedback').textContent),/Correct/);
 await page._client().send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});assert.equal(await page.evaluate(()=>getComputedStyle(document.querySelector('.wire span')).animationName),'none');
 await page.bringToFront();await page.evaluate(()=>document.getElementById('next').focus());await page._client().send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',text:'\r',unmodifiedText:'\r',windowsVirtualKeyCode:13,nativeVirtualKeyCode:13});await page._client().send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,nativeVirtualKeyCode:13});assert.match(await page.evaluate(()=>document.getElementById('step-count').textContent),/Step 2/);
 await page.evaluate(fs.readFileSync('.cache/episode015/tools/node_modules/axe-core/axe.min.js','utf8'));const violations=await page.evaluate(async()=>{const r=await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});return r.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))});fs.writeFileSync(review+'/lab-accessibility.json',JSON.stringify(violations,null,2));assert.deepEqual(violations,[]);
 for(const width of [1100,390]){await page.setViewport({width,height:1000,deviceScaleFactor:1});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));const shot=await page._client().send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(`${review}/lab-${width}.png`,Buffer.from(shot.value.data,'base64'))}
 await open('/blog/episodes/016/lab.html');await click('next');assert.match(await page.evaluate(()=>document.getElementById('step-count').textContent),/1 \/ 4/);await click('previous');await click('reset');
 for(const width of [1440,390]){await page.setViewport({width,height:1000,deviceScaleFactor:1});await open('/blog/java21-virtual-threads-checkout-bulkheads');assert.equal(await page.evaluate(()=>document.querySelector('link[rel=canonical]').href),'https://www.muniprasad.in/blog/java21-virtual-threads-checkout-bulkheads');assert.ok(await page.evaluate(()=>document.body.textContent.includes('Asha')));assert.equal(await page.evaluate(()=>document.querySelector('#original-capacity-lab iframe').getAttribute('src')),'/blog/episodes/016/lab.html');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));const shot=await page._client().send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(`${review}/after-${width}.png`,Buffer.from(shot.value.data,'base64'));await wait(700);const h=await page.evaluate(()=>parseInt(document.querySelector('#interactive-lab iframe').style.height));assert.ok(h>100&&h<6000,'frame '+h)}
 assert.deepEqual(errors,[]);console.log('PASS: 9 scenarios, timeout/permit/retry safety, sliders, playback/reset, keyboard, reduced motion, quiz, zero WCAG A/AA lab violations, original lab, preserved route, desktop/mobile overflow and auto-height.');
 }finally{await browser.close({silent:true})}
})().catch(e=>{console.error(e);process.exitCode=1});

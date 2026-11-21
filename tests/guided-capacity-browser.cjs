/* eslint-disable @typescript-eslint/no-require-imports -- Isolated browser validation. */
const fs=require('node:fs'),assert=require('node:assert/strict'),{openBrowser}=require('@remotion/renderer');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const browser=await openBrowser('chrome');try{
const page=await browser.newPage({context:()=>null,logLevel:'error',indent:false,pageIndex:0,onBrowserLog:null,onLog:()=>{}});const errors=[];page.on('error',e=>errors.push(String(e)));
await page.setViewport({width:1100,height:1100,deviceScaleFactor:1});await page.goto({url:'http://localhost:3002/blog/episodes/016/capacity-lab.html',timeout:120000});
const click=id=>page.evaluate(id=>document.getElementById(id).click(),id);
const snapshot=()=>page.evaluate(()=>[...document.querySelectorAll('.lane')].map(l=>({running:l.querySelectorAll('.carrier .run').length,blocked:l.querySelectorAll('.carrier .wait').length,provider:l.querySelectorAll('.zone')[1].querySelectorAll('.ticket').length,queue:l.querySelectorAll('.zone')[2].querySelectorAll('.ticket').length,done:l.querySelectorAll('.done').length})));
assert.deepEqual(await page.evaluate(()=>[...document.querySelectorAll('.big-count')].map(x=>x.textContent)),['2','4']);
for(const limit of [4,2]){
await page.evaluate(limit=>{const el=document.getElementById('provider');el.value=String(limit);el.dispatchEvent(new Event('change'))},limit);
await click('reset');
for(let step=0;step<=5;step++){const [p,v]=await snapshot();assert.ok(p.provider<=limit&&v.provider<=limit);assert.ok(p.running+p.blocked<=2&&v.running+v.blocked<=2);
if(step===0){assert.equal(p.queue,4);assert.equal(v.queue,4)}
if(step===2){assert.equal(p.blocked,2);assert.equal(p.queue,2);assert.equal(v.running,2);assert.equal(v.blocked,0)}
if(step===3){assert.ok(await page.evaluate(()=>[...document.querySelectorAll('.lane')].every(l=>{const bank=l.querySelectorAll('.zone')[1];return bank.querySelectorAll('.process').length>0&&!bank.textContent.includes('awaiting response')&&bank.textContent.includes('processing payment')})));assert.deepEqual(await page.evaluate(()=>[...document.querySelectorAll('.big-count')].map(x=>x.textContent)),['2',String(limit)]);assert.equal(p.provider,2);assert.equal(v.provider,limit);assert.equal(v.queue,limit===2?2:0);assert.equal(v.running+v.blocked,0);const before=await snapshot();await click('previous');await click('next');assert.deepEqual(await snapshot(),before)}
if(step===5){assert.equal(p.done,4);assert.equal(v.done,4);assert.equal(p.provider+v.provider,0)}else await click('next');}
}
await click('difference');assert.match(await page.evaluate(()=>document.getElementById('step-count').textContent),/Step 4/);await click('reset');await click('play');await wait(4300);await click('play');assert.match(await page.evaluate(()=>document.getElementById('step-count').textContent),/Step 2/);const paused=await snapshot();await wait(4200);assert.deepEqual(await snapshot(),paused);await click('reset');await click('motion');assert.equal(await page.evaluate(()=>document.body.dataset.motion),'paused');
await page.evaluate(()=>document.querySelector('input[value=waiting]').click());await click('grade');assert.match(await page.evaluate(()=>document.getElementById('feedback').textContent),/Correct/);
await page.bringToFront();await page.evaluate(()=>document.getElementById('next').focus());await page._client().send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',text:'\r',unmodifiedText:'\r',windowsVirtualKeyCode:13,nativeVirtualKeyCode:13});await page._client().send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,nativeVirtualKeyCode:13});assert.match(await page.evaluate(()=>document.getElementById('step-count').textContent),/Step 2/);
await click('next');await page._client().send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});assert.equal(await page.evaluate(()=>getComputedStyle(document.querySelector('.packet')).animationName),'none');
await page.evaluate(fs.readFileSync('.cache/episode015/tools/node_modules/axe-core/axe.min.js','utf8'));const violations=await page.evaluate(async()=>{const r=await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});return r.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))});assert.deepEqual(violations,[]);
await click('next');for(const width of [1100,390]){await page.setViewport({width,height:1300,deviceScaleFactor:1});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));const shot=await page._client().send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(`.cache/episode016/review/guided-${width}.png`,Buffer.from(shot.value.data,'base64'))}
assert.deepEqual(errors,[]);console.log('PASS: both provider capacities; all six steps; carrier/provider bounds; identical completed requests; replay/reset; autoplay pause; keyboard; reduced motion; quiz; WCAG A/AA; desktop/mobile overflow.');
}finally{await browser.close({silent:true})}})().catch(e=>{console.error(e);process.exitCode=1});

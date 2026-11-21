/* eslint-disable @typescript-eslint/no-require-imports -- Isolated media validation. */
const fs=require('node:fs'),assert=require('node:assert/strict'),{openBrowser}=require('@remotion/renderer');
const timeline=require('../public/blog/episodes/016/timeline-aligned.json');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const browser=await openBrowser('chrome');try{
 const page=await browser.newPage({context:()=>null,logLevel:'error',indent:false,pageIndex:0,onBrowserLog:null,onLog:()=>{}});
 await page.setViewport({width:1440,height:1000,deviceScaleFactor:1});await page.goto({url:'http://localhost:3002/blog/java21-virtual-threads-checkout-bulkheads',timeout:120000});
 assert.equal(await page.evaluate(()=>document.querySelector('video').getAttribute('src')),'/blog/episodes/016/lesson-aligned.mp4');
 for(let n=0;n<100;n++){if(await page.evaluate(()=>document.querySelector('video').readyState>=1))break;await wait(100)}
 const media=await page.evaluate(()=>{const v=document.querySelector('video');return {duration:v.duration,controls:v.controls,track:v.querySelector('track').getAttribute('src'),error:v.error?.message}});assert.ok(media.duration>=60&&media.duration<=90,JSON.stringify(media));assert.equal(media.controls,true);assert.equal(media.error,undefined);assert.match(media.track,/captions-aligned.vtt/);
 await page.evaluate(()=>{const v=document.querySelector('video');v.muted=true;v.textTracks[0].mode='hidden';[...document.querySelectorAll('#lesson-video button')].find(b=>b.textContent==='Play video').click()});await wait(800);assert.ok(await page.evaluate(()=>document.querySelector('video').currentTime>0));await page.evaluate(()=>document.querySelector('video').pause());
 await page.evaluate(()=>document.querySelectorAll('.video-chapters button')[4].click());await wait(300);assert.ok(await page.evaluate(()=>document.querySelector('video').currentTime)>=timeline.scenes[4].from/30-.1);await page.evaluate(()=>document.querySelector('video').pause());
 for(let n=0;n<50;n++){if(await page.evaluate(()=>document.querySelector('video').textTracks[0].cues?.length>0))break;await wait(100)}assert.equal(await page.evaluate(()=>document.querySelector('video').textTracks[0].cues.length),timeline.cues.length);
 await page.evaluate(()=>document.querySelectorAll('.video-chapters button')[3].click());await wait(500);const seekTime=await page.evaluate(()=>document.querySelector('video').currentTime);assert.ok(seekTime>=timeline.scenes[3].from/30-.02&&seekTime<timeline.scenes[3].from/30+3,'chapter time '+seekTime);await page.evaluate(()=>document.querySelector('video').pause());
 for(let n=0;n<50;n++){if(await page.evaluate(()=>document.querySelector('video').textTracks[0].cues?.length>0))break;await wait(100)}assert.equal(await page.evaluate(()=>document.querySelector('video').textTracks[0].cues.length),timeline.cues.length);
 await page.evaluate(()=>document.getElementById('capacity-customer-title').closest('section').scrollIntoView({block:'start',behavior:'instant'}));const shot=await page._client().send('Page.captureScreenshot',{format:'png'});fs.writeFileSync('.cache/episode016/review/story-1440.png',Buffer.from(shot.value.data,'base64'));
 fs.writeFileSync('.cache/episode016/review/player-aligned-qa.json',JSON.stringify({...media,captionCues:timeline.cues.length,playPauseSeek:'passed'},null,2));console.log('PASS: actual redesigned MP4 loads, duration within 60–90 seconds, controls/play/pause/chapter seek and aligned VTT cues.');
}finally{await browser.close({silent:true})}})().catch(e=>{console.error(e);process.exitCode=1});

/* eslint-disable @typescript-eslint/no-require-imports -- Standalone CommonJS validation script. */
// Automated isolated headless-browser test; uses the existing Remotion browser runtime.
const assert=require('node:assert/strict');const fs=require('node:fs');
const {openBrowser}=require('@remotion/renderer');
const base=process.env.CQRS_PREVIEW_URL||'http://localhost:3002';
const pause=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const browser=await openBrowser('chrome');
  try{
    const page=await browser.newPage({context:()=>null,logLevel:'error',indent:false,pageIndex:0,onBrowserLog:null,onLog:()=>{}});
    const errors=[];page.on('error',error=>errors.push(String(error)));
    await page.setViewport({width:1440,height:1000,deviceScaleFactor:1});
    await page.goto({url:base+'/blog/cqrs-eventual-consistency-order-status',timeout:120000});
    assert.equal(await page.evaluate(()=>document.querySelector('details[data-cqrs-extended]').open),false);
    assert.equal(await page.evaluate(()=>document.querySelector('#interactive-lab iframe').getAttribute('src')),'/blog/episodes/014/lab.html');
    const original=await browser.newPage({context:()=>null,logLevel:'error',indent:false,pageIndex:1,onBrowserLog:null,onLog:()=>{}});
    await original.setViewport({width:1000,height:1100,deviceScaleFactor:1});
    await original.goto({url:base+'/blog/episodes/014/lab.html',timeout:60000});
    for(let i=0;i<50;i++){if(await original.evaluate(()=>document.querySelector('#step-count').textContent.includes('4 steps')))break;await pause(100)}
    await original.evaluate(()=>document.querySelector('#next').click());
    assert.match(await original.evaluate(()=>document.querySelector('#step-count').textContent),/1 \/ 4 steps/);
    await original.evaluate(()=>document.querySelector('#previous').click());
    assert.match(await original.evaluate(()=>document.querySelector('#step-count').textContent),/0 \/ 4 steps/);
    await original.evaluate(()=>{document.querySelector('#play').click();document.querySelector('#play').click()});
    assert.match(await original.evaluate(()=>document.querySelector('#step-count').textContent),/1 \/ 4 steps/);
    await original.evaluate(()=>{document.querySelector('#reset').click();document.querySelector('#next').click()});
    fs.mkdirSync('.cache/cqrs-review',{recursive:true});
    const restored=await original._client().send('Page.captureScreenshot',{format:'png'});
    fs.writeFileSync('.cache/cqrs-review/restored-lab.png',Buffer.from(restored.value.data,'base64'));
    await original.close();
    await page.evaluate(()=>{document.querySelector('details[data-cqrs-extended]').open=true});
    async function text(){return page.evaluate(()=>document.querySelector('#interactive-lab-enhanced')?.textContent||'');}
    async function waitText(expected){for(let i=0;i<60;i++){if((await text()).includes(expected))return;await pause(100)}throw Error('Missing UI state: '+expected);}
    await waitText('Nine-step journey');
    await page.evaluate(()=>document.querySelector('[aria-label="Database architecture comparison"] button:last-child').click());await pause(100);
    assert.ok(await page.evaluate(()=>document.body.textContent.includes('The asynchronous event path introduces a temporary gap')));
    // Hydration ready: a click must produce the expected state, not merely SSR markup.
    async function click(label){await page.evaluate(label=>{const b=[...document.querySelectorAll('#interactive-lab-enhanced button')].find(e=>e.textContent===label);if(!b||b.disabled)throw Error('Unavailable button '+label);b.click()},label);await pause(100);}
    async function choose(label,value){await page.evaluate((label,value)=>{const l=[...document.querySelectorAll('#interactive-lab-enhanced label')].find(l=>l.firstChild?.textContent===label);const s=l?.querySelector('select');if(!s)throw Error('Missing select '+label);s.value=value;s.dispatchEvent(new Event('change',{bubbles:true}))},label,value);await pause(100);}
    await click('Start simulation');await waitText('Step 1 / 9');
    for(let i=0;i<8;i++)await click('Next step →');
    await waitText('Step 9 / 9');assert.match(await text(),/History has caught up/);
    await click('Previous step');await waitText('Step 8 / 9');assert.match(await text(),/Older version rejected/);
    await click('Reset');await waitText('Step 0 / 9');
    await page.evaluate(()=>{const s=document.querySelector('select[aria-label="Simulation speed"]');s.value='1200';s.dispatchEvent(new Event('change',{bubbles:true}))});await pause(100);
    await click('Play');await waitText('Step 1 / 9');await waitText('Step 2 / 9');await click('Pause');
    const paused=await page.evaluate(()=>document.querySelector('#interactive-lab-enhanced progress').value);await pause(1300);
    assert.equal(await page.evaluate(()=>document.querySelector('#interactive-lab-enhanced progress').value),paused);
    await click('Pause motion');assert.equal(await page.evaluate(()=>document.querySelector('#interactive-lab-enhanced').dataset.motion),'false');
    await click('Failure and recovery lab');
    const scenarios=await page.evaluate(()=>[...document.querySelectorAll('#interactive-lab-enhanced select')[0].options].map(o=>o.value));
    for(const design of ['protected','unsafe']){
      await choose('Design',design);
      for(const scenario of scenarios){
        await choose('Scenario',scenario);await click('Start simulation');
        for(let i=0;i<12;i++){
          const done=await page.evaluate(()=>[...document.querySelectorAll('#interactive-lab-enhanced button')].find(e=>e.textContent==='Next step →').disabled);
          if(done)break;await click('Next step →');
        }
        const final=await page.evaluate(()=>Object.fromEntries([...document.querySelectorAll('#interactive-lab-enhanced dl>div')].map(d=>[d.querySelector('dt').textContent,d.querySelector('dd').textContent])));
        assert.equal(final['Write status'],'PAID');assert.equal(final['Write version'],'2');
        assert.equal(final['Read status'],design==='unsafe'&&['lag','ordering'].includes(scenario)?'PENDING':'PAID',`${design}/${scenario}`);
        if(design==='protected')assert.equal(final['Projection writes'],'1');
      }
    }
    // Journey always uses protected behavior even after selecting an unsafe lab.
    await click('Nine-step journey');await click('Start simulation');for(let i=0;i<8;i++)await click('Next step →');await waitText('History has caught up');
    await page.evaluate(()=>{const b=[...document.querySelectorAll('#interactive-lab-enhanced ol button')].find(b=>b.textContent.includes('Projection consumer'));b.click()});
    assert.match(await text(),/Projection consumer:/);
    const advanced=await page.evaluate(()=>document.querySelectorAll('.article-advanced').length);assert.equal(advanced,2);
    await page.evaluate(()=>{location.hash='section-atomic-persistent-projection-guard'});await pause(150);
    assert.ok(await page.evaluate(()=>document.querySelector('#section-atomic-persistent-projection-guard').closest('details').open));
    await page.evaluate(()=>{const input=[...document.querySelectorAll('input[name="cqrs-quiz"]')][1];input.click()});await waitText('Correct. Separate');
    await page._client().send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
    assert.equal(await page.evaluate(()=>getComputedStyle(document.querySelector('[class*="wire"] span')).animationName),'none');
    await page._client().send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
    await page._client().send('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
    assert.ok(await page.evaluate(()=>document.activeElement!==document.body));
    fs.mkdirSync('.cache/cqrs-review',{recursive:true});
    for(const width of [1440,390]){
      await page.setViewport({width,height:1000,deviceScaleFactor:1});
      await page.evaluate(()=>document.querySelector('#interactive-lab-enhanced').scrollIntoView());await pause(200);
      const overflow=await page.evaluate(()=>({width:innerWidth,doc:document.documentElement.scrollWidth,lab:document.querySelector('#interactive-lab-enhanced').getBoundingClientRect().width}));
      assert.ok(overflow.doc<=width+1,JSON.stringify(overflow));
      const shot=await page._client().send('Page.captureScreenshot',{format:'png'});
      fs.writeFileSync(`.cache/cqrs-review/${width}.png`,Buffer.from(shot.value.data,'base64'));
      await page.evaluate(()=>document.querySelector('#customer-story').closest('section').scrollIntoView());await pause(100);
      const story=await page._client().send('Page.captureScreenshot',{format:'png'});
      fs.writeFileSync(`.cache/cqrs-review/story-${width}.png`,Buffer.from(story.value.data,'base64'));
    }
    assert.equal(errors.length,0,errors.join('\n'));
    console.log('PASS: nine steps; 8 scenarios × 2 designs; Previous/Reset/Play/Pause/motion; keyboard focus; reduced motion; desktop/mobile overflow.');
  }finally{await browser.close({silent:true})}
})().catch(e=>{console.error(e);process.exitCode=1});

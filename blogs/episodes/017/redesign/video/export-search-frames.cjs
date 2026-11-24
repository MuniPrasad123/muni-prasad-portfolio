/* eslint-disable @typescript-eslint/no-require-imports -- Standalone Node media authoring tool. */
/* Persistent text/scene keyframes; full-rate packet animation and audio are muxed by export_video.py. */
const fs=require('node:fs'),path=require('node:path');
const {bundle}=require('@remotion/bundler');
const {renderFrames,selectComposition}=require('@remotion/renderer');
const root=path.resolve(__dirname,'../../../../..'),timeline=require(path.join(root,'public/blog/episodes/017/timeline-search.json'));
(async()=>{
const dir=path.join(root,'.cache/episode017/search-keyframes');fs.mkdirSync(dir,{recursive:true});
const frames=new Set([0]);for(const scene of timeline.scenes){frames.add(scene.from);for(const cue of scene.cues){frames.add(scene.from+Math.ceil(cue.start*30));frames.add(scene.from+Math.ceil(cue.end*30))}if(scene.phase==='heap')for(let n=0;n<scene.frames;n+=60)frames.add(scene.from+n)}
const selected=[...frames].filter(f=>f<timeline.durationInFrames).sort((a,b)=>a-b);fs.writeFileSync(path.join(dir,'frames.json'),JSON.stringify(selected));
const url=await bundle({entryPoint:path.join(root,'video/index.tsx')});const props={exportMode:true};const composition=await selectComposition({serveUrl:url,id:'Episode017',inputProps:props});
await renderFrames({serveUrl:url,composition,inputProps:props,frames:selected,outputDir:dir,imageFormat:'png',concurrency:1,chromiumOptions:{gl:'angle'},onStart:()=>{},onFrameUpdate:n=>{if(n%10===0)console.log(n+'/'+selected.length)},logLevel:'error'});
console.log('Saved '+selected.length+' persistent scene/caption keyframes.');
})().catch(e=>{console.error(e);process.exitCode=1});

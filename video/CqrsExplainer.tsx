import React from 'react'
import { AbsoluteFill, Audio, Composition, interpolate, staticFile, useCurrentFrame } from 'remotion'
import scenes from '../blogs/episodes/014/media/scenes.json'

const FPS=30, SCENE_SECONDS=18
export function CqrsExplainer({voiceover}:{voiceover:string}) {
  const frame=useCurrentFrame(),index=Math.min(5,Math.floor(frame/(FPS*SCENE_SECONDS)))
  const local=frame%(FPS*SCENE_SECONDS),scene=scenes[index],cue=Math.min(2,Math.floor(local/(FPS*6)))
  const progress=interpolate(local,[0,FPS*SCENE_SECONDS],[0,1],{extrapolateRight:'clamp'})
  return <AbsoluteFill style={{background:'linear-gradient(135deg,#102137,#0b1729)',color:'#f1f6fc',fontFamily:'Arial',padding:70}}>
    {voiceover&&<Audio src={staticFile(voiceover)}/>}
    <div style={{color:'#eacb80',fontSize:23,letterSpacing:3}}>ARCHITECTURE IN MOTION · EPISODE 014 · {index+1}/6</div>
    <h1 style={{fontSize:60,lineHeight:1.12,margin:'34px 0 18px'}}>{scene.title}</h1>
    <div style={{fontSize:27,color:'#b5cde3'}}>{scene.subtitle}</div>
    <div style={{display:'flex',gap:20,marginTop:38}}>{scene.nodes.map((node,i)=><div key={node} style={{flex:1,border:'2px solid #486782',borderRadius:16,padding:22,fontSize:25,background:'#102a40',opacity:progress>i/4?1:.35}}>{node}{i<2?' →':''}</div>)}</div>
    <div style={{display:'flex',gap:30,marginTop:36,fontSize:31}}><div style={{flex:1,border:'2px solid #73dec0',borderRadius:12,padding:25}}>Write authority<br/><strong style={{color:'#88e6c4'}}>{scene.write}</strong></div><div style={{flex:1,border:'2px solid #edca7d',borderRadius:12,padding:25}}>My Orders view<br/><strong style={{color:'#f4d087'}}>{scene.read}</strong></div></div>
    <div style={{height:5,background:'#3b556d',marginTop:24}}><div style={{height:'100%',width:`${progress*100}%`,background:'#76e0c5'}}/></div>
    <div style={{position:'absolute',bottom:60,left:70,right:70,minHeight:92,padding:'18px 24px',borderRadius:10,background:'#050d16',fontSize:29,lineHeight:1.35}}>{scene.voiceover[cue]}</div>
    <div style={{position:'absolute',bottom:20,fontSize:17,color:'#b4c7d9'}}>Illustrative scenario · muniprasad.in · {voiceover?'Narration track supplied':'Silent storyboard preview · narration pending'}</div>
  </AbsoluteFill>
}
export function CqrsComposition(){return <Composition id="Episode014" component={CqrsExplainer} width={1600} height={1000} fps={FPS} durationInFrames={FPS*SCENE_SECONDS*6} defaultProps={{voiceover:''}}/>}

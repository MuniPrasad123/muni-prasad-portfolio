import React from 'react'
import { AbsoluteFill, Audio, Composition, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion'
import timeline from '../public/blog/episodes/015/timeline.json'

const actors=['Maya · one payment','Payment provider','Merchant API','Inbox + state guard','Outbox worker','Email + warehouse']
export function WebhookExplainer() {
  const frame=useCurrentFrame()
  const index=Math.max(0,timeline.scenes.findIndex(scene=>frame>=scene.from&&frame<scene.from+scene.frames))
  const scene=timeline.scenes[index],local=frame-scene.from,seconds=local/30
  const cue=scene.cues.find(c=>seconds>=c.start&&seconds<c.end)
  const fade=interpolate(local,[0,12],[0,1],{extrapolateRight:'clamp'})
  const pulse=(Math.sin(local/12)+1)/2
  const packet=(local%105)/105
  return <AbsoluteFill style={{background:'linear-gradient(150deg,#102137,#0b1729)',color:'#eef7ff',fontFamily:'Arial',padding:60}}>
    {timeline.scenes.map((s,i)=><Sequence from={s.from} durationInFrames={s.frames} key={i}><Audio src={staticFile(s.audio)}/></Sequence>)}
    <div style={{fontSize:23,color:'#edcd81',letterSpacing:3}}>ARCHITECTURE IN MOTION · EPISODE 015</div>
    <div style={{fontSize:25,color:'#9fdecf',marginTop:30}}>{String(index+1).padStart(2,'0')} / 07 · {scene.label}</div>
    <h1 style={{position:'absolute',left:60,right:60,top:170,margin:0,fontSize:68,lineHeight:1.08,opacity:fade}}>{scene.title}</h1>
    <div style={{position:'absolute',left:60,right:60,top:355,fontSize:30,lineHeight:1.4,color:'#c1d6e6'}}>{scene.note}</div>
    <div style={{position:'absolute',left:60,right:60,top:495,display:'grid',gridTemplateColumns:'1fr 1fr',gap:22}}>{actors.map((actor,i)=><div key={actor} style={{height:132,display:'flex',alignItems:'center',padding:24,borderRadius:17,fontSize:30,lineHeight:1.3,border:`2px solid ${i===scene.active?'#f0ce7d':'#456481'}`,background:i===scene.active?'#21483f':'#0b1c2f',boxShadow:i===scene.active?`0 0 ${12+pulse*14}px #5fdfbb55`:'none'}}><span style={{fontSize:24,color:'#8cdccc',marginRight:16}}>{i+1}.</span>{actor}</div>)}</div>
    <div style={{position:'absolute',left:80,right:80,top:975,height:48,borderBottom:'3px solid #4a6983'}}><div style={{position:'absolute',left:`${packet*80}%`,fontSize:26,color:index<3?'#ffc397':'#8eebd0',whiteSpace:'nowrap'}}>✉ evt_501 →</div></div>
    <div style={{position:'absolute',left:60,right:60,top:1075,padding:28,borderRadius:16,border:`2px solid ${index<3?'#efbb7a':'#73dcbc'}`,background:index<3?'#3b2e26':'#11382e'}}><div style={{fontSize:33,fontWeight:700,lineHeight:1.3}}>{scene.state}</div><div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:20,marginTop:25,fontSize:26,lineHeight:1.5}}><span><b style={{fontSize:44,color:'#97e7ca'}}>1</b><br/>provider charge</span><span><b style={{fontSize:44,color:index<3?'#ffc299':'#97e7ca'}}>{scene.emails}</b><br/>email intents</span><span><b style={{fontSize:44,color:index<3?'#ffc299':'#97e7ca'}}>{scene.shipments}</b><br/>shipment intents</span></div></div>
    <p style={{position:'absolute',left:65,right:65,top:1350,fontSize:25,lineHeight:1.5,color:'#b8d0e1'}}>Illustrative counters. Logical intents are not a guarantee of exactly-once physical email or shipment delivery.</p>
    <div style={{position:'absolute',left:50,right:50,top:1530,minHeight:200,padding:'28px 32px',background:'#040c17',border:'1px solid #45617d',borderRadius:14,fontSize:43,lineHeight:1.38}}>{cue?.text||''}</div>
    <div style={{position:'absolute',left:60,right:60,bottom:105,height:7,background:'#344f65',borderRadius:5}}><div style={{width:`${(frame+1)/timeline.durationInFrames*100}%`,height:'100%',background:'#7ee2c1'}}/></div>
    <div style={{position:'absolute',bottom:57,left:60,fontSize:20,color:'#b8cddd'}}>muniprasad.in · Illustrative scenario · Synthetic English narration</div>
  </AbsoluteFill>
}
export function WebhookComposition(){return <Composition id="Episode015" component={WebhookExplainer} width={1080} height={1920} fps={timeline.fps} durationInFrames={timeline.durationInFrames}/>}

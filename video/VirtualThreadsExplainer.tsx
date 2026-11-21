import React from 'react'
import { AbsoluteFill, Audio, Composition, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion'
import timeline from '../public/blog/episodes/016/timeline-aligned.json'

function Flow({local,phase}:{local:number;phase:string}) {
  const bounded=['bounded','recovery','confirmed'].includes(phase)
  const packet=(local%100)/100
  const cards=[{x:0,label:'CHECKOUT',detail:'Asha’s request'},{x:330,label:bounded?'BULKHEAD':phase==='platform'?'PLATFORM THREADS':'VIRTUAL THREADS',detail:bounded?'Active + waiting limits':phase==='platform'?'OS threads occupied':'Pause wait; reuse carrier'},{x:660,label:'DEPENDENCY',detail:'Finite provider / DB capacity'}]
  return <div style={{position:'absolute',left:60,top:490,width:960,height:650}}>
    {cards.map(card=><div key={card.x} style={{position:'absolute',left:card.x,top:20,width:300,height:150,padding:22,border:'2px solid #7292a6',borderRadius:16,background:'#122c40',fontSize:26,lineHeight:1.5}}><b style={{color:'#efcf83'}}>{card.label}</b><div style={{fontSize:24,marginTop:12}}>{card.detail}</div></div>)}
    {[0,1].map(i=><div key={i} style={{position:'absolute',left:310+i*330,top:80,fontSize:30,color:'#8de4ca'}}>→</div>)}
    {Array.from({length:18},(_,i)=>{
      const progress=((local+i*11)%130)/130
      const rejected=bounded&&i>7
      return <div key={i} style={{position:'absolute',left:progress*(rejected?540:910),top:210+(i%4)*34+(rejected?progress*90:0),width:13,height:13,borderRadius:4,background:rejected?'#f4c77d':'#79dfc2',opacity:progress<.03?.2:1}}/>
    })}
    <div style={{position:'absolute',top:400,left:0,right:0,padding:24,background:'#0a192a',border:'1px solid #4c6a82',borderRadius:14}}>
      {phase==='platform'?<><div style={{fontSize:32}}>100 platform threads waiting on responses</div><div style={{display:'flex',gap:18,marginTop:24}}>{Array.from({length:6},(_,i)=><div key={i} style={{width:125,height:46,background:'#674b28',border:'2px solid #efcf83',textAlign:'center',paddingTop:6}}>waiting</div>)}</div><div style={{fontSize:28,color:'#f1ce83',marginTop:20}}>New shoppers queue → spinner → timeout</div></>:
       phase==='threads'?<><div style={{fontSize:31,color:'#92e6c8'}}>Waiting request pauses during supported I/O</div><div style={{fontSize:29,marginTop:25}}>Carrier runs another virtual thread →</div><div style={{display:'flex',gap:16,marginTop:22}}>{['A waits','B runs','C waits','D runs'].map((t,i)=><div key={t} style={{padding:12,background:(Math.floor(local/24)+i)%2?'#31576c':'#14634f',borderRadius:6,fontSize:26}}>{t}</div>)}</div><div style={{fontSize:25,color:'#bbd4e2',marginTop:18}}>Response arrives → request resumes</div></>:
       phase==='identity'?<><div style={{fontSize:32,color:'#92e6c8'}}>Two clicks → one durable attempt</div><div style={{fontSize:29,marginTop:25}}>Customer + key + payload hash</div><div style={{fontSize:26,color:'#bbd4e2',marginTop:15}}>Same provider reference across retries</div></>:
       phase==='recovery'?<><div style={{fontSize:34,color:'#f2ce80'}}>UNKNOWN → lookup → confirmed</div><div style={{fontSize:28,marginTop:24}}>Use the original payment reference.</div><div style={{fontSize:27,marginTop:14,color:'#c1d8e8'}}>A timeout does not cancel remote work.</div></>:
       phase==='confirmed'?<><div style={{fontSize:36,color:'#89e5c0'}}>✓ Order confirmed after verification</div><div style={{fontSize:28,marginTop:24}}>Bound capacity · preserve identity</div><div style={{fontSize:28,marginTop:12}}>Reconcile before another payment</div></>:
       <><div style={{fontSize:31}}>{bounded?'20 active · 10 waiting · 470 busy':'500 requests · 20 connections'}</div><div style={{display:'grid',gridTemplateColumns:'repeat(10,1fr)',gap:8,marginTop:25}}>{Array.from({length:20},(_,i)=><div key={i} style={{height:24,borderRadius:3,background:i/20<packet?'#82dfc1':'#31576c'}}/>)}</div><div style={{fontSize:23,color:'#bad0e0',marginTop:18}}>Illustrative counts · no benchmark claim</div></>}
    </div>
  </div>
}

export function VirtualThreadsExplainer() {
  const frame=useCurrentFrame(),seconds=frame/30
  const index=Math.max(0,timeline.scenes.findIndex(scene=>frame>=scene.from&&frame<scene.from+scene.frames))
  const scene=timeline.scenes[index],local=frame-scene.from
  const caption=scene.cues.find(cue=>local/30>=cue.start&&local/30<cue.end)
  return <AbsoluteFill style={{background:'linear-gradient(155deg,#102137,#0b1729)',color:'#eff7fc',fontFamily:'Arial'}}>
    {timeline.scenes.map((s,i)=><Sequence from={s.from} durationInFrames={s.frames} key={i}><Audio src={staticFile(s.audio)}/></Sequence>)}
    <Audio src={staticFile('blog/episodes/016/ambient.wav')} volume={f=>{const t=f/30;const distance=Math.min(...timeline.cues.map(c=>t>=c.start&&t<=c.end?0:Math.min(Math.abs(t-c.start),Math.abs(t-c.end))));return interpolate(distance,[0,.3],[.25,.6],{extrapolateRight:'clamp'});}}/>
    <div style={{position:'absolute',left:60,top:60,fontSize:23,letterSpacing:2,color:'#eecb81'}}>ARCHITECTURE IN MOTION · EPISODE 016</div>
    <div style={{position:'absolute',left:60,right:60,top:122,fontSize:25,color:'#99ddcb'}}>{String(index+1).padStart(2,'0')} / 07 · {scene.label}</div>
    <h1 style={{position:'absolute',left:60,right:60,top:190,fontSize:64,lineHeight:1.1,margin:0}}>{scene.title}</h1>
    <p style={{position:'absolute',left:60,right:60,top:355,fontSize:29,lineHeight:1.4,margin:0,color:'#bfd5e5'}}>{scene.note}</p>
    <Flow local={local} phase={scene.phase}/>
    <div style={{position:'absolute',left:60,right:60,top:1220,padding:25,border:'2px solid #78dcb9',borderRadius:14,background:'#12392f',fontSize:32,lineHeight:1.4}}>{scene.status}</div>
    <p style={{position:'absolute',left:65,right:65,top:1360,fontSize:24,lineHeight:1.5,color:'#bcd2e3'}}>Asha’s payment state is separate from burst-capacity counters. Animation is a visual replay, not live payment traffic.</p>
    <div style={{position:'absolute',left:50,right:50,top:1530,minHeight:205,padding:'25px 30px',background:'#040d17',border:'1px solid #44657d',borderRadius:12,fontSize:42,lineHeight:1.4}}>{caption?.text||''}</div>
    <div style={{position:'absolute',left:60,right:60,bottom:102,height:7,background:'#345269'}}><div style={{height:'100%',background:'#81e0c2',width:`${seconds/(timeline.durationInFrames/30)*100}%`}}/></div>
    <div style={{position:'absolute',left:60,bottom:55,fontSize:20,color:'#b8cedc'}}>muniprasad.in · Indian English male neural narration</div>
  </AbsoluteFill>
}
export function VirtualThreadsComposition(){return <Composition id="Episode016" component={VirtualThreadsExplainer} width={1080} height={1920} fps={30} durationInFrames={timeline.durationInFrames}/>}

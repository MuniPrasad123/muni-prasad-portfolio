import React from 'react'
import {AbsoluteFill,Audio,Composition,Sequence,staticFile,useCurrentFrame} from 'remotion'
import timeline from '../public/blog/episodes/017/timeline-redesign.json'

function Diagram({phase,local,exportMode}:{phase:string;local:number;exportMode:boolean}){
 const heap=phase==='heap',fix=phase==='fix',reclaim=heap&&Math.floor(local/60)%2===1
 return <div style={{position:'absolute',top:500,left:60,width:960,height:690}}>
  {[['SHOPPER','Place Order'],['CHECKOUT JVM','Heap + Java threads'],['PAYMENT SERVICE','Processes payment']].map(([a,b],i)=><div key={a} style={{position:'absolute',top:0,left:i*330,width:300,height:140,border:'2px solid #6d91a6',borderRadius:15,padding:20,background:'#122e42'}}><b style={{color:'#efcf83',fontSize:25}}>{a}</b><div style={{fontSize:24,marginTop:18}}>{b}</div></div>)}
  {[0,1].map(i=><div key={i} style={{position:'absolute',left:310+i*330,top:65,color:'#91e6ca',fontSize:27}}>→</div>)}
  {!exportMode&&Array.from({length:5},(_,i)=><div key={i} style={{position:'absolute',left:((local+i*24)%140)/140*930,top:170,width:13,height:13,borderRadius:3,background:'#88e5c6'}}/>)}
  <div style={{position:'absolute',top:225,width:960,padding:24,border:'1px solid #597b91',borderRadius:13,background:'#0a192a'}}>
  {heap||fix?<><h2 style={{fontSize:32,margin:0,color:'#efcf83'}}>{fix?'Remove redundant serialization; keep correct totals':'Heap: objects used by checkout'}</h2><div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:12,margin:'28px 0'}}>{Array.from({length:12},(_,i)=><div key={i} style={{height:62,borderRadius:6,background:i<6?'#194f70':reclaim||fix?'#173244':'#6b4d25',border:'2px solid '+(i<6?'#90c5eb':reclaim||fix?'#486379':'#e7c67c'),fontSize:17,paddingTop:18,textAlign:'center'}}>{i<6?'reachable':reclaim||fix?'free space':'unreachable'}</div>)}</div><p style={{fontSize:26,lineHeight:1.5,margin:0}}>{fix?'Teaching picture, not a measured heap or pause improvement.':reclaim?'Collector reclaims unreachable objects. Live objects remain.':'A completed calculation can leave temporary objects unreachable.'}</p></>:
  phase==='customer'?<><h2 style={{fontSize:35,margin:0}}>Place Order → spinner → timeout</h2><div style={{height:65,width:65,border:'7px solid #46687f',borderTopColor:'#eecd80',borderRadius:'50%',margin:'30px auto',transform:`rotate(${local*4}deg)`}}/><p style={{fontSize:30,color:'#f0ce82',lineHeight:1.5,margin:0}}>“Do I pay again, or is my order already placed?”</p></>:
  phase==='safe'?<><h2 style={{fontSize:34,margin:0,color:'#95e8cd'}}>UNKNOWN → lookup original payment</h2><p style={{fontSize:29,lineHeight:1.6}}>“We’re checking your payment.”</p><p style={{fontSize:28,lineHeight:1.5,color:'#bfd8e7',margin:0}}>Same identity · authoritative result · no blind retry</p></>:
  <><h2 style={{fontSize:32,margin:0}}>Same-server evidence · 0 to 2,000 ms</h2>{[['Request',0,2000,'#79dfc2'],['GC pause',500,300,'#efca78'],['Payment wait',900,900,'#81bcec']].map(([label,start,length,color])=><div key={String(label)} style={{marginTop:24}}><div style={{fontSize:25,marginBottom:8}}>{label} · {length} ms</div><div style={{height:30,background:'#223a50',borderRadius:4}}><div style={{height:30,marginLeft:`${Number(start)/20}%`,width:`${Number(length)/20}%`,background:String(color),borderRadius:4}}/></div></div>)}<p style={{fontSize:24,lineHeight:1.5,color:'#efcf83',margin:'24px 0 0'}}>A 300 ms overlapping pause is not a 2,000 ms GC diagnosis.</p></>}
  </div>
 </div>
}
export function GcDiagnosisExplainer({exportMode=false}:{exportMode?:boolean}={}){const frame=useCurrentFrame();const index=Math.max(0,timeline.scenes.findIndex(s=>frame>=s.from&&frame<s.from+s.frames));const scene=timeline.scenes[index],local=frame-scene.from;const caption=scene.cues.find(c=>local/30>=c.start&&local/30<c.end)
 return <AbsoluteFill style={{background:'linear-gradient(155deg,#102137,#0b1729)',color:'#eff7fc',fontFamily:'Arial'}}>
 {timeline.scenes.map((s,i)=><Sequence key={i} from={s.from} durationInFrames={s.frames}><Audio src={staticFile(s.audio)}/></Sequence>)}
 <div style={{position:'absolute',top:60,left:60,fontSize:23,letterSpacing:2,color:'#eecb81'}}>ARCHITECTURE IN MOTION · EPISODE 017</div>
 <div style={{position:'absolute',top:122,left:60,fontSize:25,color:'#9be1cd'}}>0{index+1} / 06 · {scene.label}</div>
 <h1 style={{position:'absolute',top:195,left:60,right:60,fontSize:62,lineHeight:1.12,margin:0}}>{scene.title}</h1>
 <p style={{position:'absolute',top:365,left:60,right:60,fontSize:28,lineHeight:1.45,margin:0,color:'#c2d9e6'}}>{scene.note}</p>
 <Diagram phase={scene.phase} local={local} exportMode={exportMode}/>
 <div style={{position:'absolute',top:1240,left:60,right:60,padding:24,border:'2px solid #7bdec0',borderRadius:12,background:'#103b31',fontSize:30,lineHeight:1.5}}>Observe → correlate → profile → change one thing → validate</div>
 <p style={{position:'absolute',top:1390,left:65,right:65,fontSize:24,lineHeight:1.5,color:'#bdd3e3'}}>Illustrative timings and memory blocks. Animation replay does not create requests, allocations or payments.</p>
 <div style={{position:'absolute',top:1540,left:50,right:50,minHeight:200,padding:28,fontSize:42,lineHeight:1.4,border:'1px solid #4d6c82',borderRadius:12,background:'#040d17'}}>{caption?.text||''}</div>
 <div style={{position:'absolute',bottom:102,left:60,right:60,height:7,background:'#345269'}}><div style={{height:7,background:'#81dfc2',width:`${frame/timeline.durationInFrames*100}%`}}/></div>
 <div style={{position:'absolute',bottom:55,left:60,fontSize:20,color:'#b9d1df'}}>muniprasad.in · Indian English male neural narration</div>
 </AbsoluteFill>}
export function GcDiagnosisComposition(){return <Composition id="Episode017" component={GcDiagnosisExplainer} width={1080} height={1920} fps={30} durationInFrames={timeline.durationInFrames}/>}

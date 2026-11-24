'use client'

import Link from 'next/link'
import {useEffect,useRef,useState,useSyncExternalStore} from 'react'
import {ArrowLeft,ArrowRight,ArrowUpRight,Pause,Play} from 'lucide-react'
import type {ArticleMeta} from '@/lib/blog'
import styles from './BlogHighlights.module.css'

function subscribeActivity(notify:()=>void){const media=window.matchMedia('(prefers-reduced-motion: reduce)');const observer=new MutationObserver(notify);observer.observe(document.documentElement,{attributes:true,attributeFilter:['class']});media.addEventListener('change',notify);document.addEventListener('visibilitychange',notify);return()=>{observer.disconnect();media.removeEventListener('change',notify);document.removeEventListener('visibilitychange',notify)}}
function activityPaused(){return document.hidden||window.matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.classList.contains('studio-motion-paused')}

function HighlightCard({post,position,total,duplicate}:{post:ArticleMeta;position:number;total:number;duplicate:boolean}){
 const date=post.updated||post.date
 return <article className={styles.card} role="group" aria-roledescription="slide" aria-label={`${position+1} of ${total}`} data-highlight-index={position}>
 <Link className={styles.cardLink} tabIndex={duplicate?-1:undefined} href={`/blog/${post.slug}`} aria-label={`Read ${post.title}`}>
 <div className={styles.meta}><span>{post.level.match(/Episode [0-9]+/)?.[0]||post.tags[0]}</span><span>{post.updated?'Updated':'Published'} <time dateTime={date}>{new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(date))}</time></span></div>
 <h3>{post.title}</h3><p className={styles.teaser}>{post.description}</p>
 <div className={styles.cardFooter}><span>{post.readingMinutes} min read</span><strong>Read article <ArrowUpRight size={14}/></strong></div>
 </Link></article>
}

export function BlogHighlights({articles}:{articles:ArticleMeta[]}){
 const highlights=articles.filter(post=>!post.draft).slice().sort((a,b)=>(b.updated||b.date).localeCompare(a.updated||a.date)||b.date.localeCompare(a.date)||a.slug.localeCompare(b.slug)).slice(0,3)
 const [index,setIndex]=useState(0),[automatic,setAutomatic]=useState(true),[hovered,setHovered]=useState(false),[focused,setFocused]=useState(false)
 const track=useRef<HTMLDivElement>(null),group=useRef<HTMLDivElement>(null),motion=useRef<Animation|null>(null),running=useRef(false)
 const blocked=useSyncExternalStore(subscribeActivity,activityPaused,()=>true)
 const rotating=automatic&&!blocked&&!hovered&&!focused&&highlights.length>1
 useEffect(()=>{
  const element=track.current,content=group.current;if(!element||!content)return
  function resize(){
   const width=content!.getBoundingClientRect().width;if(!width)return
   const previous=motion.current,duration=Number(previous?.effect?.getTiming().duration)||1,progress=(Number(previous?.currentTime)||0)%duration/duration
   previous?.cancel();const animation=element!.animate([{transform:'translateX(0)'},{transform:`translateX(-${width}px)`}],{duration:width/24*1000,iterations:Infinity,easing:'linear'})
   animation.currentTime=progress*width/24*1000;motion.current=animation;if(!running.current)animation.pause()
  }
  resize();const observer=new ResizeObserver(resize);observer.observe(content)
  const interval=window.setInterval(()=>{const animation=motion.current;if(!animation)return;const duration=Number(animation.effect?.getTiming().duration)||1;setIndex(Math.min(highlights.length-1,Math.floor((Number(animation.currentTime)||0)%duration/duration*highlights.length)))},400)
  return()=>{observer.disconnect();window.clearInterval(interval);motion.current?.cancel();motion.current=null}
 },[highlights.length])
 useEffect(()=>{running.current=rotating;if(rotating)motion.current?.play();else motion.current?.pause()},[rotating,blocked,automatic,hovered,focused])
 if(!highlights.length)return null
 const jump=(next:number)=>{const target=(next+highlights.length)%highlights.length;setAutomatic(false);setIndex(target);const animation=motion.current;if(animation){animation.pause();animation.currentTime=target/highlights.length*Number(animation.effect?.getTiming().duration)}}
 return <section id="blog-highlights" className={styles.root} aria-labelledby="blog-highlights-title" aria-roledescription="carousel"
 onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
 onFocusCapture={event=>{setFocused(true);const target=event.target as HTMLElement;if(target.matches(':focus-visible')){const card=target.closest<HTMLElement>('[data-highlight-index]');if(card){const position=Number(card.dataset.highlightIndex),animation=motion.current;if(animation){animation.pause();animation.currentTime=position/highlights.length*Number(animation.effect?.getTiming().duration)}setIndex(position)}}}}
 onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget))setFocused(false)}}
 onKeyDown={event=>{if(event.altKey||event.ctrlKey||event.metaKey)return;if(event.key==='ArrowRight'){event.preventDefault();jump(index+1)}if(event.key==='ArrowLeft'){event.preventDefault();jump(index-1)}}}>
 <div className={styles.heading}><h2 id="blog-highlights-title">Latest blog updates</h2><div className={styles.headingActions}><Link href="/blog" className={styles.browse}>All blogs <ArrowUpRight size={14}/></Link><div className={styles.navigation}><button type="button" aria-label="Previous blog highlight" onClick={()=>jump(index-1)}><ArrowLeft size={15}/></button><button type="button" onClick={()=>setAutomatic(a=>!a)} aria-pressed={automatic&&!blocked} aria-label={automatic&&!blocked?'Pause highlights':'Play highlights'} disabled={blocked}>{automatic&&!blocked?<Pause size={13}/>:<Play size={13}/>}<span>{blocked?'Paused':automatic?'Pause':'Play'}</span></button><button type="button" aria-label="Next blog highlight" onClick={()=>jump(index+1)}><ArrowRight size={15}/></button></div></div></div>
 <div className={styles.viewport}><div className={styles.track} ref={track} data-moving={rotating}><div className={styles.group} ref={group}>{highlights.map((item,i)=><HighlightCard key={item.slug} post={item} position={i} total={highlights.length} duplicate={false}/>)}</div><div className={styles.group} aria-hidden="true">{highlights.map((item,i)=><HighlightCard key={item.slug} post={item} position={i} total={highlights.length} duplicate/>)}</div></div></div>
 <p className="sr-only" role="status" aria-live={rotating?'off':'polite'}>Highlight {index+1} of {highlights.length}: {highlights[index]?.title}</p>
 </section>
}

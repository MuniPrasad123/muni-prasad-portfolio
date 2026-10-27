'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { profile } from '@/data/profile'
import type { ArticleMeta } from '@/lib/blog'
const groups=[
  {label:'Explore',links:[{href:'/',label:'Overview',icon:'◎'},{href:'/cv',label:'Experience',icon:'▤'},{href:'/portfolio',label:'Selected work',icon:'▧'},{href:'/expertise',label:'Capabilities & tools',icon:'▱'}]},
  {label:'Connect & learn',links:[{href:'/hire-me',label:'Role fit',icon:'↗'},{href:'/highlights',label:'Credentials',icon:'✳'},{href:'/blog',label:'Blog',icon:'▥'},{href:'/contact',label:'Contact',icon:'✉'}]},
]
export function SiteShell({children, articles}:{children:ReactNode; articles:ArticleMeta[]}) {
  const pathname=usePathname()
  const [open,setOpen]=useState(false)
  const sidebar=useRef<HTMLElement>(null)
  const toggle=useRef<HTMLButtonElement>(null)
  useEffect(()=>{
    if(!open)return
    const previousOverflow=document.body.style.overflow
    document.body.style.overflow='hidden'
    sidebar.current?.querySelector<HTMLElement>('a')?.focus()
    const key=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){setOpen(false);toggle.current?.focus()}
      if(event.key==='Tab'){
        const nodes=[toggle.current,...Array.from(sidebar.current?.querySelectorAll<HTMLElement>('a,button')||[])].filter((node):node is HTMLElement=>!!node)
        const first=nodes[0],last=nodes[nodes.length-1]
        if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}
        else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()}
      }
    }
    const media=window.matchMedia('(min-width: 761px)')
    const resize=()=>{if(media.matches)setOpen(false)}
    document.addEventListener('keydown',key)
    media.addEventListener('change',resize)
    return()=>{document.body.style.overflow=previousOverflow;document.removeEventListener('keydown',key);media.removeEventListener('change',resize)}
  },[open])
  const close=()=>setOpen(false)
  const active=(href:string)=>pathname===href||(href!=='/'&&pathname.startsWith(href+'/'))||(href==='/expertise'&&pathname==='/offer')
  return <div className="site-shell">
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="mobile-header"><Link className="mobile-brand" href="/" onClick={close}>MP<span>.</span></Link><span className="mobile-status"><i/> Chennai, India</span><button ref={toggle} type="button" className="menu-toggle" aria-label={open?'Close navigation':'Open navigation'} aria-expanded={open} aria-controls="primary-navigation" onClick={()=>setOpen(!open)}>{open?'×':'☰'}</button></header>
    {open&&<button className="nav-scrim" aria-label="Close navigation" tabIndex={-1} onClick={()=>{close();toggle.current?.focus()}}/>}
    <aside ref={sidebar} className={`site-sidebar${open?' is-open':''}`} aria-label="Portfolio navigation"><div className="sidebar-scroll">
      <Link className="identity" href="/" aria-label="Muni Prasad, home" onClick={close}><span className="avatar-frame"><Image src="/media/muni-profile.png.jpg" alt="" width={94} height={94} priority/></span><strong>{profile.name}</strong><small>Senior Software Engineer</small><span className="identity-stack">Building reliable backends.<br/>Connecting enterprise commerce.</span></Link>

      <nav id="primary-navigation" aria-label="Main navigation">{groups.map(group=><div className="nav-group" key={group.label}><p>{group.label}</p>{group.links.map(item=><Link className={`nav-link${active(item.href)?' active':''}`} aria-current={active(item.href)?'page':undefined} href={item.href} key={item.href} onClick={close}><span aria-hidden="true" className="nav-icon">{item.icon}</span>{item.label}<span aria-hidden="true" className="nav-arrow">↗</span></Link>)}</div>)}</nav>
      <section className="sidebar-latest" aria-labelledby="sidebar-latest-title"><p id="sidebar-latest-title">Engineering journal</p>{articles.slice(0,2).map((article,index)=><Link href={`/blog/${article.slug}`} key={article.slug} onClick={close}><span>0{index+1}</span>{article.title}</Link>)}</section>
      <div className="sidebar-connect"><p>Find me online</p><div className="social-row"><a href={profile.github} target="_blank" rel="noreferrer">GitHub ↗</a><a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a></div></div>
      <footer className="sidebar-footer">© {new Date().getFullYear()} {profile.name}<br/>{profile.location} <span aria-hidden="true">◆</span> <Link href="/privacy" onClick={close}>Privacy</Link></footer>
    </div></aside>
    <div className="site-main"><main id="main" tabIndex={-1}>{children}</main></div>
  </div>
}


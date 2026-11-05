'use client'
import Link from 'next/link'
import Image from 'next/image'
import { Folder, ArrowLeft, ArrowUpRight } from 'lucide-react'
import { useState } from 'react'
import type { ArticleMeta } from '@/lib/blog'
export function BlogIndex({articles}:{articles:ArticleMeta[]}){
 const [folder,setFolder]=useState<string|null>(null),[tag,setTag]=useState('All'),[query,setQuery]=useState('')
 const folders=[...new Set(articles.map(p=>p.folder||'More engineering topics'))]
 const browsing=folder!==null||query.trim()!==''
 const within=articles.filter(p=>!folder||folder==='All episodes'||(p.folder||'More engineering topics')===folder)
 const tags=['All',...new Set(within.flatMap(p=>p.tags))]
 const visible=within.filter(p=>(tag==='All'||p.tags.includes(tag))&&p.title.toLowerCase().includes(query.trim().toLowerCase()))
 const reset=()=>{setFolder(null);setTag('All');setQuery('')}
 return <><div className="blog-library-heading"><div><div className="eyebrow">Architecture in Motion library</div><h2>{folder||'Browse topic folders'}</h2><p>{folder?'Episodes are listed in sequence.':'Choose a folder to explore its lessons, videos, and interactive labs.'}</p></div>{browsing?<button type="button" className="button button-outline" onClick={reset}><ArrowLeft size={16}/>All folders</button>:<button type="button" className="text-link" onClick={()=>setFolder('All episodes')}>View all episodes ↗</button>}</div>
 <label className="sr-only" htmlFor="notes-search">Search article titles</label><input id="notes-search" className="search-field" placeholder={folder?'Search this folder':'Search all episodes'} type="search" value={query} onChange={e=>{setQuery(e.target.value);setTag('All')}}/>
 {!browsing?<div className="blog-folder-grid">{folders.map(name=>{const posts=articles.filter(p=>(p.folder||'More engineering topics')===name);return <button className="blog-folder" type="button" key={name} onClick={()=>{setFolder(name);setTag('All')}}><span className="blog-folder-icon"><Folder size={38} strokeWidth={1.4}/><ArrowUpRight size={18}/></span><h3>{name}</h3><span>{posts.length} {posts.length===1?'episode':'episodes'}</span><p>{posts.map(p=>p.level.match(/Episode \d+/)?.[0]).filter(Boolean).join(' · ')}</p><strong>Open folder →</strong></button>})}</div>:<><div className="filter-bar blog-folder-tags" role="group" aria-label="Filter articles by tag">{tags.map(item=><button className="filter-chip" key={item} type="button" aria-pressed={tag===item} onClick={()=>setTag(item)}>{item}</button>)}</div><p role="status">{visible.length} {visible.length===1?'article':'articles'}</p><div className="blog-grid">{visible.map(post=><Link className="blog-card article-card" href={`/blog/${post.slug}`} key={post.slug}><Image src={post.cover} alt={post.coverAlt} width={1200} height={630}/><div className="article-card-copy"><span className="draft-label">{post.level.match(/Episode \d+/)?.[0]} · {post.draft?'Local draft · ':''}{post.readingMinutes} min read</span><h2>{post.title}</h2><p>{post.description}</p><div className="tag-list">{post.tags.map(item=><span key={item}>{item}</span>)}</div><time dateTime={post.date}>{post.date}</time><span className="project-link">Read article ↗</span></div></Link>)}</div>{!visible.length&&<div className="empty-state"><p>No matching articles. Try another search or tag.</p><button className="button button-outline" onClick={()=>{setQuery('');setTag('All')}}>Clear filters</button></div>}</>}
 </>
}

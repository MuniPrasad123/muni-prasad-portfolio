'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { draftArticles } from '@/data/site'

const categories=['All',...Array.from(new Set(draftArticles.map(post=>post.category)))]
export function BlogIndex(){const[category,setCategory]=useState('All');const[query,setQuery]=useState('');const visible=useMemo(()=>draftArticles.filter(post=>(category==='All'||post.category===category)&&`${post.title} ${post.summary}`.toLowerCase().includes(query.toLowerCase())),[category,query]);return <><div className="portfolio-controls"><div className="filter-bar">{categories.map(item=><button className="filter-chip" key={item} type="button" aria-pressed={category===item} onClick={()=>setCategory(item)}>{item}</button>)}</div><label className="sr-only" htmlFor="notes-search">Search engineering notes</label><input id="notes-search" className="search-field" placeholder="Search engineering notes" type="search" value={query} onChange={e=>setQuery(e.target.value)}/></div><p className="sr-only" aria-live="polite">{visible.length} notes shown</p><div className="blog-grid">{visible.map(post=><Link className="blog-card" href={`/blog/${post.slug}`} key={post.slug}><span className="draft-label">Unpublished draft · {post.category}</span><h2>{post.title}</h2><p>{post.summary}</p><span className="project-link">Open draft ↗</span></Link>)}</div>{!visible.length&&<div className="empty-state">No notes match your search.</div>}<p className="info-note">These are unpublished working drafts. They are not presented as previously published articles.</p></>}


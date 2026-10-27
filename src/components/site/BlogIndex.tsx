'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import type { ArticleMeta } from '@/lib/blog'
export function BlogIndex({ articles }: { articles: ArticleMeta[] }) {
  const [tag, setTag] = useState('All'), [query, setQuery] = useState('')
  const tags = ['All', ...new Set(articles.flatMap(post => post.tags))]
  const visible = articles.filter(post => (tag === 'All' || post.tags.includes(tag)) && post.title.toLowerCase().includes(query.trim().toLowerCase()))
  const reset = () => { setTag('All'); setQuery('') }
  return <><div className="portfolio-controls"><div className="filter-bar" role="group" aria-label="Filter articles by tag">{tags.map(item => <button className="filter-chip" key={item} type="button" aria-pressed={tag === item} onClick={() => setTag(item)}>{item}</button>)}</div><label className="sr-only" htmlFor="notes-search">Search article titles</label><input id="notes-search" className="search-field" placeholder="Search article titles" type="search" value={query} onChange={e => setQuery(e.target.value)}/></div>
    <div className="filter-feedback"><p role="status">{visible.length} {visible.length === 1 ? 'article' : 'articles'}</p>{(tag !== 'All' || query) && <button onClick={reset}>Clear filters</button>}</div>
    <div className="blog-grid">{visible.map(post => <Link className="blog-card article-card" href={`/blog/${post.slug}`} key={post.slug}><Image src={post.cover} alt={post.coverAlt} width={1200} height={630}/><div className="article-card-copy"><span className="draft-label">{post.draft ? 'Local draft · ' : ''}{post.sample ? 'Sample article · ' : ''}{post.readingMinutes} min read</span><h2>{post.title}</h2><p>{post.description}</p><div className="tag-list">{post.tags.map(item => <span key={item}>{item}</span>)}</div><time dateTime={post.date}>{post.date}</time><span className="project-link">Read article ↗</span></div></Link>)}</div>
    {!visible.length && <div className="empty-state"><p>{articles.length ? 'No matching titles. Try another tag or search.' : 'New articles are on the way.'}</p>{articles.length > 0 && <button className="button button-outline" onClick={reset}>Show all articles</button>}</div>}</>
}

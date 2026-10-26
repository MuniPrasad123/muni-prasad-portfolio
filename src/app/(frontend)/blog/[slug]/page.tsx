import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { draftArticles } from '@/data/site'

type Props={params:Promise<{slug:string}>}
export function generateStaticParams(){return draftArticles.map(post=>({slug:post.slug}))}
export async function generateMetadata({params}:Props):Promise<Metadata>{const{slug}=await params;const post=draftArticles.find(item=>item.slug===slug);return post?{title:`${post.title} | Engineering Notes`,description:post.summary}:{title:'Note not found'}}
export default async function ArticlePage({params}:Props){const{slug}=await params;const post=draftArticles.find(item=>item.slug===slug);if(!post)notFound();return <article className="page"><header className="page-hero"><Link className="text-link" href="/blog"><ArrowLeft size={13}/> All notes</Link><div className="eyebrow" style={{marginTop:24}}><span className="eyebrow-line"/>{post.category} · UNPUBLISHED DRAFT</div><h1>{post.title}</h1><p>{post.summary}</p><span className="project-link">{post.reading}</span></header><div className="article-body"><div className="article-toc"><strong>Draft note</strong><p>This is an unpublished working draft, not previously published work.</p></div>{post.paragraphs.map((paragraph,i)=><p key={i}>{paragraph}</p>)}</div></article>}

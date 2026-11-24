import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHero } from '@/components/site/PageHero'
import { BlogIndex } from '@/components/site/BlogIndex'
import { BlogHighlights } from '@/components/site/BlogHighlights'
import { articleSummaries, absoluteUrl } from '@/lib/blog'
export const metadata: Metadata = { title: 'Technical Blog | Muni Prasad', description: 'Practical Java, Spring Boot, commerce, cloud, and system design articles with interactive examples.', alternates: { canonical: '/blog', types: { 'application/rss+xml': '/rss.xml' } }, openGraph: { title: 'Muni Prasad — Technical Blog', url: absoluteUrl('/blog'), type: 'website' } }
export default function BlogPage() { return <div className="page"><PageHero label="Engineering journal" title={<>Understand the system.<br/><em>Explore the trade-offs.</em></>} description="Practical explanations of Java, Spring Boot, microservices, enterprise commerce, and cloud. Read the idea, try the model, and examine the implementation."/><p className="blog-intro-links"><Link href="/rss.xml">Subscribe via RSS ↗</Link><span>Written by Muni Prasad K</span></p><BlogHighlights articles={articleSummaries()}/><BlogIndex articles={articleSummaries()}/></div> }

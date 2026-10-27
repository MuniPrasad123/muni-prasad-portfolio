import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getArticle, getArticles, renderMarkdown, relatedArticles, absoluteUrl, formatDate } from '@/lib/blog'
import { ArticleContent } from '@/components/blog/ArticleContent'
import { LiveSimulator, StepTimeline, RateLimitContext } from '@/components/blog/Lesson'
import { LessonVideo, HeroExplainer } from '@/components/blog/LessonVideo'
type Props = { params: Promise<{ slug: string }> }
export function generateStaticParams() { return getArticles().map(post => ({ slug: post.slug })) }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getArticle((await params).slug)
  if (!post) notFound()
  const url = absoluteUrl(`/blog/${post.slug}`)
  return { title: `${post.title} | Muni Prasad`, description: post.description, alternates: { canonical: url }, robots: post.draft ? { index: false, follow: false } : undefined,
    openGraph: { type: 'article', title: post.title, description: post.description, url, publishedTime: post.date, modifiedTime: post.updated || post.date, tags: post.tags, authors: ['Muni Prasad K'], images: [{ url: absoluteUrl(`/blog/${post.slug}/opengraph-image`), width: 1200, height: 630, alt: post.coverAlt }] },
    twitter: { card: 'summary_large_image', title: post.title, description: post.description, images: [absoluteUrl(`/blog/${post.slug}/opengraph-image`)] } }
}
export default async function ArticlePage({ params }: Props) {
  const post = getArticle((await params).slug)
  if (!post) notFound()
  const { html, toc } = renderMarkdown(post.body), related = relatedArticles(post)
  const schema = { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: post.title, description: post.description, datePublished: `${post.date}T00:00:00Z`, dateModified: `${post.updated || post.date}T00:00:00Z`, image: absoluteUrl(`/blog/${post.slug}/opengraph-image`), mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`), author: { '@type': 'Person', name: 'Muni Prasad K', url: absoluteUrl('/') }, keywords: post.tags.join(', '), inLanguage: 'en' }
  return <article className="page technical-article"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }}/><header className={`page-hero ${post.simulation ? 'lesson-hero' : ''}`}><div><Link className="text-link" href="/blog">← All articles</Link><div className="eyebrow">{post.sample ? 'Sample technical article' : post.level}{post.draft ? ' · Local draft' : ''}</div><h1>{post.title}</h1><p>{post.description}</p><div className="article-byline">Muni Prasad K · <time dateTime={post.date}>{formatDate(post.date)}</time> · {post.readingMinutes} min read{post.updated && <span> · Updated {formatDate(post.updated)}</span>}</div><div className="tag-list">{post.tags.map(tag => <span key={tag}>{tag}</span>)}</div>{post.simulation && <div className="hero-actions"><a className="button button-gold" href="#interactive-lab">Try the simulation ↓</a><a className="button button-outline" href="#lesson-video">Watch video ↓</a><a className="text-link" href="#article-explanation">Read the explanation ↓</a></div>}</div>{post.simulation && <HeroExplainer/>}</header>
    {post.simulation === 'rate-limiting' && <RateLimitContext/>}{!post.simulation && <Image className="article-cover" src={post.cover} alt={post.coverAlt} width={1200} height={630} priority/>}{post.video && <LessonVideo src={post.video} poster={post.videoPoster || post.cover} caption={post.videoCaption} title={post.title}/>} {post.simulation === 'rate-limiting' && <><LiveSimulator/><StepTimeline/></>}
    <div id="article-explanation" className="article-layout"><aside className="article-contents"><nav aria-label="Table of contents"><strong>On this page</strong><ol>{toc.map(item => <li key={item.id} className={item.depth === 3 ? 'toc-subheading' : ''}><a href={`#${item.id}`}>{item.title}</a></li>)}{post.simulation && <li><a href="#interactive-lab">Interactive lab & quiz</a></li>}</ol></nav></aside><div className="article-main"><ArticleContent html={html}/><section className="lesson-panel"><h2>Keep exploring</h2><p>Questions about these trade-offs or a topic for the next article?</p><Link className="text-link" href="/contact">Start a conversation ↗</Link><a className="text-link" href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(absoluteUrl(`/blog/${post.slug}`))}`} target="_blank" rel="noreferrer">Share on LinkedIn ↗</a></section></div></div>
    <section className="content-section"><h2>Related articles</h2>{related.length ? <div className="blog-grid">{related.map(item => <Link className="blog-card" href={`/blog/${item.slug}`} key={item.slug}><span className="draft-label">{item.draft ? 'Draft · ' : ''}{item.tags[0]}</span><h3>{item.title}</h3><p>{item.description}</p></Link>)}</div> : <p>More articles are on the way. <Link className="text-link" href="/blog">Browse the journal ↗</Link></p>}</section></article>
}

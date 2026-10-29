import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { Marked } from 'marked'
import sanitizeHtml from 'sanitize-html'
import hljs from 'highlight.js/lib/common'

export type ArticleMeta = {
  title: string; description: string; slug: string; date: string; updated?: string
  tags: string[]; cover: string; coverAlt: string; draft: boolean; sample: boolean
  level: string; readingMinutes: number; simulation?: 'rate-limiting' | 'outbox' | 'payment-idempotency' | 'locking'; videoCaptions?: string; video?: string; videoPoster?: string; videoCaption?: string
}
export type Article = ArticleMeta & { body: string }
export const siteOrigin = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.muniprasad.in').replace(/\/$/, '')
const contentDir = path.join(process.cwd(), 'content', 'lessons')
export const absoluteUrl = (pathname: string) => new URL(pathname, `${siteOrigin}/`).toString()
export const formatDate = (date: string) => new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(date))

export function parseArticle(source: string, filename: string): Article {
  const { data, content } = matter(source)
  const fail = (field: string): never => { throw new Error(`${filename}: invalid or missing ${field}`) }
  const text = (key: string) => typeof data[key] === 'string' && data[key].trim() ? data[key].trim() : fail(key)
  const date = (key: string) => {
    const value = text(key)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value)) || new Date(value).toISOString().slice(0, 10) !== value) fail(key)
    return value
  }
  const slug = text('slug')
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || path.basename(filename, '.md') !== slug) fail('slug (must match filename)')
  if (typeof data.draft !== 'boolean') fail('draft (boolean)')
  if (!Array.isArray(data.tags) || !data.tags.length || data.tags.some((tag: unknown) => typeof tag !== 'string' || !tag.trim())) fail('tags')
  const cover = text('cover')
  if (!/^\/blog\/[a-zA-Z0-9/_.-]+\.(svg|png|jpg|jpeg|webp)$/.test(cover) || cover.includes('..')) fail('local cover path')
  if (data.video && (!/^\/blog\/[a-zA-Z0-9/_.-]+\.mp4$/.test(data.video) || data.video.includes('..'))) fail('video path')
  if (data.videoPoster && (!/^\/blog\/[a-zA-Z0-9/_.-]+\.(svg|png|jpg|jpeg|webp)$/.test(data.videoPoster) || data.videoPoster.includes('..'))) fail('video poster path')
  if (data.videoCaptions && (!/^\/blog\/[a-zA-Z0-9/_.-]+\.vtt$/.test(data.videoCaptions) || data.videoCaptions.includes('..'))) fail('captions path')
  if (data.simulation && !['rate-limiting', 'outbox', 'payment-idempotency', 'locking'].includes(data.simulation)) fail('simulation')
  const published = date('date'), updated = data.updated ? date('updated') : undefined
  if (updated && updated < published) fail('updated date before publication')
  return { title: text('title'), description: text('description'), slug, date: published, updated,
    tags: [...new Set<string>(data.tags.map((tag: string) => tag.trim()))], cover, coverAlt: text('coverAlt'),
    draft: data.draft, sample: data.sample === true, level: data.level || 'Practical guide',
    readingMinutes: Math.max(1, Math.ceil(content.split(/\s+/).length / 200)),
    simulation: data.simulation, videoCaptions: data.videoCaptions, video: data.video, videoPoster: data.videoPoster, videoCaption: data.videoCaption, body: content }
}

export function getArticles(includeDrafts = process.env.NODE_ENV === 'development'): Article[] {
  const articles = fs.readdirSync(contentDir).filter(file => file.endsWith('.md')).map(file => {
    const article = parseArticle(fs.readFileSync(path.join(contentDir, file), 'utf8'), file)
    for (const asset of [article.cover, article.video, article.videoPoster, article.videoCaptions].filter(Boolean) as string[]) {
      if (!fs.existsSync(path.join(process.cwd(), 'public', asset))) throw new Error(`${file}: missing asset ${asset}`)
    }
    return article
  })
  return articles.filter(post => includeDrafts || !post.draft).sort((a, b) => Number(a.draft) - Number(b.draft) || b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug))
}
export function articleSummaries(includeDrafts = process.env.NODE_ENV === 'development'): ArticleMeta[] {
  return getArticles(includeDrafts).map(article => { const { body, ...meta } = article; void body; return meta })
}
export function getArticle(slug: string) { return getArticles().find(post => post.slug === slug) }
export function relatedArticles(article: Article): ArticleMeta[] {
  return articleSummaries().filter(post => post.slug !== article.slug).map(post => ({ post, score: post.tags.filter(tag => article.tags.includes(tag)).length }))
    .sort((a, b) => b.score - a.score).slice(0, 3).map(item => item.post)
}
const escape = (text: string) => text.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]!))
export function renderMarkdown(body: string) {
  const toc: { id: string; title: string; depth: number }[] = []
  const used = new Map<string, number>()
  const markdown = new Marked({ gfm: true, renderer: {
    html({ text }) { return escape(text) },
    heading({ tokens, depth }) {
      const title = sanitizeHtml(this.parser.parseInline(tokens), { allowedTags: [], allowedAttributes: {} })
      const base = 'section-' + (title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'heading')
      const count = used.get(base) || 0; used.set(base, count + 1)
      const id = count ? `${base}-${count + 1}` : base
      if (depth === 2 || depth === 3) toc.push({ id, title, depth })
      const level = Math.max(2, depth)
      return `<h${level} id="${id}">${this.parser.parseInline(tokens)}</h${level}>`
    },
    code({ text, lang }) {
      const language = (lang || 'text').split(/\s/)[0]
      const html = hljs.getLanguage(language) ? hljs.highlight(text, { language }).value : escape(text)
      return `<div class="code-block"><div class="code-toolbar"><span>${escape(language)}</span><button type="button" data-copy-code="true" aria-label="Copy ${escape(language)} code">Copy code</button></div><pre tabindex="0"><code class="hljs">${html}</code></pre></div>`
    },
  } })
  const html = sanitizeHtml(markdown.parse(body, { async: false }), {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img', 'button'],
    allowedAttributes: { ...sanitizeHtml.defaults.allowedAttributes, '*': ['class'], h2: ['id'], h3: ['id'], h4: ['id'], h5: ['id'], h6: ['id'],
      pre: ['tabindex'], img: ['src', 'alt', 'width', 'height'], button: ['type', 'data-copy-code', 'aria-label'] },
    allowedSchemes: ['http', 'https', 'mailto'], allowProtocolRelative: false,
  })
  return { html, toc }
}
export const xmlEscape = (value: string) => escape(value)
export function rssFeed() {
  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>Muni Prasad — Engineering Blog</title><link>${xmlEscape(absoluteUrl('/blog'))}</link><description>Java, commerce, cloud and system design.</description><language>en</language><atom:link href="${xmlEscape(absoluteUrl('/rss.xml'))}" rel="self" type="application/rss+xml"/>${getArticles(false).map(post => `<item><title>${xmlEscape(post.title)}</title><link>${xmlEscape(absoluteUrl(`/blog/${post.slug}`))}</link><guid isPermaLink="true">${xmlEscape(absoluteUrl(`/blog/${post.slug}`))}</guid><description>${xmlEscape(post.description)}</description><pubDate>${new Date(post.date).toUTCString()}</pubDate>${post.tags.map(tag => `<category>${xmlEscape(tag)}</category>`).join('')}</item>`).join('')}</channel></rss>`
}

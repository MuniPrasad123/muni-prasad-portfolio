import type { MetadataRoute } from 'next'
import { getArticles } from '@/lib/blog'
import { portfolioProjects } from '@/data/site'

const origin = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.muniprasad.in'
export default function sitemap(): MetadataRoute.Sitemap {
  const fixed = ['', '/expertise', '/highlights', '/hire-me', '/cv', '/portfolio', '/contact', '/blog', '/privacy']
  const dated = new Date()
  return [
    ...fixed.map(route => ({ url: `${origin}${route}`, lastModified: dated, changeFrequency: 'monthly' as const, priority: route === '' ? 1 : 0.7 })),
    ...getArticles(false).map(post => ({ url: `${origin}/blog/${post.slug}`, lastModified: new Date(post.updated || post.date), changeFrequency: 'monthly' as const, priority: 0.7 })),
    ...portfolioProjects.map(project => ({ url: `${origin}/portfolio/${project.slug}`, lastModified: dated, changeFrequency: 'yearly' as const, priority: 0.55 })),
  ]
}

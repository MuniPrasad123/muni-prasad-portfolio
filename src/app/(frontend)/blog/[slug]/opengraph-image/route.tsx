import { ImageResponse } from 'next/og'
import { getArticle } from '@/lib/blog'
import { notFound } from 'next/navigation'
const size = { width: 1200, height: 630 }

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const post = getArticle((await params).slug)
  if (!post) notFound()
  return new ImageResponse(<div style={{ background: '#08251a', color: '#f5f1e7', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 76, width: '100%', height: '100%', border: '10px solid #d6b568' }}><div style={{ color: '#d6b568', fontSize: 24, marginBottom: 36 }}>MUNI PRASAD K · ENGINEERING JOURNAL</div><div style={{ fontSize: 66, lineHeight: 1.1 }}>{post.title}</div><div style={{ color: '#c5d7c9', fontSize: 26, marginTop: 36 }}>{post.tags.join(' · ')}</div></div>, size)
}

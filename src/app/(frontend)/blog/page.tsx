import type { Metadata } from 'next'
import { PageHero } from '@/components/site/PageHero'
import { BlogIndex } from '@/components/site/BlogIndex'

export const metadata: Metadata = { title: 'Engineering Notes | Muni Prasad', description: 'Unpublished drafts on Java services, payments, Kafka, PostgreSQL, and enterprise commerce.' }
export default function BlogPage(){return <div className="page"><PageHero label="Engineering notes" title={<>Working through<br/><em>the details.</em></>} description="Short notes on backend systems, commerce integrations, and reliable delivery."/><BlogIndex/></div>}

import type { Metadata } from 'next'
import { ArrowUpRight, FileText } from 'lucide-react'
import Image from 'next/image'
import { PageHero } from '@/components/site/PageHero'
import { credentials } from '@/data/site'
export const metadata: Metadata = { title: 'Credentials | Muni Prasad', description: 'Certifications, accreditations, courses, and training with links to the original credential pages.', alternates: { canonical: '/highlights' } }
const groups=[{title:'Certifications',types:['Certification']},{title:'Accreditations',types:['Accreditation']},{title:'Courses & training',types:['Course badge','Training badge']}]
export default function HighlightsPage(){return <div className="page">
  <PageHero label="Credentials" title={<>Continued learning.<br/><em>Clear credentials.</em></>} description="Cloud architecture, integration, containers, APIs, and AI foundations complement my Java and enterprise commerce work. Open a card to view its original credential page or certificate document."/>
  {groups.map(group=><section className="credentials-group" key={group.title}><h2>{group.title}</h2><div className="credentials-grid">{credentials.filter(item=>group.types.includes(item.category)).map(item=><a className="credential-card badge-card" key={item.title} href={item.url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${item.title} credential (new tab)`}>
    <div className="badge-stage">{item.image?<Image className="credential-badge-image" src={item.image} alt={`${item.title} badge`} width={178} height={128}/>:<div className="credential-document"><FileText size={48} strokeWidth={1}/><span>Certificate document</span></div>}</div>
    <span className="credential-kind">{item.issuer} · {item.category}</span><h3>{item.title}</h3><p>{item.description}</p>
    <div className="credential-listed"><span>{item.issuer==='Kibo'?'View certificate document':'View original credential'}</span><ArrowUpRight size={15}/></div>
  </a>)}</div></section>)}
</div>}


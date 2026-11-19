import Image from 'next/image'
import { Workflow } from 'lucide-react'
const labels: Record<string,string>={muniai:'LOCAL AI CHAT',dharmaai:'VOICE + DOCUMENT INTELLIGENCE',helpcorner:'DONATION COORDINATION','himaja-communication-erp':'WHOLESALE + OPERATIONS'}
export function ProjectThumbnail({slug,category}:{slug:string;category:string}) {
  if(labels[slug]) return <div className="project-image-thumbnail"><Image src={slug === 'himaja-communication-erp' ? '/project-thumbnails/himaja-fmcg.webp' : `/project-thumbnails/${slug}.webp`} alt="" fill sizes="(max-width: 760px) 100vw, 50vw"/><div className="project-image-shade"/><span className="project-image-label">{labels[slug]}</span></div>
  return <div className="project-thumbnail preview-engineering" aria-hidden="true"><div className="thumbnail-heading"><span>{category}</span><Workflow size={20}/></div><strong className="thumbnail-headline">Engineering the connections that matter.</strong><div className="thumbnail-window"><div className="thumbnail-toolbar"><span/><span/><span/><small>Concept preview</small></div><div className="thumbnail-engineering"><Workflow size={37}/><div><b>{category}</b><span>Services · Integrations · Workflows</span><i/><i/></div></div></div></div>
}

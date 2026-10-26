import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { portfolioProjects } from '@/data/site'
import { caseNotes } from '@/data/engineering'
import { ProjectDetails } from '@/components/site/ProjectDetails'

type Props={params:Promise<{slug:string}>}
export function generateStaticParams(){return portfolioProjects.map(project=>({slug:project.slug}))}
export async function generateMetadata({params}:Props):Promise<Metadata>{
  const{slug}=await params
  const project=portfolioProjects.find(p=>p.slug===slug)
  return project?{title:`${project.title} | Muni Prasad`,description:project.problemStatement,alternates:{canonical:`/portfolio/${slug}`}}:{title:'Case study not found | Muni Prasad'}
}
export default async function ProjectDetailPage({params}:Props){
  const{slug}=await params
  const project=portfolioProjects.find(p=>p.slug===slug)
  if(!project)notFound()
  const notes=caseNotes[slug]
  return <article className="page">
    <header className="page-hero"><Link className="text-link" href="/portfolio"><ArrowLeft size={14}/> Back to selected work</Link><div className="eyebrow" style={{marginTop:25}}><span className="eyebrow-line"/>{project.context}</div><h1>{project.title}</h1><p>{project.problemStatement}</p><div className="detail-meta">{project.stack.map(tag=><span className="tag" key={tag}>{tag}</span>)}</div></header>
    <div className="article-body case-study">
      <section className="detail-block"><h2>My contribution</h2><p>{project.role}</p></section>
      <section className="detail-block"><h2>Technical approach</h2><p>{project.approach}</p>{notes&&<ul className="case-decisions">{notes.decisions.map(item=><li key={item}>{item}</li>)}</ul>}</section>
      <ProjectDetails type={project.diagram} title={project.title}/>
      {notes?.validation&&<section className="detail-block"><h2>Testing & validation</h2><p>{notes.validation}</p></section>}
      {(project.outcome||notes?.lesson)&&<section className="detail-block"><h2>Outcome & lessons</h2>{project.outcome&&<p>{project.outcome}</p>}{notes?.lesson&&<p>{notes.lesson}</p>}</section>}
      <details className="source-note"><summary>Project context & evidence</summary><p>{notes?.evidence}</p>{project.context==='Professional contribution'?<p>Client source code is not published here.</p>:<p>A public repository or demo link has not been provided for this project.</p>}</details>
      <div className="case-footer"><Link className="text-link" href="/portfolio">← More selected work</Link><Link className="text-link" href="/contact">Discuss a similar challenge ↗</Link></div>
    </div>
  </article>
}


import Link from 'next/link'
import { articleSummaries } from '@/lib/blog'
import { ArrowUpRight, Download } from 'lucide-react'
import { careerHistory, pillars, portfolioProjects, siteFacts, personProfile } from '@/data/site'
import { KoiAnimation } from '@/components/site/KoiAnimation'

export const metadata = { title: 'Muni Prasad K | Senior Software Engineer | Java, Spring Boot, Microservices & Oracle ATG Commerce', description: personProfile.summary, alternates: { canonical: '/' } }

export default function HomePage() {
  const articles = articleSummaries()
  const featured = ['java-spring-boot-services', 'enterprise-checkout-payments', 'oracle-atg-modernization']
  return <div className="page home-page">
    <section className="hero hero-home">
      <KoiAnimation />
      <div className="hero-home-copy">
        <div className="eyebrow"><span className="eyebrow-line" />Senior Software Engineer</div>
        <h1 className="hero-name">{personProfile.name}</h1>
        <p className="hero-specialties"><em>Java · Spring Boot · Microservices · Oracle ATG Commerce · React.js · AWS</em></p>
        <p className="hero-lede">{personProfile.summary}</p>
        <div className="availability-pill"><span className="status-dot" />{personProfile.availability}</div>
        <div className="hero-actions"><Link className="button button-gold" href="/portfolio">Explore my work <ArrowUpRight size={16}/></Link><Link className="button button-outline" href="/contact">Let’s connect</Link></div>
        <div className="hero-resource-links"><a href={personProfile.resume} download><Download size={14}/> Download resume</a><a href={personProfile.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a><a href={personProfile.github} target="_blank" rel="noreferrer">GitHub ↗</a></div>
      </div>
      <div className="facts-grid">{siteFacts.map(fact=><div className="fact" key={fact.label}><strong>{fact.value}</strong><span className="fact-label">{fact.label}</span></div>)}</div>
    </section>
    <nav className="journey-links" aria-label="Choose your path"><Link href="#experience"><span>For recruiters</span>Experience → work → resume <ArrowUpRight size={16}/></Link><Link href="/expertise"><span>For engineering managers</span>Capabilities → case studies <ArrowUpRight size={16}/></Link></nav>
    <section id="about" className="content-section about-section">
      <div className="section-heading"><div><div className="eyebrow"><span className="eyebrow-line"/>About me</div><h2>Backend engineering with<br/><em>enterprise commerce depth.</em></h2></div></div>
      <div className="about-layout">
        <div className="about-copy"><p>{personProfile.about}</p><p>{personProfile.commerce}</p><p>{personProfile.approach}</p><p>{personProfile.aiWork}</p></div>
        <aside className="profile-glance" aria-labelledby="glance-heading"><h3 id="glance-heading">Profile at a glance</h3><dl><dt>Core strengths</dt><dd>Java · Spring Boot · Microservices · Oracle ATG Commerce<br/><span className="glance-supporting-stack">React.js · AWS · PostgreSQL</span></dd><dt>Experience</dt><dd>10+ years across software engineering and enterprise delivery</dd><dt>Based in</dt><dd>{personProfile.location}</dd><dt>Availability</dt><dd>{personProfile.relocation}</dd><dt>Target roles</dt><dd>Senior backend engineer · Spring Boot / microservices engineer · Backend technical lead · Commerce consultant</dd></dl><div className="hero-actions"><a className="text-link" href={personProfile.resume} download>Resume <Download size={14}/></a><Link className="text-link" href="/contact">Contact <ArrowUpRight size={14}/></Link></div></aside>
      </div>
    </section>
    <section className="content-section">
      <div className="section-heading"><div><div className="eyebrow"><span className="eyebrow-line"/>How I contribute</div><h2>From business requirements<br/><em>to working systems.</em></h2></div><Link className="text-link" href="/expertise">Capabilities & tools <ArrowUpRight size={15}/></Link></div>
      <div className="pillar-grid">{pillars.map(item=><article className="pillar-card" key={item.n}><span className="card-index">{item.n}</span><h3>{item.title}</h3><p>{item.text}</p></article>)}</div>
    </section>
    <section id="experience" className="content-section career-section"><div className="section-heading"><div><div className="eyebrow"><span className="eyebrow-line"/>Recent experience</div><h2>Hands-on engineering.<br/><em>Growing responsibility.</em></h2></div><Link className="text-link" href="/cv">Full career & resume <ArrowUpRight size={15}/></Link></div><div className="career-mini">{careerHistory.slice(0,3).map((role,i)=><article className="career-row" key={role.role+role.dateRange}><span className="career-dot">0{i+1}</span><div><h3>{role.role}</h3><p>{role.employer}{role.client&&<span> · {role.clientLabel}: {role.client}</span>}</p></div><time>{role.dateRange}</time></article>)}</div></section>
    <section className="content-section">
      <div className="section-heading"><div><div className="eyebrow"><span className="eyebrow-line"/>Selected work</div><h2>The engineering<br/><em>behind the experience.</em></h2></div><Link className="text-link" href="/portfolio">All projects <ArrowUpRight size={15}/></Link></div>
      <div className="project-preview-grid">{portfolioProjects.filter(project=>featured.includes(project.slug)).map((project,i)=><Link href={`/portfolio/${project.slug}`} className="project-preview" key={project.slug}><div className="project-preview-number" aria-hidden="true">0{i+1}<ArrowUpRight size={22}/></div><div className="project-meta"><span>{project.category}</span></div><h3>{project.title}</h3><p>{project.problemStatement}</p><span className="project-link">Read case study <ArrowUpRight size={14}/></span></Link>)}</div>
      <div className="project-followup"><p>Looking for event workflows, data work, or independent applications?</p><Link className="text-link" href="/portfolio/kafka-order-events">Kafka order events ↗</Link><Link className="text-link" href="/portfolio/helpcorner">HelpCorner & AWS ↗</Link><Link className="text-link" href="/portfolio/muniai">MuniAI ↗</Link></div>
    </section>
    <section className="content-section home-notes">
      <div className="section-heading"><div><div className="eyebrow"><span className="eyebrow-line"/>Engineering notebook</div><h2>Thinking through<br/><em>the details.</em></h2></div><Link className="text-link" href="/blog">Browse articles <ArrowUpRight size={15}/></Link></div>
      <p className="body-copy">Practical lessons on backend systems and enterprise commerce, with examples you can read and explore.</p>
      <div className="notes-list">{articles.slice(0,3).map(article=><Link href={`/blog/${article.slug}`} key={article.slug}><span className="draft-label">{article.draft ? 'Draft · ' : article.sample ? 'Sample · ' : ''}{article.tags[0]}</span><h3>{article.title}</h3><ArrowUpRight size={16}/></Link>)}</div>
    </section>
    <section className="closing-card"><div className="eyebrow"><span className="eyebrow-line"/>Build with purpose</div><h2>Have a backend challenge<br/><em>or a role in mind?</em></h2><p>I’m interested in Java and Spring Boot engineering, microservices, enterprise integrations, and commerce opportunities with teams working internationally.</p><Link className="button button-gold" href="/contact">Start a conversation <ArrowUpRight size={16}/></Link></section>
  </div>
}

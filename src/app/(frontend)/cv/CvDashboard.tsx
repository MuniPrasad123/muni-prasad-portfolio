import { PageHero } from '@/components/site/PageHero'
import { PrintProfile } from '@/components/site/PrintProfile'
import { careerHistory, personProfile } from '@/data/site'
export function CvDashboard(){return <div className="page cv-print">
  <PageHero label="Experience & resume" title={<>Muni Prasad K<br/><em>Senior Software Engineer.</em></>} description="Java · Spring Boot · Microservices · Oracle ATG Commerce · React.js · AWS"/>
  <div className="cv-contact"><span>{personProfile.location}</span><a href={`mailto:${personProfile.email}`}>{personProfile.email}</a><a href={personProfile.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a><a href={personProfile.github} target="_blank" rel="noreferrer">GitHub ↗</a></div>
  <p className="body-copy">{personProfile.introduction}</p>
  <div className="hero-actions"><a className="button button-gold" href={personProfile.resume} download>Download resume (PDF)</a><PrintProfile/></div>
  <section className="content-section"><h2>Professional <em>experience.</em></h2><div className="timeline">{careerHistory.map(role=><article className="timeline-item" key={role.employer}><div className="timeline-head"><h3>{role.role}</h3><time>{role.dateRange}</time></div><div className="timeline-company">{role.employer}{role.client&&<span> · {role.clientLabel}: {role.client}</span>}</div><p>{role.description}</p><div className="tag-list">{role.skillsUsed.map(skill=><span key={skill}>{skill}</span>)}</div></article>)}</div></section>
  <section className="content-section"><h2>Education.</h2><p className="body-copy">B.E. in Computer Science and Engineering · Prathyusha Engineering College, Chennai · 2016</p></section>
  <section className="content-section"><h2>International <em>opportunities.</em></h2><p className="body-copy">{personProfile.relocation}</p></section>
</div>}


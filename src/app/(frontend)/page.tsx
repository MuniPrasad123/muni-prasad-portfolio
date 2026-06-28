/* eslint-disable @typescript-eslint/no-explicit-any */
import { getPayload } from 'payload'
import config from '@payload-config'
import PortfolioClient from '@/components/PortfolioClient'

export const revalidate = 0 // Ensure we always fetch live data from Neon PostgreSQL

export default async function Page() {
  const payload = await getPayload({ config })

  // Query projects
  const projectsRes = await payload.find({
    collection: 'projects',
    limit: 100,
  })

  // Query experiences
  const experiencesRes = await payload.find({
    collection: 'experiences',
    limit: 100,
  })

  // Query certifications
  const certificationsRes = await payload.find({
    collection: 'certifications',
    limit: 100,
  })

  // Map to matching structure
  const initialProjects = projectsRes.docs.map((p: any) => ({
    id: p.id,
    title: p.title,
    problemStatement: p.problemStatement || undefined,
    role: p.role || undefined,
    outcome: p.outcome || undefined,
    techStack: p.techStack ? p.techStack.map((t: any) => t.tech) : [],
    githubLink: p.githubLink || undefined,
    caseStudyLink: p.caseStudyLink || undefined,
    image: p.image || undefined,
  }))

  const initialExperiences = experiencesRes.docs.map((e: any) => ({
    id: e.id,
    role: e.role,
    company: e.company,
    dateRange: e.dateRange || undefined,
    description: e.description || undefined,
    skillsUsed: e.skillsUsed ? e.skillsUsed.map((s: any) => s.skill) : [],
  }))

  const initialCertifications = certificationsRes.docs.map((c: any) => ({
    id: c.id,
    title: c.title,
    description: c.description || undefined,
    status: c.status || undefined,
    badge: c.badge || undefined,
  }))

  return (
    <PortfolioClient
      initialProjects={initialProjects}
      initialExperiences={initialExperiences}
      initialCertifications={initialCertifications}
    />
  )
}

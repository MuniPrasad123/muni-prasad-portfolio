import type { Metadata } from 'next'
import { CvDashboard } from './CvDashboard'

export const metadata: Metadata = { title: 'Experience & Resume | Muni Prasad', description: '10+ years of software engineering across Java, Spring Boot, microservices, and Oracle ATG Commerce. Read the career profile or download the resume.', alternates: { canonical: '/cv' } }
export default function CvPage(){return <CvDashboard/>}

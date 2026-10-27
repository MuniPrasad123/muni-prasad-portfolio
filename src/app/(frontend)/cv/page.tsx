import type { Metadata } from 'next'
import { CvDashboard } from './CvDashboard'

export const metadata: Metadata = { title: 'Experience | Muni Prasad', description: '10+ years of software engineering across Java, Spring Boot, microservices, and Oracle ATG Commerce. Explore the career history and engineering responsibilities.', alternates: { canonical: '/cv' } }
export default function CvPage(){return <CvDashboard/>}

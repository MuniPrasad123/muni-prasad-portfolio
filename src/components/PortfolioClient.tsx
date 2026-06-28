/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState } from 'react'
import { BackgroundGrid } from './ui/BackgroundGrid'
import { Navbar } from './layout/Navbar'
import { SideNav } from './layout/SideNav'
import { Hero } from './sections/Hero'
import { About } from './sections/About'
import { CoreExpertise } from './sections/CoreExpertise'
import { TechStackMarquee } from './sections/TechStackMarquee'
import { Projects } from './sections/Projects'
import { Experience } from './sections/Experience'
import { ServicesSection } from './sections/ServicesSection'
import { LinkedInSkills } from './sections/LinkedInSkills'
import { GitHubHighlights } from './sections/GitHubHighlights'
import { Certifications } from './sections/Certifications'
import { ContactSection } from './sections/ContactSection'

export interface ProjectItem {
  id?: string
  title: string
  problemStatement?: string
  role?: string
  outcome?: string
  techStack?: { tech: string }[] | string[]
  githubLink?: string
  caseStudyLink?: string
  image?: any
}

export interface ExperienceItem {
  id?: string
  role: string
  company: string
  dateRange?: string
  description?: string
  skillsUsed?: { skill: string }[] | string[]
}

export interface CertificationItem {
  id?: string
  title: string
  description?: string
  status?: 'completed' | 'pending'
  badge?: any
}

interface PortfolioClientProps {
  initialProjects: ProjectItem[]
  initialExperiences: ExperienceItem[]
  initialCertifications: CertificationItem[]
}

export default function PortfolioClient({
  initialProjects,
  initialExperiences,
  initialCertifications,
}: PortfolioClientProps) {
  const [projects] = useState<ProjectItem[]>(
    initialProjects.length > 0
      ? initialProjects
      : [
          {
            title: 'Enterprise Commerce Checkout Flow',
            problemStatement: 'Legacy payment gateway redirect loops causing checkout drop-offs and session mismatches during zero-amount coupon transactions.',
            role: 'Implemented custom payment status validation filters in Java and designed redirect logs tracking.',
            outcome: 'Reduced payment validation failures by 98%.',
            techStack: ['Oracle ATG', 'Java API', 'Payment Redirects'],
            githubLink: 'https://github.com/MuniPrasad123/enterprise-commerce-checkout-payment-flow',
          },
          {
            title: 'ATG Promotion Engine Toolkit',
            problemStatement: 'Conflicting order-level discount rules overriding item-level coupons, leading to wrong pricing during checkouts.',
            role: 'Built rule evaluation matrix and mapped priority parameters within the ATG pricing pipeline.',
            outcome: 'Prevented conflicting promotions application and created an open-source test matrix schema.',
            techStack: ['ATG Commerce', 'Pricing Rules', 'Unit Matrix'],
            githubLink: 'https://github.com/MuniPrasad123/atg-promotion-engine-analysis-toolkit',
          },
          {
            title: 'Salesforce CRM Integration RCA',
            problemStatement: 'Intermittent validation failures during profile creation syncs, triggered by malformed browser autocomplete values.',
            role: 'Conducted detailed API audit checks and traced mapping disparities in payload definitions.',
            outcome: 'Implemented server-side validation filters and structured an RCA template.',
            techStack: ['Salesforce API', 'REST Integration', 'RCA Template'],
            githubLink: 'https://github.com/MuniPrasad123/salesforce-crm-integration-rca-template',
          },
          {
            title: 'Server GTM / Pinterest CAPI Guide',
            problemStatement: 'Browser-side ad-blocking dropping 30%+ of analytics events, skewing commerce conversion tracking.',
            role: 'Developed server-side payload formatting mapping using hashed user data variables.',
            outcome: 'Restored reporting event parity and constructed a server-to-server validation playbook.',
            techStack: ['Server GTM', 'CAPI', 'Data Hashing'],
            githubLink: 'https://github.com/MuniPrasad123/server-side-gtm-capi-validation-guide',
          },
          {
            title: 'Spring Boot CI/CD AWS Demo',
            problemStatement: 'Deploying monolithic updates requires downtime, risking cart losses during deployment.',
            role: 'Configured Docker container scripts and defined blue-green deployment pipelines in Jenkins.',
            outcome: 'Achieved zero-downtime container replacement workflows.',
            techStack: ['Docker', 'AWS ECS', 'Jenkins CI/CD'],
            githubLink: 'https://github.com/MuniPrasad123/springboot-ci-cd-aws-deployment-demo',
          },
          {
            title: 'React Commerce Admin UI',
            problemStatement: 'Business teams lacking visual feedback to track promotion execution.',
            role: 'Created a modular React dashboard simulating a catalog manager and event validation checker.',
            outcome: 'Showcased front-to-back engineering capacity with an intuitive search-and-inspect admin UI.',
            techStack: ['React.js', 'JavaScript ES6', 'Admin Mock'],
            githubLink: 'https://github.com/MuniPrasad123/react-commerce-admin-ui',
          },
        ]
  )

  const [experiences] = useState<ExperienceItem[]>(
    initialExperiences.length > 0
      ? initialExperiences
      : [
          {
            role: 'Senior Technical Consultant',
            company: 'OLR Retail',
            dateRange: 'Mar 2023 – Present',
            description: 'Lead key development and integration modules for multi-store commerce deployments in Mexico. Collaborate on Oracle ATG Commerce backend customization, payment gateway redirects, production hotfixes, and API alignment with external systems. Manage Jenkins automation, Docker containers, AWS ECS tasks, Oracle SQL tuning, and production issue investigations using ELK Stack.',
            skillsUsed: ['Oracle ATG', 'Java SE', 'AWS ECS', 'Jenkins CI/CD', 'Docker', 'Salesforce', 'ELK Stack', 'Oracle SQL'],
          },
          {
            role: 'Senior Software Engineer & E-Commerce Developer',
            company: 'Enterprise Commerce Engagements',
            dateRange: '2013 – 2023',
            description: 'Contributed to enterprise development projects across Intersoft Solutions, Skoruz Technologies, Ilabz Technologies, Redgrape Business Services, and RT Medibus. Designed Spring Boot REST APIs, refactored legacy Java/J2EE structures, built CRM integration templates, and optimized backend query operations.',
            skillsUsed: ['Java/J2EE', 'Spring Boot', 'Microservices', 'PostgreSQL', 'Hibernate', 'RESTful APIs', 'QA Coordination'],
          },
        ]
  )

  const [certifications] = useState<CertificationItem[]>(
    initialCertifications.length > 0
      ? initialCertifications
      : [
          { title: 'AWS Certified Developer', description: 'Associate level. Cloud application deployment, orchestration, serverless structures.', status: 'completed' },
          { title: 'Oracle Java SE 17 Developer', description: 'Advanced standard edition backend development practices, JVM structuring.', status: 'completed' },
          { title: 'Spring Certified Professional', description: 'Spring Boot, microservices structuring, bean management patterns.', status: 'completed' },
          { title: 'GitHub Actions Certification', description: 'Automated pipeline definitions, environmental configurations, custom workflow actions.', status: 'pending' },
          { title: 'HackerRank Skills', description: 'Verified certificates: Java (Advanced), SQL (Advanced), React (Intermediate).', status: 'completed' },
          { title: 'freeCodeCamp Credentials', description: 'Completed Backend Development APIs and Frontend Libraries structures.', status: 'completed' },
        ]
  )

  return (
    <div className="portfolio-root bg-[#030712] min-h-screen text-slate-100 overflow-x-hidden selection:bg-[#1da1f2]/20 selection:text-white">
      <BackgroundGrid />
      <Navbar />
      <SideNav />
      <main className="main-content">
        {/* Section 1: Hero */}
        <Hero />
        
        {/* Section 2: About Me */}
        <About />
        
        {/* Section 3: Core Expertise */}
        <CoreExpertise />
        
        {/* Section 4: Tech Stack Marquee */}
        <TechStackMarquee />
        
        {/* Section 5: Projects */}
        <Projects projects={projects} />
        
        {/* Section 6: Experience */}
        <Experience experiences={experiences} />
        
        {/* Section 7: Services */}
        <ServicesSection />
        
        {/* Section 8: LinkedIn Skills */}
        <LinkedInSkills />
        
        {/* Section 9: GitHub Highlights */}
        <GitHubHighlights />
        
        {/* Section 10: Certifications */}
        <Certifications certifications={certifications} />
        
        {/* Section 11: Contact */}
        <ContactSection />
      </main>
      
      {/* Footer */}
      <footer className="footer py-8 border-t border-white/5 bg-[#030712]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-500">
          <p>© {new Date().getFullYear()} Muni Prasad K. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="https://www.linkedin.com/in/muni-prasad-k-7600bb105" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">LinkedIn</a>
            <a href="https://github.com/MuniPrasad123" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub</a>
            <a href="mailto:prasad.krish95@gmail.com" className="hover:text-white transition-colors">Email</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React from 'react'
import { MotionConfig } from 'framer-motion'
import { profile, projects as reviewedProjects, experiences as reviewedExperiences, certifications as reviewedCertifications } from '@/data/profile'
import { Education } from './sections/Education'
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
  category?: string
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
  const projects = initialProjects.length ? initialProjects : reviewedProjects
  const experiences = initialExperiences.length ? initialExperiences : reviewedExperiences
  const certifications = initialCertifications.length ? initialCertifications : reviewedCertifications

  return (
    <MotionConfig reducedMotion="user">
    <div className="portfolio-root bg-[#030712] min-h-screen text-slate-100 overflow-x-hidden selection:bg-[#1da1f2]/20 selection:text-white">
      <BackgroundGrid />
      <Navbar />
      <SideNav />
      <main className="main-content">
        {/* Section 1: Hero */}
        <Hero />
        <Projects projects={projects} />
        
        {/* Section 2: About Me */}
        <About />
        
        {/* Section 3: Core Expertise */}
        <CoreExpertise />
        
        {/* Section 4: Tech Stack Marquee */}
        <TechStackMarquee />
        

        
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
        <Education />
      </main>
      
      {/* Footer */}
      <footer className="footer py-8 border-t border-white/5 bg-[#030712]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-500">
          <p>© {new Date().getFullYear()} Muni Prasad K All rights reserved.</p>
          <div className="flex gap-6">
            <a href={profile.linkedin} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">LinkedIn</a>
            <a href="https://github.com/MuniPrasad123" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub</a>
            <a href="mailto:prasad.krish95@gmail.com" className="hover:text-white transition-colors">Email</a>
          </div>
        </div>
      </footer>
    </div>
    </MotionConfig>
  )
}

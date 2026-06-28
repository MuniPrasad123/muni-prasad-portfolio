/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { ProjectItem } from '../PortfolioClient'

const getImageUrl = (imageField: any) => {
  if (imageField && typeof imageField === 'object' && imageField.url) return imageField.url
  if (typeof imageField === 'string' && imageField) return imageField
  return null
}

const GithubIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="mr-1 inline-block">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
)

const ExternalLinkIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 inline-block">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" x2="21" y1="14" y2="3" />
  </svg>
)

interface CardProps {
  proj: ProjectItem
  idx: number
}

function ProjectCard({ proj, idx }: CardProps) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })
  const imgUrl = getImageUrl(proj.image)

  const tags = Array.isArray(proj.techStack) ? proj.techStack : []

  // Check if image is an SVG or has specific name in assets
  let localAssetPath = imgUrl
  if (!localAssetPath) {
    // Attempt to map from public assets using standard names
    const titleLower = proj.title.toLowerCase()
    if (titleLower.includes('checkout') || titleLower.includes('payment')) {
      localAssetPath = '/assets/project-checkout.svg'
    } else if (titleLower.includes('promotion') || titleLower.includes('pricing')) {
      localAssetPath = '/assets/project-promotions.svg'
    } else if (titleLower.includes('salesforce') || titleLower.includes('crm')) {
      localAssetPath = '/assets/project-salesforce.svg'
    } else if (titleLower.includes('gtm') || titleLower.includes('capi')) {
      localAssetPath = '/assets/project-gtm.svg'
    } else if (titleLower.includes('boot') || titleLower.includes('ci/cd') || titleLower.includes('jenkins')) {
      localAssetPath = '/assets/project-cicd.svg'
    } else if (titleLower.includes('react') || titleLower.includes('admin')) {
      localAssetPath = '/assets/project-admin.svg'
    } else {
      localAssetPath = `https://ui-avatars.com/api/?name=${encodeURIComponent(proj.title)}&background=1e293b&color=1da1f2&size=512&bold=true`
    }
  }

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ type: 'spring', stiffness: 100, damping: 15, delay: idx * 0.1 }}
      whileHover={{ y: -6, scale: 1.01 }}
      className="flex flex-col bg-[#0a0f1d] border border-white/[0.05] hover:border-[#1da1f2]/30 rounded-3xl overflow-hidden shadow-xl backdrop-blur-xl group transition-all duration-300"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-white/[0.02] border-b border-white/[0.05] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[#1da1f2]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        <img
          src={localAssetPath}
          alt={proj.title}
          className="w-full h-full max-h-[160px] object-contain transition-transform duration-700 group-hover:scale-105"
          onError={(e) => {
            const t = e.target as HTMLImageElement
            t.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(proj.title)}&background=1e293b&color=1da1f2&size=512&bold=true`
          }}
        />
        {/* Category tag */}
        <div className="absolute top-4 left-4 bg-[#030712]/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-slate-300 border border-white/5">
          E-Commerce Blueprint
        </div>
      </div>

      {/* Body content */}
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-xl font-bold text-white mb-4 group-hover:text-[#1da1f2] transition-colors line-clamp-1">{proj.title}</h3>
        
        {/* Problem - Role - Outcome Format */}
        <div className="flex flex-col gap-3.5 mb-6 text-sm text-slate-300 flex-1">
          {proj.problemStatement && (
            <div>
              <strong className="block text-[11px] uppercase tracking-wider text-[#14b8a6] mb-0.5">Problem</strong>
              <p className="line-clamp-2 text-slate-300/90 leading-relaxed font-normal">{proj.problemStatement}</p>
            </div>
          )}
          {proj.role && (
            <div>
              <strong className="block text-[11px] uppercase tracking-wider text-[#8b5cf6] mb-0.5">My Role</strong>
              <p className="line-clamp-2 text-slate-300/90 leading-relaxed font-normal">{proj.role}</p>
            </div>
          )}
          {proj.outcome && (
            <div>
              <strong className="block text-[11px] uppercase tracking-wider text-[#22c55e] mb-0.5">Outcome</strong>
              <p className="line-clamp-2 text-slate-300/90 leading-relaxed font-normal">{proj.outcome}</p>
            </div>
          )}
        </div>

        {/* Tech Stack Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-6">
            {tags.map((tech, ti) => {
              const techVal = typeof tech === 'object' && tech !== null ? (tech as any).tech : String(tech)
              return (
                <span key={ti} className="text-[10px] font-bold uppercase tracking-wider bg-white/[0.04] border border-white/5 text-slate-400 px-2.5 py-1 rounded-md">
                  {techVal}
                </span>
              )
            })}
          </div>
        )}

        {/* Call to actions */}
        <div className="flex gap-3 mt-auto">
          {proj.githubLink && (
            <a 
              href={proj.githubLink} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex-1 text-center py-2.5 px-4 bg-white/[0.03] border border-white/10 hover:border-white/20 hover:bg-white/5 rounded-xl text-xs font-bold text-white uppercase tracking-wider transition-all"
            >
              <GithubIcon />
              Blueprint
            </a>
          )}
          {proj.caseStudyLink && (
            <a 
              href={proj.caseStudyLink} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex-1 text-center py-2.5 px-4 bg-white text-[#030712] border border-white hover:bg-transparent hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
            >
              <ExternalLinkIcon />
              Case Study
            </a>
          )}
        </div>
      </div>
    </motion.article>
  )
}

export function Projects({ projects }: { projects: ProjectItem[] }) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  return (
    <section id="projects" className="section relative py-24">
      <div className="container max-w-7xl mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-left mb-16"
        >
          <span className="section__eyebrow">Case Studies &amp; Blueprints</span>
          <h2 className="section__title">
            Featured <strong>Projects</strong>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((proj, idx) => (
            <ProjectCard key={proj.id || idx} proj={proj} idx={idx} />
          ))}
        </div>
      </div>
    </section>
  )
}

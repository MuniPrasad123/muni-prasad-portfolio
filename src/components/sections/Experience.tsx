/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { ExperienceItem } from '../PortfolioClient'

const BriefcaseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="w-5 h-5">
    <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
)

interface TimelineCardProps {
  exp: ExperienceItem
  idx: number
}

function TimelineCard({ exp, idx }: TimelineCardProps) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })
  const isCurrent = exp.dateRange?.toLowerCase().includes('present')

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -30 }}
      animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
      transition={{ type: 'spring', stiffness: 100, damping: 15, delay: idx * 0.1 }}
      className="relative pl-12 md:pl-16 last:mb-0 mb-12 group"
    >
      {/* Icon Circle indicator */}
      <div className={`absolute left-0 top-0 w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 z-10 ${
        isCurrent 
          ? 'bg-[#030712] border-[#22c55e] text-[#22c55e] shadow-lg shadow-green-500/10' 
          : 'bg-[#030712] border-white/10 text-[#1da1f2] group-hover:border-[#1da1f2]/40'
      }`}>
        {isCurrent ? (
          <span className="relative flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-green-500"></span>
          </span>
        ) : (
          <BriefcaseIcon />
        )}
      </div>

      {/* Experience Details Card */}
      <div className="glass-panel border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] p-6 rounded-2xl transition-all duration-300">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2.5">
              {exp.role}
              {isCurrent && (
                <span className="bg-green-500/10 border border-green-500/30 text-green-400 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                  Current
                </span>
              )}
            </h3>
            <p className="text-sm font-semibold text-[#1da1f2] mt-0.5">{exp.company}</p>
          </div>
          {exp.dateRange && (
            <span className="inline-block self-start md:self-center px-3 py-1 bg-white/[0.03] border border-white/5 rounded-full text-xs font-semibold text-slate-400 tracking-wide">
              {exp.dateRange}
            </span>
          )}
        </div>

        {exp.description && (
          <p className="text-sm text-slate-300 leading-relaxed font-normal mb-6">
            {exp.description}
          </p>
        )}

        {/* Highlighted bullets if OLR role (custom items mapping for richness) */}
        {exp.company.toLowerCase().includes('olr') && (
          <ul className="list-disc pl-4 space-y-2 mb-6 text-xs text-slate-400 font-normal">
            <li>Lead ATG core configurations, payment validation classes, and promotions integrations.</li>
            <li>Maintain zero-downtime deployment runs on AWS ECS with custom Jenkins task scripts.</li>
            <li>Analyze high-priority system events and bottlenecks using ELK Stack Kibana dashboard filters.</li>
          </ul>
        )}

        {exp.skillsUsed && (
          <div className="flex flex-wrap gap-1.5">
            {(Array.isArray(exp.skillsUsed) ? exp.skillsUsed : []).map((skill, si) => {
              const skillVal = typeof skill === 'object' && skill !== null ? (skill as any).skill : String(skill)
              return (
                <span key={si} className="text-[9px] font-bold uppercase tracking-wider bg-[#1da1f2]/5 border border-[#1da1f2]/10 hover:border-[#1da1f2]/30 text-[#1da1f2] px-2.5 py-1 rounded-md transition-all">
                  {skillVal}
                </span>
              )
            })}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export function Experience({ experiences }: { experiences: ExperienceItem[] }) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  return (
    <section id="experience" className="section section--dark py-24 relative overflow-hidden">
      <div className="container max-w-4xl mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-left mb-16"
        >
          <span className="section__eyebrow">Professional History</span>
          <h2 className="section__title">
            Work <strong>Experience</strong>
          </h2>
        </motion.div>

        {/* Timeline wrapper */}
        <div className="relative">
          {/* Timeline center line */}
          <motion.div 
            initial={{ scaleY: 0 }}
            animate={inView ? { scaleY: 1 } : { scaleY: 0 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="timeline-line"
          />

          <div className="flex flex-col">
            {experiences.map((exp, idx) => (
              <TimelineCard key={exp.id || idx} exp={exp} idx={idx} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { CertificationItem } from '../PortfolioClient'

const AwardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="w-7 h-7">
    <circle cx="12" cy="8" r="6" />
    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
  </svg>
)

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="w-3.5 h-3.5 mr-1 text-[#22c55e]">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <path d="M22 4L12 14.01l-3-3" />
  </svg>
)

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="w-3.5 h-3.5 mr-1 text-yellow-500">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

interface CardProps {
  cert: CertificationItem
  idx: number
}

function CertCard({ cert, idx }: CardProps) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })
  const isCompleted = cert.status === 'completed' || !cert.status || cert.status.toLowerCase() !== 'pending'

  // Map certificate title to local SVG asset for maximum recruiter trust and premium visuals
  let localBadgePath = ''
  const titleLower = cert.title.toLowerCase()
  if (titleLower.includes('aws') || titleLower.includes('amazon')) {
    localBadgePath = '/assets/cert-aws.svg'
  } else if (titleLower.includes('java') || titleLower.includes('oracle')) {
    localBadgePath = '/assets/cert-java.svg'
  } else if (titleLower.includes('spring')) {
    localBadgePath = '/assets/cert-spring.svg'
  } else if (titleLower.includes('github')) {
    localBadgePath = '/assets/cert-github.svg'
  } else if (titleLower.includes('hackerrank')) {
    localBadgePath = '/assets/cert-hackerrank.svg'
  } else if (titleLower.includes('freecodecamp')) {
    localBadgePath = '/assets/cert-freecodecamp.svg'
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 25 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 25 }}
      transition={{ type: 'spring', stiffness: 100, damping: 15, delay: idx * 0.08 }}
      className="glass-panel border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] hover:border-[#1da1f2]/30 p-6 rounded-2xl flex flex-col items-center text-center transition-all duration-300 group"
    >
      {/* Icon or SVG badge */}
      <div className="w-16 h-16 rounded-full bg-white/[0.02] border border-white/10 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300">
        {localBadgePath ? (
          <img
            src={localBadgePath}
            alt={cert.title}
            className="w-10 h-10 object-contain"
            onError={(e) => {
              const t = e.target as HTMLImageElement
              t.style.display = 'none' // Hide image if fails, falls back to placeholder below
            }}
          />
        ) : (
          <div className="text-[#1da1f2]">
            <AwardIcon />
          </div>
        )}
      </div>

      <h3 className="text-base font-bold text-white mb-2 group-hover:text-[#1da1f2] transition-colors">{cert.title}</h3>
      
      {cert.description && (
        <p className="text-xs text-slate-400 font-normal leading-relaxed mb-6 flex-1">
          {cert.description}
        </p>
      )}

      {/* Completion status */}
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
        isCompleted 
          ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
          : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
      }`}>
        {isCompleted ? <CheckIcon /> : <ClockIcon />}
        {isCompleted ? 'Verified' : 'In Progress'}
      </div>
    </motion.div>
  )
}

export function Certifications({ certifications }: { certifications: CertificationItem[] }) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  return (
    <section id="certifications" className="section py-24">
      <div className="container max-w-7xl mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-left mb-16"
        >
          <span className="section__eyebrow">Credentials &amp; Endorsements</span>
          <h2 className="section__title">
            Professional <strong>Certifications</strong>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certifications.map((cert, idx) => (
            <CertCard key={cert.id || idx} cert={cert} idx={idx} />
          ))}
        </div>
      </div>
    </section>
  )
}

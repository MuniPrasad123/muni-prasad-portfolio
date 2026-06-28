'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

const CheckBadgeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-[#1da1f2] mr-1.5 inline-block">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

const skillCategories = [
  {
    title: 'Backend & Commerce Platforms',
    skills: ['Java', 'J2EE', 'Spring Boot', 'Microservices', 'Oracle ATG Commerce', 'KIBO Commerce', 'E-Commerce Architecture'],
  },
  {
    title: 'Frontend & UI Design',
    skills: ['React.js', 'Figma', 'Web Accessibility (a11y)'],
  },
  {
    title: 'Cloud, Infrastructure & DevOps',
    skills: ['AWS', 'Docker', 'Kubernetes', 'Jenkins', 'Git', 'Linux'],
  },
  {
    title: 'Databases & Middleware APIs',
    skills: ['Oracle SQL', 'PostgreSQL', 'APIGEE Gateway', 'REST APIs'],
  },
  {
    title: 'Support, Integrations & Tracking',
    skills: ['Salesforce Integration', 'Payment Gateway Integration', 'GTM / Server-side Tracking', 'ELK Stack', 'Root Cause Analysis', 'Production Support', 'Jira'],
  },
]

export function LinkedInSkills() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  return (
    <section id="skills" className="section section--dark py-24">
      <div className="container max-w-7xl mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-left mb-16"
        >
          <span className="section__eyebrow">Skills Matrix</span>
          <h2 className="section__title">
            LinkedIn <strong>Skills &amp; Endorsements</strong>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {skillCategories.map((category, catIdx) => (
            <motion.div
              key={catIdx}
              initial={{ opacity: 0, y: 25 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 25 }}
              transition={{ type: 'spring', stiffness: 80, damping: 15, delay: catIdx * 0.1 }}
              className="glass-panel border border-white/5 bg-white/[0.01] p-6 rounded-2xl flex flex-col justify-start"
            >
              <h3 className="text-base font-bold text-white mb-4 border-b border-white/5 pb-2.5">
                {category.title}
              </h3>
              
              <div className="flex flex-wrap gap-2.5">
                {category.skills.map((skill, skIdx) => (
                  <div
                    key={skIdx}
                    className="flex items-center bg-white/[0.03] border border-white/5 hover:border-[#1da1f2]/20 hover:bg-white/[0.05] py-2 px-3.5 rounded-full text-xs font-semibold text-slate-300 transition-all duration-200 cursor-default"
                  >
                    <CheckBadgeIcon />
                    <span>{skill}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

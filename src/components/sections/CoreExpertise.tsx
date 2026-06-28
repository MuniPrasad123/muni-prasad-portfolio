'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

interface ExpertiseCardProps {
  title: string
  description: string
  icon: React.ReactNode
  delay: number
}

function ExpertiseCard({ title, description, icon, delay }: ExpertiseCardProps) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ type: 'spring', stiffness: 100, damping: 15, delay }}
      className="glass-panel border border-white/5 p-6 rounded-2xl flex flex-col items-start bg-white/[0.01] hover:bg-white/[0.03] hover:border-[#1da1f2]/30 hover:shadow-lg hover:shadow-[#1da1f2]/5 transition-all duration-300 group"
    >
      <div className="mb-5 p-3 rounded-xl bg-white/[0.03] group-hover:bg-[#1da1f2]/10 group-hover:text-[#1da1f2] text-slate-400 transition-all duration-300">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#1da1f2] transition-colors">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
    </motion.div>
  )
}

export function CoreExpertise() {
  const [headerRef, headerInView] = useInView({ triggerOnce: true, threshold: 0.1 })

  const expertiseItems = [
    {
      title: 'Enterprise E-Commerce',
      description: 'Architecting high-availability digital storefronts, cart, checkout pipelines, promotions engines, and inventory management schemas.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="6" cy="19" r="3" />
          <circle cx="17" cy="19" r="3" />
          <path d="M17 17H6V3H4" />
          <path d="m6 5 14 .7-1.5 7H6" />
        </svg>
      ),
    },
    {
      title: 'Oracle ATG Commerce',
      description: 'Configuring pricing engines, custom promotion calculator classes, repository definitions, targeter rules, and inventory pipelines.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" x2="12" y1="22.08" y2="12" />
        </svg>
      ),
    },
    {
      title: 'Java / J2EE',
      description: 'Engineering robust server-side business logic, object structures, multithreading logic, memory optimization, and JVM tuning.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 2v20" />
          <path d="m14 18-4 4-4-4" />
          <path d="m6 6 4-4 4 4" />
        </svg>
      ),
    },
    {
      title: 'Spring Boot Microservices',
      description: 'Building REST APIs, securing endpoints (OAuth2), decoupling components via queues, and managing Hibernate ORM database sessions.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="18" x="3" y="3" rx="2" />
          <path d="M21 16H3M21 12H3M21 8H3" />
        </svg>
      ),
    },
    {
      title: 'React.js Frontend',
      description: 'Creating modular dashboards, custom admin UIs, catalog managers, event visualization grids, and responsive layouts.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="12" cy="12" rx="10" ry="4.5" transform="rotate(30 12 12)" />
          <ellipse cx="12" cy="12" rx="10" ry="4.5" transform="rotate(90 12 12)" />
          <ellipse cx="12" cy="12" rx="10" ry="4.5" transform="rotate(150 12 12)" />
          <circle cx="12" cy="12" r="1.5" />
        </svg>
      ),
    },
    {
      title: 'AWS Cloud & DevOps',
      description: 'Deploying ECS container tasks, automating Jenkins jobs, configuring Docker setups, and optimizing Oracle SQL query paths.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.5 19A3.5 3.5 0 0 0 21 15.5c0-2.79-2.54-4.5-5-4.5-.42-1.04-1.28-1.97-2.31-2.5C12.44 7.82 11.23 7.5 10 7.5c-3 0-5.5 2.1-6 5-.07.4-.1.8-.1 1.25A3.25 3.25 0 0 0 7.15 17" />
          <path d="M12 12v9" />
          <path d="m15 18-3 3-3-3" />
        </svg>
      ),
    },
    {
      title: 'Salesforce Integrations',
      description: 'Syncing profile properties, catalog updates, promotions payloads, and order records across third-party SOAP/REST endpoint links.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
        </svg>
      ),
    },
    {
      title: 'Production Support & RCA',
      description: 'Troubleshooting memory leaks, thread locks, payment gateway timeouts, database locks, and logging via ELK Stack.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      ),
    },
  ]

  return (
    <section id="expertise" className="section py-24">
      <div className="container max-w-7xl mx-auto px-6">
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 20 }}
          animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-left mb-16"
        >
          <span className="section__eyebrow">Services &amp; Architecture</span>
          <h2 className="section__title">
            Core <strong>Expertise</strong>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {expertiseItems.map((item, idx) => (
            <ExpertiseCard
              key={idx}
              title={item.title}
              description={item.description}
              icon={item.icon}
              delay={idx * 0.08}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

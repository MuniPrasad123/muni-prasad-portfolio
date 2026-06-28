'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

interface ServiceCardProps {
  title: string
  description: string
  icon: React.ReactNode
  idx: number
}

function ServiceCard({ title, description, icon, idx }: ServiceCardProps) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ type: 'spring', stiffness: 100, damping: 15, delay: idx * 0.08 }}
      className="glass-panel border border-white/5 p-6 rounded-2xl flex flex-col bg-white/[0.01] hover:bg-white/[0.02] hover:border-[#1da1f2]/30 transition-all duration-300 group"
    >
      <div className="mb-4 text-[#1da1f2] group-hover:text-white transition-all duration-300">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#1da1f2] transition-colors">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed font-normal">{description}</p>
    </motion.div>
  )
}

export function ServicesSection() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  const services = [
    {
      title: 'Enterprise E-Commerce Development',
      description: 'Building multi-store e-commerce platforms with global pipelines, custom catalog databases, checkouts, and promotional rules.',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      ),
    },
    {
      title: 'Oracle ATG Customization',
      description: 'Extending core commerce functionalities, pricing engines, targeters repository, promotions, order pipelines, and inventory syncs.',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      ),
    },
    {
      title: 'Spring Boot Microservices',
      description: 'Designing modular, microservice-based APIs, secure API filters, decoupled workers, data persistence, and caching mechanisms.',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
          <path d="M12 6v6l4 2" />
        </svg>
      ),
    },
    {
      title: 'Salesforce CRM Integration',
      description: 'Mapping consumer accounts, syncing items database, pipeline updates, and custom properties across Salesforce SOAP/REST APIs.',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      title: 'Payment Gateway Integration',
      description: 'Configuring secure checkout validation loops, redirect layers, webhooks, multi-currency processing, and zero-amount coupon flows.',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="14" x="2" y="5" rx="2" />
          <line x1="2" x2="22" y1="10" y2="10" />
        </svg>
      ),
    },
    {
      title: 'Production Support & RCA',
      description: 'Managing complex support tickets, resolving critical memory leaks, pipeline blockages, database deadlocks, and ELK auditing.',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
    },
    {
      title: 'Cloud / DevOps Deployment',
      description: 'Structuring containerized Docker nodes, writing ECS automation, managing Jenkins blue-green pipelines, and DB tuning.',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    {
      title: 'GTM / Server-Side Tracking',
      description: 'Implementing server-to-server analytics events, Pinterest CAPI, hashing user parameters, and restoring tracking accuracy.',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
          <path d="M22 12A10 10 0 0 0 12 2v10z" />
        </svg>
      ),
    },
  ]

  return (
    <section id="services" className="section py-24">
      <div className="container max-w-7xl mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-left mb-16"
        >
          <span className="section__eyebrow">Professional Services</span>
          <h2 className="section__title">
            What I Can <strong>Help With</strong>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, idx) => (
            <ServiceCard
              key={idx}
              title={service.title}
              description={service.description}
              icon={service.icon}
              idx={idx}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

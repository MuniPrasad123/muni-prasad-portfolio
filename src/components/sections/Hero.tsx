'use client'

import React from 'react'
import { motion } from 'framer-motion'

const ArrowUpRight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="ml-1 inline">
    <path d="M7 17L17 7M17 7H7M17 7v10" />
  </svg>
)

const BriefcaseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#1da1f2]">
    <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
)

const AwardIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#8b5cf6]">
    <circle cx="12" cy="8" r="6" />
    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
  </svg>
)

const SparklesIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#14b8a6]">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
  </svg>
)

export function Hero() {
  // Stagger container animation properties
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  } as const

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100, damping: 15 }
    }
  } as const

  return (
    <section className="hero relative overflow-hidden flex items-center min-h-[90vh] py-24" id="home">
      <div className="container max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center px-6">
        
        {/* Left Column - Copy & CTAs */}
        <motion.div 
          className="lg:col-span-7 flex flex-col items-start text-left z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Badge Indicators Group */}
          <motion.div className="flex flex-wrap gap-2.5 mb-6" variants={itemVariants}>
            <div className="hero__badge flex items-center gap-2 bg-[#0a0f1d] border border-white/10 px-3.5 py-1.5 rounded-full backdrop-blur-md">
              <span className="hero__badge-dot relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              <span className="hero__badge-text text-[10px] tracking-wider uppercase font-bold text-white/80">
                Open for Senior Software Engineer Roles
              </span>
            </div>
            
            <div className="flex items-center gap-1.5 bg-white/[0.03] border border-white/5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-300">
              <BriefcaseIcon />
              <span>Enterprise E-Commerce Specialist</span>
            </div>

            <div className="flex items-center gap-1.5 bg-white/[0.03] border border-white/5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-300">
              <AwardIcon />
              <span>10+ Years Experience</span>
            </div>
          </motion.div>

          <motion.h1 
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.08] mb-6 text-white"
            variants={itemVariants}
          >
            Engineering Scalable <br />
            <span className="text-gradient-purple-teal bg-gradient-to-r from-[#1da1f2] via-[#8b5cf6] to-[#14b8a6] bg-clip-text text-transparent font-black">
              Enterprise Commerce
            </span> <br />
            Platforms
          </motion.h1>

          <motion.h2
            className="text-lg md:text-xl font-medium text-slate-300/90 leading-relaxed max-w-2xl mb-8"
            variants={itemVariants}
          >
            Senior Software Engineer &amp; Technical Consultant with 10+ years of experience building, integrating, optimizing, and supporting enterprise-scale e-commerce systems across Oracle ATG, Java, Spring Boot, React, AWS, Salesforce, and cloud-native delivery pipelines.
          </motion.h2>

          {/* CTA Grid */}
          <motion.div 
            className="flex flex-wrap gap-4 w-full sm:w-auto"
            variants={itemVariants}
          >
            <a 
              href="#projects" 
              className="px-8 py-3.5 bg-white text-[#030712] rounded-full font-bold uppercase tracking-wider text-xs border border-white hover:bg-transparent hover:text-white transition-all duration-300 flex items-center shadow-lg shadow-white/5 hover:shadow-[#1da1f2]/20 hover:-translate-y-0.5"
            >
              View Projects
            </a>
            
            <a 
              href="https://github.com/MuniPrasad123" 
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 bg-transparent text-white rounded-full font-bold uppercase tracking-wider text-xs border border-white/10 hover:border-white/40 transition-all duration-300 flex items-center bg-white/[0.02] hover:-translate-y-0.5"
            >
              Download Resume
              <ArrowUpRight />
            </a>

            <a 
              href="https://www.linkedin.com/in/muni-prasad-k-7600bb105" 
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 bg-transparent text-white rounded-full font-bold uppercase tracking-wider text-xs border border-white/10 hover:border-[#1da1f2]/40 hover:bg-[#1da1f2]/5 transition-all duration-300 flex items-center hover:-translate-y-0.5"
            >
              LinkedIn
              <ArrowUpRight />
            </a>

            <a 
              href="https://github.com/MuniPrasad123" 
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 bg-transparent text-[#94a3b8] rounded-full font-bold uppercase tracking-wider text-xs border border-white/5 hover:border-white/20 hover:text-white transition-all duration-300 flex items-center hover:-translate-y-0.5"
            >
              GitHub
              <ArrowUpRight />
            </a>
          </motion.div>
        </motion.div>

        {/* Right Column - Visual card */}
        <motion.div 
          className="lg:col-span-5 flex justify-center lg:justify-end z-10"
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 80, damping: 15, delay: 0.4 }}
        >
          <div className="relative w-full max-w-[400px]">
            {/* Ambient Background Glows */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#1da1f2]/20 via-[#8b5cf6]/20 to-[#14b8a6]/20 rounded-[2rem] filter blur-3xl opacity-60 animate-pulse pointer-events-none" />
            
            {/* Visual Glass Card Container */}
            <motion.div 
              className="relative glass-panel rounded-3xl p-6 border border-white/10 overflow-hidden shadow-2xl backdrop-blur-xl flex flex-col items-center text-center"
              whileHover={{ y: -6, rotate: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 18 }}
            >
              {/* Photo wrapping */}
              <div className="relative w-48 h-48 rounded-2xl overflow-hidden mb-6 border border-white/10 bg-[#0d1326] flex items-center justify-center group">
                <img
                  src="/media/muni-profile.png.jpg"
                  alt="Muni Prasad"
                  className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => {
                    const t = e.target as HTMLImageElement
                    t.src = 'https://ui-avatars.com/api/?name=Muni+Prasad&background=0D1117&color=1da1f2&size=512&bold=true'
                    t.onerror = null
                  }}
                />
              </div>

              {/* Developer stats overlay info */}
              <h3 className="text-white font-bold text-lg mb-1">Muni Prasad K</h3>
              <p className="text-slate-400 text-xs font-semibold tracking-wider uppercase mb-4">Senior Software Engineer</p>
              
              <div className="w-full h-px bg-white/10 mb-4" />
              
              {/* Animated Floating Tech Badges */}
              <div className="flex flex-wrap justify-center gap-1.5 mb-2">
                {['Java', 'Spring Boot', 'Oracle ATG', 'AWS', 'React.js'].map((tech) => (
                  <span key={tech} className="text-[10px] font-bold uppercase tracking-wider bg-white/[0.04] border border-white/5 hover:border-[#1da1f2]/20 hover:text-white text-slate-300 px-3 py-1 rounded-full transition-all">
                    {tech}
                  </span>
                ))}
              </div>
              
              <div className="absolute top-4 right-4 bg-white/5 border border-white/10 p-2 rounded-xl flex items-center justify-center">
                <SparklesIcon />
              </div>
            </motion.div>
          </div>
        </motion.div>
        
      </div>
    </section>
  )
}

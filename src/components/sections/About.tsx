'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { profile } from '@/data/profile'

export function About() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  return (
    <section id="about" className="section section--dark py-24 relative">
      <div className="container max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left column: Text */}
        <motion.div 
          ref={ref}
          className="lg:col-span-7 flex flex-col items-start"
          initial={{ opacity: 0, x: -30 }}
          animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
          transition={{ duration: 0.6 }}
        >
          <span className="section__eyebrow">Overview</span>
          <h2 className="section__title mb-6">
            About <strong>Me</strong>
          </h2>
          
          <p className="text-slate-300 text-lg leading-relaxed mb-6 font-normal">
            {profile.about}
          </p>

          <p className="text-slate-400 text-base leading-relaxed mb-8">
            {profile.approach}
          </p>

          {/* Highlights List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            {[
              'Commerce workflows and business rules',
              'Java services and enterprise integrations',
              'Secure payment and checkout engineering',
              'Team leadership and production problem-solving'
            ].map((highlight, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#d7b660]/10 text-[#d7b660]">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <span className="text-slate-300 font-semibold text-sm">{highlight}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right column: capability markers */}
        <motion.div 
          className="lg:col-span-5 grid grid-cols-1 gap-4 w-full"
          initial={{ opacity: 0, x: 24 }}
          animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 24 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {['Commerce workflows', 'Java services', 'Payment integrations', 'Engineering leadership'].map((item,index) => <div key={item} className="glass-panel border border-white/10 p-4 rounded-xl flex items-center gap-4">
            <span className="text-xs text-[#d7b660] tracking-widest">0{index + 1}</span>
            <h3 className="text-sm font-semibold text-[#f6f1e4]">{item}</h3>
          </div>)}
        </motion.div>

      </div>
    </section>
  )
}

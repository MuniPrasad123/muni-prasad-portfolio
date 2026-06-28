'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

interface CounterProps {
  value: number
  suffix?: string
  label: string
}

function Counter({ value, suffix = '', label }: CounterProps) {
  const [count, setCount] = useState(0)
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  useEffect(() => {
    if (inView) {
      let start = 0
      const duration = 2000 // 2 seconds
      const end = value
      if (start === end) return
      
      const totalMilisecondsRound = duration
      const incrementTime = Math.abs(Math.floor(totalMilisecondsRound / end))
      
      const timer = setInterval(() => {
        start += 1
        setCount(start)
        if (start === end) clearInterval(timer)
      }, incrementTime)
      
      return () => clearInterval(timer)
    }
  }, [inView, value])

  return (
    <div ref={ref} className="glass-panel border border-white/5 p-6 rounded-2xl text-center bg-white/[0.01] hover:bg-white/[0.03] transition-all">
      <h3 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2">
        <span className="text-gradient-purple-teal bg-gradient-to-r from-[#1da1f2] to-[#8b5cf6] bg-clip-text text-transparent">
          {count}
        </span>
        {suffix}
      </h3>
      <p className="text-xs md:text-sm font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
    </div>
  )
}

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
            I specialize in enterprise e-commerce engineering, backend platform development, payment and checkout integrations, Salesforce CRM synchronization, promotions engine customization, production support, and root cause analysis. My work focuses on building stable, scalable, and maintainable systems for large retail and commerce platforms.
          </p>

          <p className="text-slate-400 text-base leading-relaxed mb-8">
            Throughout my 10+ year career, I have navigated complex Oracle ATG frameworks, engineered high-throughput Java microservices, and integrated external cloud services to drive critical business operations. I collaborate with cross-functional global teams to isolate infrastructure bottlenecks and deliver zero-downtime solutions.
          </p>

          {/* Highlights List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            {[
              'Enterprise-grade E-Commerce Architectures',
              'Oracle ATG & Spring Boot Mastery',
              'Advanced AWS Cloud Solutions',
              'Critical RCA & Production Support'
            ].map((highlight, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1da1f2]/10 text-[#1da1f2]">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <span className="text-slate-300 font-semibold text-sm">{highlight}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right column: Stats Counters */}
        <motion.div 
          className="lg:col-span-5 grid grid-cols-2 gap-4 w-full"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Counter value={10} suffix="+" label="Years Experience" />
          <Counter value={15} suffix="+" label="Enterprise Projects" />
          <Counter value={6} suffix="+" label="Top Retail Clients" />
          <Counter value={50} suffix="+" label="Tech Stack Skills" />
        </motion.div>

      </div>
    </section>
  )
}

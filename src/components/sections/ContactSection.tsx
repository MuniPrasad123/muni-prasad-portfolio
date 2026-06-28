'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

const MailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#1da1f2]">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
)

const MapPinIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#8b5cf6]">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)

const LinkedinIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#14b8a6]">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
)

const ArrowUpRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
    <path d="M7 17L17 7M17 7H7M17 7v10" />
  </svg>
)

export function ContactSection() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  return (
    <section id="contact" className="section section--dark py-24 relative overflow-hidden">
      <div className="container max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Column: Heading and Info */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, x: -30 }}
          animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-5 flex flex-col items-start"
        >
          <span className="section__eyebrow">Availability</span>
          <h2 className="section__title mb-6">
            Let&apos;s <strong>Connect</strong>
          </h2>
          <p className="text-slate-300 text-base leading-relaxed mb-8 font-normal">
            Looking for a Senior Software Engineer, E-Commerce Specialist, or Technical Consultant? I am available for full-time opportunities, consulting contracts, and system architecture audits. Let&apos;s talk.
          </p>

          <div className="flex flex-col gap-5 w-full">
            {/* Location */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-center">
                <MapPinIcon />
              </div>
              <div>
                <strong className="block text-xs uppercase tracking-wider text-slate-500 font-bold">Location</strong>
                <span className="text-slate-300 text-sm font-semibold">Bengaluru, India (Open to Remote / Relocation)</span>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-center">
                <MailIcon />
              </div>
              <div>
                <strong className="block text-xs uppercase tracking-wider text-slate-500 font-bold">Direct Email</strong>
                <a href="mailto:prasad.krish95@gmail.com" className="text-slate-300 text-sm font-semibold hover:text-[#1da1f2] transition-colors">
                  prasad.krish95@gmail.com
                </a>
              </div>
            </div>

            {/* LinkedIn */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-center">
                <LinkedinIcon />
              </div>
              <div>
                <strong className="block text-xs uppercase tracking-wider text-slate-500 font-bold">LinkedIn Profile</strong>
                <a href="https://www.linkedin.com/in/muni-prasad-k-7600bb105" target="_blank" rel="noopener noreferrer" className="text-slate-300 text-sm font-semibold hover:text-[#1da1f2] transition-colors">
                  linkedin.com/in/muni-prasad-k
                </a>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Interaction Action Buttons */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full"
        >
          {/* Action 1 */}
          <a
            href="mailto:prasad.krish95@gmail.com"
            className="glass-panel border border-white/5 bg-white/[0.01] hover:bg-[#1da1f2]/5 hover:border-[#1da1f2]/30 p-6 rounded-2xl flex items-center justify-between group transition-all duration-300 cursor-pointer"
          >
            <div>
              <h3 className="text-white font-bold text-base mb-1">Send Email</h3>
              <p className="text-xs text-slate-400 font-normal">Start a conversation directly</p>
            </div>
            <div className="text-slate-400 group-hover:text-white transition-colors">
              <ArrowUpRight />
            </div>
          </a>

          {/* Action 2 */}
          <a
            href="https://www.linkedin.com/in/muni-prasad-k-7600bb105"
            target="_blank"
            rel="noopener noreferrer"
            className="glass-panel border border-white/5 bg-white/[0.01] hover:bg-[#1da1f2]/5 hover:border-[#1da1f2]/30 p-6 rounded-2xl flex items-center justify-between group transition-all duration-300 cursor-pointer"
          >
            <div>
              <h3 className="text-white font-bold text-base mb-1">LinkedIn Connect</h3>
              <p className="text-xs text-slate-400 font-normal">Connect &amp; view recommendations</p>
            </div>
            <div className="text-slate-400 group-hover:text-white transition-colors">
              <ArrowUpRight />
            </div>
          </a>

          {/* Action 3 */}
          <a
            href="https://github.com/MuniPrasad123"
            target="_blank"
            rel="noopener noreferrer"
            className="glass-panel border border-white/5 bg-white/[0.01] hover:bg-[#1da1f2]/5 hover:border-[#1da1f2]/30 p-6 rounded-2xl flex items-center justify-between group transition-all duration-300 cursor-pointer"
          >
            <div>
              <h3 className="text-white font-bold text-base mb-1">GitHub Projects</h3>
              <p className="text-xs text-slate-400 font-normal">Audit codebases &amp; templates</p>
            </div>
            <div className="text-slate-400 group-hover:text-white transition-colors">
              <ArrowUpRight />
            </div>
          </a>

          {/* Action 4 */}
          <a
            href="https://github.com/MuniPrasad123"
            target="_blank"
            rel="noopener noreferrer"
            className="glass-panel border border-white/5 bg-white/[0.01] hover:bg-[#1da1f2]/5 hover:border-[#1da1f2]/30 p-6 rounded-2xl flex items-center justify-between group transition-all duration-300 cursor-pointer"
          >
            <div>
              <h3 className="text-white font-bold text-base mb-1">Resume Download</h3>
              <p className="text-xs text-slate-400 font-normal">Download ATS-ready copy</p>
            </div>
            <div className="text-slate-400 group-hover:text-white transition-colors">
              <ArrowUpRight />
            </div>
          </a>
        </motion.div>

      </div>
    </section>
  )
}

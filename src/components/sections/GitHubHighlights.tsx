'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1 text-yellow-500">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)

const ForkIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1 text-slate-400">
    <circle cx="18" cy="18" r="3" />
    <circle cx="6" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <path d="M18 15V9a4 4 0 0 0-4-4H9" />
    <line x1="6" x2="6" y1="9" y2="15" />
  </svg>
)

export function GitHubHighlights() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  return (
    <section id="github" className="section py-24">
      <div className="container max-w-7xl mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-left mb-16"
        >
          <span className="section__eyebrow">Open Source</span>
          <h2 className="section__title">
            GitHub <strong>Highlights</strong>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
            className="lg:col-span-4 glass-panel border border-white/5 bg-white/[0.01] p-6 rounded-2xl flex flex-col justify-between"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full overflow-hidden border border-white/10 mb-4 bg-[#0d1326]">
                <img
                  src="https://github.com/MuniPrasad123.png"
                  alt="MuniPrasad123 GitHub Avatar"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const t = e.target as HTMLImageElement
                    t.src = 'https://ui-avatars.com/api/?name=Muni+Prasad&background=0D1117&color=1da1f2&size=200&bold=true'
                  }}
                />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Muni Prasad K</h3>
              <p className="text-xs text-[#1da1f2] font-semibold mb-4">@MuniPrasad123</p>
              <p className="text-sm text-slate-400 mb-6 font-normal">
                Senior Technical Consultant developing scalable e-commerce systems, microservices, and database frameworks.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center text-xs text-slate-400 bg-white/[0.02] border border-white/5 p-3 rounded-xl">
                <span>Public Repositories</span>
                <strong className="text-white font-bold">12+</strong>
              </div>
              <a
                href="https://github.com/MuniPrasad123"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center py-3 bg-white text-[#030712] hover:bg-transparent hover:text-white border border-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md shadow-white/5 hover:shadow-[#1da1f2]/20"
              >
                View GitHub Profile
              </a>
            </div>
          </motion.div>

          {/* Featured Repositories */}
          <div className="lg:col-span-8 flex flex-col gap-6 justify-between">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
              {/* Repo 1 */}
              <motion.a
                href="https://github.com/MuniPrasad123/muni-prasad-portfolio"
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ type: 'spring', stiffness: 100, damping: 15, delay: 0.1 }}
                className="glass-panel border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] hover:border-[#1da1f2]/30 p-6 rounded-2xl flex flex-col justify-between group transition-all duration-300"
              >
                <div>
                  <div className="flex items-center gap-2 mb-3 text-slate-400">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:text-[#1da1f2] transition-colors">
                      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                    </svg>
                    <span className="text-xs font-bold uppercase tracking-wider">Repository</span>
                  </div>
                  <h4 className="text-base font-bold text-white group-hover:text-[#1da1f2] transition-colors mb-2">muni-prasad-portfolio</h4>
                  <p className="text-sm text-slate-400 font-normal mb-4">
                    The source code of this modern e-commerce portfolio site built with Next.js 16, Payload CMS v3, Neon DB, Tailwind CSS v4, and Framer Motion.
                  </p>
                </div>

                <div className="flex gap-4 text-xs font-semibold text-slate-500">
                  <span className="flex items-center"><StarIcon /> 3 Stars</span>
                  <span className="flex items-center"><ForkIcon /> 1 Fork</span>
                  <span className="h-2 w-2 rounded-full bg-[#3178c6] self-center ml-auto" />
                  <span>TypeScript</span>
                </div>
              </motion.a>

              {/* Repo 2 */}
              <motion.a
                href="https://github.com/MuniPrasad123/MuniPrasad123"
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ type: 'spring', stiffness: 100, damping: 15, delay: 0.2 }}
                className="glass-panel border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] hover:border-[#1da1f2]/30 p-6 rounded-2xl flex flex-col justify-between group transition-all duration-300"
              >
                <div>
                  <div className="flex items-center gap-2 mb-3 text-slate-400">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:text-[#1da1f2] transition-colors">
                      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                    </svg>
                    <span className="text-xs font-bold uppercase tracking-wider">Repository</span>
                  </div>
                  <h4 className="text-base font-bold text-white group-hover:text-[#1da1f2] transition-colors mb-2">MuniPrasad123</h4>
                  <p className="text-sm text-slate-400 font-normal mb-4">
                    Personal profile description overview detailing professional workflow matrices, cloud orchestrations, and integration endpoints.
                  </p>
                </div>

                <div className="flex gap-4 text-xs font-semibold text-slate-500">
                  <span className="flex items-center"><StarIcon /> 2 Stars</span>
                  <span className="flex items-center"><ForkIcon /> 0 Forks</span>
                  <span className="h-2 w-2 rounded-full bg-[#8b5cf6] self-center ml-auto" />
                  <span>Markdown</span>
                </div>
              </motion.a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

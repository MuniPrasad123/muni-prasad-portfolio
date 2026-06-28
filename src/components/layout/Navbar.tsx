'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

const GithubIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="w-5 h-5">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
)

const LinkedinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="w-5 h-5">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
)

const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="w-5 h-5">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
)

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="18" y2="18" />
  </svg>
)

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <line x1="18" x2="6" y1="6" y2="18" />
    <line x1="6" x2="18" y1="6" y2="18" />
  </svg>
)

const navLinks = [
  { label: 'Home', href: '#home', id: 'home' },
  { label: 'About', href: '#about', id: 'about' },
  { label: 'Expertise', href: '#expertise', id: 'expertise' },
  { label: 'Projects', href: '#projects', id: 'projects' },
  { label: 'Experience', href: '#experience', id: 'experience' },
  { label: 'Services', href: '#services', id: 'services' },
  { label: 'Skills', href: '#skills', id: 'skills' },
  { label: 'GitHub', href: '#github', id: 'github' },
  { label: 'Certifications', href: '#certifications', id: 'certifications' },
  { label: 'Contact', href: '#contact', id: 'contact' },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const [scrolled, setScrolled] = useState(false)

  // Track scrolling to add styling to header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Highlight current active section using Intersection Observer
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-30% 0px -60% 0px', // Trigger when section occupies the middle portion
      threshold: 0,
    }

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id)
        }
      })
    }

    const observer = new IntersectionObserver(observerCallback, observerOptions)

    navLinks.forEach((link) => {
      const el = document.getElementById(link.id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <>
      <nav className={`navbar transition-all duration-300 ${scrolled ? 'navbar--scrolled border-b border-white/[0.08] bg-[#030712]/90 backdrop-blur-xl shadow-lg shadow-black/20' : 'bg-transparent border-b border-transparent'}`}>
        <div className="navbar__inner px-6 max-w-7xl mx-auto flex items-center justify-between h-20">
          <Link href="#home" className="navbar__brand font-extrabold text-xl tracking-tight flex items-center gap-1">
            <span className="text-white">MUNI</span>
            <span className="text-[#1da1f2] font-black">PRASAD</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={link.href}
                className={`text-sm font-semibold tracking-wide transition-all relative py-2 ${
                  activeSection === link.id
                    ? 'text-white font-bold'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                {link.label}
                {activeSection === link.id && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1da1f2] rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </a>
            ))}
          </div>

          {/* Desktop Socials */}
          <div className="hidden lg:flex items-center gap-3">
            <a href="https://github.com/MuniPrasad123" target="_blank" rel="noreferrer" className="navbar__social-btn border border-white/10 hover:border-[#1da1f2]/40 hover:bg-[#1da1f2]/10 hover:text-[#1da1f2] p-2 rounded-full transition-all text-[#94a3b8]" aria-label="GitHub">
              <GithubIcon />
            </a>
            <a href="https://www.linkedin.com/in/muni-prasad-k-7600bb105" target="_blank" rel="noreferrer" className="navbar__social-btn border border-white/10 hover:border-[#1da1f2]/40 hover:bg-[#1da1f2]/10 hover:text-[#1da1f2] p-2 rounded-full transition-all text-[#94a3b8]" aria-label="LinkedIn">
              <LinkedinIcon />
            </a>
            <a href="mailto:prasad.krish95@gmail.com" className="navbar__social-btn border border-white/10 hover:border-[#1da1f2]/40 hover:bg-[#1da1f2]/10 hover:text-[#1da1f2] p-2 rounded-full transition-all text-[#94a3b8]" aria-label="Email">
              <MailIcon />
            </a>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden text-[#94a3b8] hover:text-white p-2 border border-white/10 rounded-lg hover:bg-white/5 transition-all"
            aria-label="Toggle menu"
          >
            {isOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-20 left-0 right-0 z-40 bg-[#030712]/95 border-b border-white/10 backdrop-blur-xl lg:hidden flex flex-col p-6 gap-6"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`text-base font-semibold transition-all py-1 ${
                    activeSection === link.id
                      ? 'text-[#1da1f2] font-bold border-l-2 border-[#1da1f2] pl-3'
                      : 'text-[#94a3b8] hover:text-white pl-3'
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="h-px bg-white/10 w-full" />

            <div className="flex items-center justify-around">
              <a href="https://github.com/MuniPrasad123" target="_blank" rel="noreferrer" className="flex items-center gap-2 border border-white/10 hover:border-[#1da1f2]/40 hover:bg-[#1da1f2]/10 hover:text-[#1da1f2] px-4 py-2 rounded-full transition-all text-[#94a3b8] text-sm font-semibold w-1/3 justify-center" aria-label="GitHub">
                <GithubIcon />
                <span>GitHub</span>
              </a>
              <a href="https://www.linkedin.com/in/muni-prasad-k-7600bb105" target="_blank" rel="noreferrer" className="flex items-center gap-2 border border-white/10 hover:border-[#1da1f2]/40 hover:bg-[#1da1f2]/10 hover:text-[#1da1f2] px-4 py-2 rounded-full transition-all text-[#94a3b8] text-sm font-semibold w-1/3 justify-center" aria-label="LinkedIn">
                <LinkedinIcon />
                <span>LinkedIn</span>
              </a>
              <a href="mailto:prasad.krish95@gmail.com" className="flex items-center gap-2 border border-white/10 hover:border-[#1da1f2]/40 hover:bg-[#1da1f2]/10 hover:text-[#1da1f2] px-4 py-2 rounded-full transition-all text-[#94a3b8] text-sm font-semibold w-1/3 justify-center" aria-label="Email">
                <MailIcon />
                <span>Email</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

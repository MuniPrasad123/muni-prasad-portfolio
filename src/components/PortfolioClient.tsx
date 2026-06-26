'use client'

import React, { useEffect, useState, useRef } from 'react'

export interface ProjectItem {
  id?: string
  title: string
  problemStatement?: string
  role?: string
  outcome?: string
  techStack?: { tech: string }[] | string[]
  githubLink?: string
  caseStudyLink?: string
  image?: any
}

export interface ExperienceItem {
  id?: string
  role: string
  company: string
  dateRange?: string
  description?: string
  skillsUsed?: { skill: string }[] | string[]
}

export interface CertificationItem {
  id?: string
  title: string
  description?: string
  status?: 'completed' | 'pending'
  badge?: any
}

interface PortfolioClientProps {
  initialProjects: ProjectItem[]
  initialExperiences: ExperienceItem[]
  initialCertifications: CertificationItem[]
}

const getImageUrl = (imageField: any, fallbackPath: string) => {
  if (imageField && typeof imageField === 'object' && imageField.url) {
    return imageField.url
  }
  if (typeof imageField === 'string' && imageField) {
    return imageField
  }
  return fallbackPath
}

export default function PortfolioClient({
  initialProjects,
  initialExperiences,
  initialCertifications,
}: PortfolioClientProps) {
  const [menuActive, setMenuActive] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showToast, setShowToast] = useState(false)

  const statsRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  const timelineProgressRef = useRef<HTMLDivElement>(null)

  // Local static fallbacks if database is empty
  const [projects] = useState<ProjectItem[]>(
    initialProjects.length > 0
      ? initialProjects
      : [
          {
            title: 'Enterprise Commerce Checkout Flow',
            problemStatement:
              'Legacy payment gateway redirect loops causing checkout drop-offs and session mismatches during zero-amount coupon transactions.',
            role: 'Implemented custom payment status validation filters in Java and designed redirect logs tracking.',
            outcome:
              'Reduced payment validation failures by 98% and established a clear checkout failure troubleshooting matrix.',
            techStack: ['Oracle ATG', 'Java API', 'Payment Redirects'],
            githubLink:
              'https://github.com/MuniPrasad123/enterprise-commerce-checkout-payment-flow',
            image: '/assets/project-checkout.svg',
          },
          {
            title: 'ATG Promotion Engine Toolkit',
            problemStatement:
              'Conflicting order-level discount rules overriding item-level coupons, leading to wrong pricing during checkouts.',
            role: 'Built rule evaluation matrix and mapped priority parameters within the ATG pricing pipeline.',
            outcome:
              'Prevented conflicting promotions application and created an open-source test matrix schema.',
            techStack: ['ATG Commerce', 'Pricing Rules', 'Unit Matrix'],
            githubLink:
              'https://github.com/MuniPrasad123/atg-promotion-engine-analysis-toolkit',
            image: '/assets/project-promotions.svg',
          },
          {
            title: 'Salesforce CRM Integration RCA',
            problemStatement:
              'Intermittent validation failures during profile creation syncs, triggered by malformed browser autocomplete values.',
            role: 'Conducted detailed API audit checks and traced mapping disparities in payload definitions.',
            outcome:
              'Implemented server-side validation filters and structured an RCA template used by 4 engineering teams.',
            techStack: ['Salesforce API', 'REST Integration', 'RCA Template'],
            githubLink:
              'https://github.com/MuniPrasad123/salesforce-crm-integration-rca-template',
            image: '/assets/project-salesforce.svg',
          },
          {
            title: 'Server GTM / Pinterest CAPI Guide',
            problemStatement:
              'Browser-side ad-blocking dropping 30%+ of analytics events, skewing commerce conversion tracking.',
            role: 'Developed server-side payload formatting mapping using hashed user data variables.',
            outcome:
              'Restored reporting event parity and constructed a structured server-to-server validation playbook.',
            techStack: ['Server GTM', 'CAPI', 'Data Hashing'],
            githubLink:
              'https://github.com/MuniPrasad123/server-side-gtm-capi-validation-guide',
            image: '/assets/project-gtm.svg',
          },
          {
            title: 'Spring Boot CI/CD AWS Demo',
            problemStatement:
              'Deploying monolithic updates requires downtime, risking shopping cart losses during deployment.',
            role: 'Configured Docker container scripts and defined blue-green deployment pipelines in Jenkins.',
            outcome:
              'Achieved zero-downtime container replacement workflows and clean environmental variables setup.',
            techStack: ['Docker', 'AWS ECS', 'Jenkins CI/CD'],
            githubLink:
              'https://github.com/MuniPrasad123/springboot-ci-cd-aws-deployment-demo',
            image: '/assets/project-cicd.svg',
          },
          {
            title: 'React Commerce Admin UI',
            problemStatement:
              'Business teams lacking visual feedback to track promotion execution and analyze real-time checkout failures.',
            role: 'Created a modular React dashboard mockup simulating a catalog manager and event validation checker.',
            outcome:
              'Showcased front-to-back engineering capacity by building an intuitive search-and-inspect admin UI.',
            techStack: ['React.js', 'JavaScript ES6', 'Admin Mock'],
            githubLink: 'https://github.com/MuniPrasad123/react-commerce-admin-ui',
            image: '/assets/project-admin.svg',
          },
        ]
  )

  const [experiences] = useState<ExperienceItem[]>(
    initialExperiences.length > 0
      ? initialExperiences
      : [
          {
            role: 'Senior Technical Consultant',
            company: 'OLR Retail',
            dateRange: 'Mar 2023 – Present',
            description:
              'Lead key development and integration modules for multi-store commerce deployments in Mexico (COMEX, NAZAN Mexico ecommerce platforms), maintaining core stability, catalog processing, and checkout pipelines. Collaborate on Oracle ATG Commerce backend customization, payment gateway redirects, production hotfixes, and API alignment with external systems. Manage Jenkins automation triggers, Docker containers, AWS Elastic Container Service tasks, Oracle SQL tuning, and production issue investigations using the ELK Stack, Jira metrics, and coordinate QA pipelines to validate code releases.',
            skillsUsed: [
              'Oracle ATG',
              'Java SE',
              'AWS ECS',
              'Jenkins CI/CD',
              'Docker',
              'Salesforce',
              'ELK Stack',
              'Oracle SQL',
            ],
          },
          {
            role: 'Senior Software Engineer & E-Commerce Developer',
            company: 'Enterprise Commerce Engagements',
            dateRange: 'Previous Roles',
            description:
              'Contributed to enterprise development projects across software agencies and service firms, including Intersoft Solutions, Skoruz Technologies, Ilabz Technologies, Redgrape Business Services, and RT Medibus. Designed Spring Boot REST APIs, refactored legacy Java/J2EE structures, built integration templates for CRM systems, and optimized backend query operations against Oracle SQL and PostgreSQL databases. Managed end-to-end production support, handled root cause analysis workflows, resolved priority tickets, and provided active QA verification support during high-traffic promotional periods.',
            skillsUsed: [
              'Java/J2EE',
              'Spring Boot',
              'Microservices',
              'PostgreSQL',
              'Hibernate',
              'RESTful APIs',
              'QA Coordination',
              'ELK Logging',
            ],
          },
        ]
  )

  const [certifications] = useState<CertificationItem[]>(
    initialCertifications.length > 0
      ? initialCertifications
      : [
          {
            title: 'AWS Certified Developer',
            description:
              'Associate level. Cloud application deployment, deployment orchestration, serverless structures.',
            status: 'completed',
            badge: '/assets/cert-aws.svg',
          },
          {
            title: 'Oracle Java SE 17 Developer',
            description:
              'Advanced standard edition backend development practices, syntax validation, JVM structuring.',
            status: 'completed',
            badge: '/assets/cert-java.svg',
          },
          {
            title: 'Spring Certified Professional',
            description:
              'Spring Boot, Spring Framework validation, microservices structuring, bean management patterns.',
            status: 'completed',
            badge: '/assets/cert-spring.svg',
          },
          {
            title: 'GitHub Actions Certification',
            description:
              'Automated pipeline definitions, environmental configurations, custom workflow actions setup.',
            status: 'pending',
            badge: '/assets/cert-github.svg',
          },
          {
            title: 'HackerRank Skills',
            description:
              'Verified certificates: Java (Advanced), SQL (Advanced), and React (Intermediate).',
            status: 'completed',
            badge: '/assets/cert-hackerrank.svg',
          },
          {
            title: 'freeCodeCamp Credentials',
            description:
              'Completed Backend Development APIs and Frontend Libraries structures.',
            status: 'completed',
            badge: '/assets/cert-freecodecamp.svg',
          },
        ]
  )

  useEffect(() => {
    // Header Scroll class
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    handleScroll()

    // Scroll Reveal Observer
    const revealElements = document.querySelectorAll('.reveal-up')
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
            observer.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.05,
        rootMargin: '0px 0px -40px 0px',
      }
    )
    revealElements.forEach((el) => revealObserver.observe(el))

    // Statistics Incremental Counter
    const statValues = document.querySelectorAll('.stat-value[data-target]')
    const countDuration = 2000

    const animateCount = (el: Element) => {
      const targetAttr = el.getAttribute('data-target')
      if (!targetAttr) return
      const target = parseInt(targetAttr, 10)
      const start = 0
      const increment = target / (countDuration / 16)
      let current = start

      const updateCount = () => {
        current += increment
        if (current >= target) {
          el.textContent = String(target)
        } else {
          el.textContent = String(Math.floor(current))
          requestAnimationFrame(updateCount)
        }
      }
      requestAnimationFrame(updateCount)
    }

    const statsSec = statsRef.current
    let statsObserver: IntersectionObserver | null = null
    if (statsSec) {
      statsObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              statValues.forEach((val) => animateCount(val))
              observer.unobserve(entry.target)
            }
          })
        },
        { threshold: 0.2 }
      )
      statsObserver.observe(statsSec)
    }

    // Timeline progress tracking
    const handleTimelineScroll = () => {
      const timelineContainer = timelineRef.current
      const timelineBar = timelineProgressRef.current
      if (timelineContainer && timelineBar) {
        const rect = timelineContainer.getBoundingClientRect()
        const containerHeight = rect.height
        const containerTop = rect.top
        const viewportHeight = window.innerHeight

        const triggerPoint = viewportHeight / 2
        let progressHeight = triggerPoint - containerTop

        if (progressHeight < 0) {
          progressHeight = 0
        } else if (progressHeight > containerHeight) {
          progressHeight = containerHeight
        }

        const percent = (progressHeight / containerHeight) * 100
        timelineBar.style.height = `${percent}%`
      }
    }

    window.addEventListener('scroll', handleTimelineScroll)
    handleTimelineScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('scroll', handleTimelineScroll)
      revealObserver.disconnect()
      if (statsObserver) {
        statsObserver.disconnect()
      }
    }
  }, [])

  // Clipboard copy handler
  const handleCopyEmail = () => {
    const email = 'prasad.krish95@gmail.com'
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email).then(() => {
        setShowToast(true)
        setTimeout(() => setShowToast(false), 2500)
      })
    } else {
      const textarea = document.createElement('textarea')
      textarea.value = email
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      try {
        document.execCommand('copy')
        setShowToast(true)
        setTimeout(() => setShowToast(false), 2500)
      } catch (err) {
        console.error('Copy failed fallback', err)
      }
      document.body.removeChild(textarea)
    }
  }

  return (
    <>
      {/* Header Section */}
      <header className={`site-header ${scrolled ? 'scrolled' : ''}`} id="header">
        <nav className="nav container" aria-label="Main Navigation">
          <a className="brand" href="#home" aria-label="Muni Prasad K Portfolio Home">
            Muni Prasad K<span>.</span>
          </a>
          <button
            className="nav-toggle"
            aria-expanded={menuActive}
            aria-controls="nav-links"
            aria-label="Toggle navigation menu"
            onClick={() => setMenuActive(!menuActive)}
          >
            <span>☰</span>
          </button>
          <div className={`nav-links ${menuActive ? 'active' : ''}`} id="nav-links">
            <a href="#about" onClick={() => setMenuActive(false)}>
              About
            </a>
            <a href="#experience" onClick={() => setMenuActive(false)}>
              Experience
            </a>
            <a href="#projects" onClick={() => setMenuActive(false)}>
              Projects
            </a>
            <a href="#skills" onClick={() => setMenuActive(false)}>
              Skills
            </a>
            <a href="#certifications" onClick={() => setMenuActive(false)}>
              Certifications
            </a>
            <a href="#resume" onClick={() => setMenuActive(false)}>
              Resume
            </a>
            <a
              href="#contact"
              className="btn btn-secondary btn-small"
              onClick={() => setMenuActive(false)}
            >
              Contact
            </a>
          </div>
        </nav>
      </header>

      <main>
        {/* Background Glow Effects */}
        <div className="glow-effect glow-1" aria-hidden="true"></div>
        <div className="glow-effect glow-2" aria-hidden="true"></div>

        {/* Hero Section */}
        <section id="home" className="hero">
          <div className="container hero-grid">
            <div className="hero-content reveal-up">
              <span className="eyebrow">Enterprise Tech Consultant</span>
              <h1>
                <span className="gradient-text">Engineering Scalable Commerce</span> Platforms
              </h1>
              <p className="hero-subtitle">
                Senior Software Engineer &amp; Technical Consultant with{' '}
                <strong>10+ years of experience</strong> leading the development, integration,
                optimization, and production support of enterprise-scale e-commerce systems.
              </p>
              <p
                className="hero-subtitle"
                style={{ fontSize: '0.95rem', marginTop: '-10px', color: 'var(--text-muted)' }}
              >
                Enterprise E-Commerce | Oracle ATG | Java | Spring Boot | AWS | React |
                Salesforce Integrations
              </p>

              <div className="btn-group">
                <a className="btn btn-primary" href="#projects">
                  <span>View Projects</span>
                  <svg
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 13l-7 7-7-7m14-6l-7 7-7-7"
                    />
                  </svg>
                </a>
                <a
                  className="btn btn-secondary"
                  href="/assets/Muni-Prasad-Resume.pdf"
                  download="Muni-Prasad-Resume.pdf"
                >
                  <span>Download Resume</span>
                  <svg
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                </a>
                <a className="btn btn-secondary" href="#contact">
                  Contact Me
                </a>
              </div>

              <div className="hero-tech-pills">
                <span className="badge-label">Core Tech Stack</span>
                <div className="badges-container">
                  <span className="tech-badge">Java</span>
                  <span className="tech-badge">Oracle ATG</span>
                  <span className="tech-badge">Spring Boot</span>
                  <span className="tech-badge">AWS</span>
                  <span className="tech-badge">React</span>
                  <span className="tech-badge">Salesforce</span>
                  <span className="tech-badge">Jenkins</span>
                  <span className="tech-badge">Docker</span>
                  <span className="tech-badge">SQL</span>
                </div>
              </div>

              <div className="quick-stats" aria-label="Professional Metrics" ref={statsRef}>
                <div className="stat-item">
                  <div className="stat-value" data-target="10">
                    0
                  </div>
                  <span
                    style={{
                      fontSize: '2.2rem',
                      lineHeight: '1',
                      color: '#ffffff',
                      background: 'none',
                      WebkitTextFillColor: 'initial',
                      marginLeft: '-5px',
                    }}
                  >
                    +
                  </span>
                  <div className="stat-label">Years Experience</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value" data-target="15">
                    0
                  </div>
                  <span
                    style={{
                      fontSize: '2.2rem',
                      lineHeight: '1',
                      color: '#ffffff',
                      background: 'none',
                      WebkitTextFillColor: 'initial',
                      marginLeft: '-5px',
                    }}
                  >
                    +
                  </span>
                  <div className="stat-label">Enterprise Deliveries</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value" data-target="25">
                    0
                  </div>
                  <span
                    style={{
                      fontSize: '2.2rem',
                      lineHeight: '1',
                      color: '#ffffff',
                      background: 'none',
                      WebkitTextFillColor: 'initial',
                      marginLeft: '-5px',
                    }}
                  >
                    +
                  </span>
                  <div className="stat-label">Tech Competencies</div>
                </div>
              </div>
            </div>

            <div className="hero-visual reveal-up" style={{ transitionDelay: '0.2s' }}>
              <div className="profile-card">
                <div className="profile-avatar-container">
                  <div className="profile-avatar-glow"></div>
                  <div className="avatar-wrapper">
                    <img
                      className="avatar-placeholder-svg"
                      src="/assets/profile-photo.svg"
                      alt="Muni Prasad K Professional Avatar Placeholder"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                </div>
                <h2>Muni Prasad K</h2>
                <div className="profile-title">Senior Technical Consultant</div>

                <div className="profile-info-list">
                  <div className="profile-info-item">
                    <span className="info-label">Specialty:</span>
                    <span className="info-val">Commerce Architectures</span>
                  </div>
                  <div className="profile-info-item">
                    <span className="info-label">Focus:</span>
                    <span className="info-val">Integrations &amp; RCA</span>
                  </div>
                  <div className="profile-info-item">
                    <span className="info-label">Location:</span>
                    <span className="info-val">Bengaluru, India</span>
                  </div>
                </div>

                <div className="profile-badges">
                  <span>Oracle ATG</span>
                  <span>Java Platform</span>
                  <span>AWS Cloud</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="section muted">
          <div className="container about-grid">
            <div className="about-content reveal-up">
              <span className="eyebrow">Enterprise Delivery</span>
              <h2>Solving Complex Commerce Challenges End-to-End</h2>
              <p>
                I specialize in the design, development, and resolution of critical components in
                multi-million dollar e-commerce infrastructures. I solve enterprise challenges
                involving transaction checkout flows, multi-provider payment gateways, custom
                promotion systems, real-time CRM synchronization (Salesforce), analytics reporting
                pipelines, and server-side pixel tracking.
              </p>
              <p>
                With a strong focus on production stability, I actively lead Root Cause Analysis
                (RCA) investigations using ELK log analysis, orchestrate QA environments, coordinate
                delivery pipelines, and support continuous cloud deployments.
              </p>
              <p style={{ fontWeight: '500', color: 'var(--accent-cyan)' }}>
                My goal is to convert complex integration failure modes into bulletproof, structured
                engineering solutions.
              </p>
            </div>
            <div className="about-visual reveal-up" style={{ transitionDelay: '0.2s' }}>
              <div className="architecture-diagram-container">
                <img
                  src="/assets/enterprise-architecture.svg"
                  alt="Enterprise Commerce System Architecture Diagram"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Experience Timeline Section */}
        <section id="experience" className="section">
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '50px' }} className="reveal-up">
              <span className="eyebrow">Career Milestones</span>
              <h2>Professional Timeline</h2>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
                A track record of engineering stability, leading custom integration architectures,
                and managing critical retail systems.
              </p>
            </div>

            <div className="timeline-container" ref={timelineRef}>
              {/* Central scroll progress bar */}
              <div className="timeline-bar">
                <div
                  className="timeline-progress"
                  id="timeline-progress-bar"
                  ref={timelineProgressRef}
                ></div>
              </div>

              {experiences.map((exp, index) => (
                <article
                  key={exp.id || index}
                  className="timeline-card reveal-up"
                  style={{ transitionDelay: `${index * 0.1}s` }}
                >
                  <div className="timeline-dot"></div>
                  <div className="timeline-header">
                    <div>
                      <h3 className="timeline-role">{exp.role}</h3>
                      <div className="timeline-company">{exp.company}</div>
                    </div>
                    {exp.dateRange && <span className="timeline-date">{exp.dateRange}</span>}
                  </div>
                  <div className="timeline-body">
                    {exp.description && <p>{exp.description}</p>}
                    {exp.skillsUsed && (
                      <div className="timeline-tags">
                        {(Array.isArray(exp.skillsUsed) ? exp.skillsUsed : []).map((skill, si) => {
                          const skillVal =
                            typeof skill === 'object' && skill !== null
                              ? (skill as any).skill
                              : String(skill)
                          return <span key={si}>{skillVal}</span>
                        })}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Projects Section */}
        <section id="projects" className="section muted">
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '50px' }} className="reveal-up">
              <span className="eyebrow">Case Studies &amp; Demonstrations</span>
              <h2>Featured Enterprise Projects</h2>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
                A collection of production-style designs, templates, and integration blueprints.
              </p>
            </div>

            <div className="projects-grid">
              {projects.map((proj, index) => (
                <article
                  key={proj.id || index}
                  className="project-card reveal-up"
                  style={{ transitionDelay: `${(index % 3) * 0.1}s` }}
                >
                  <div className="project-image-wrapper">
                    <img
                      src={getImageUrl(proj.image, '/assets/project-checkout.svg')}
                      alt={proj.title}
                      className="project-image-placeholder"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div className="project-content">
                    <h3 className="project-title">{proj.title}</h3>
                    <div className="project-details">
                      {proj.problemStatement && (
                        <div className="project-detail-item">
                          <span className="project-detail-label">Problem Statement</span>
                          <p className="project-detail-text">{proj.problemStatement}</p>
                        </div>
                      )}
                      {proj.role && (
                        <div className="project-detail-item">
                          <span className="project-detail-label">My Role</span>
                          <p className="project-detail-text">{proj.role}</p>
                        </div>
                      )}
                      {proj.outcome && (
                        <div className="project-detail-item">
                          <span className="project-detail-label">Outcome</span>
                          <p className="project-detail-text">{proj.outcome}</p>
                        </div>
                      )}
                    </div>
                    {proj.techStack && (
                      <div className="project-tags">
                        {(Array.isArray(proj.techStack) ? proj.techStack : []).map((tech, ti) => {
                          const techVal =
                            typeof tech === 'object' && tech !== null
                              ? (tech as any).tech
                              : String(tech)
                          return <span key={ti}>{techVal}</span>
                        })}
                      </div>
                    )}
                    {proj.githubLink && (
                      <div className="project-links">
                        <a
                          href={proj.githubLink}
                          className="project-link"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <svg viewBox="0 0 16 16">
                            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                          </svg>
                          <span>Code Blueprint</span>
                        </a>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Skills Matrix Section */}
        <section id="skills" className="section">
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '50px' }} className="reveal-up">
              <span className="eyebrow">Technical Skill Matrix</span>
              <h2>Professional Competency Areas</h2>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
                A structured breakdown of core engineering, scripting, cloud systems, and diagnostics
                competencies.
              </p>
            </div>

            <div className="skills-grid">
              {/* Skill Group 1: Commerce & Backend */}
              <div className="skill-card reveal-up">
                <div className="skill-card-header">
                  <div className="skill-card-icon" aria-hidden="true">
                    <svg
                      width="20"
                      height="20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                      />
                    </svg>
                  </div>
                  <h3>Commerce &amp; Backend</h3>
                </div>
                <div className="skill-list">
                  <div className="skill-list-item">
                    <div className="skill-name">
                      <span>Oracle ATG Commerce</span>
                      <span className="skill-proficiency">Expert</span>
                    </div>
                    <div className="skill-bar-bg">
                      <div className="skill-bar-fill" style={{ width: '95%' }}></div>
                    </div>
                  </div>
                  <div className="skill-list-item">
                    <div className="skill-name">
                      <span>Java &amp; J2EE Platform</span>
                      <span className="skill-proficiency">Expert</span>
                    </div>
                    <div className="skill-bar-bg">
                      <div className="skill-bar-fill" style={{ width: '90%' }}></div>
                    </div>
                  </div>
                  <div className="skill-list-item">
                    <div className="skill-name">
                      <span>Spring Boot &amp; APIs</span>
                      <span className="skill-proficiency">Advanced</span>
                    </div>
                    <div className="skill-bar-bg">
                      <div className="skill-bar-fill" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Skill Group 2: Cloud & DevOps */}
              <div className="skill-card reveal-up" style={{ transitionDelay: '0.1s' }}>
                <div className="skill-card-header">
                  <div className="skill-card-icon" aria-hidden="true">
                    <svg
                      width="20"
                      height="20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z"
                      />
                    </svg>
                  </div>
                  <h3>Cloud &amp; DevOps</h3>
                </div>
                <div className="skill-list">
                  <div className="skill-list-item">
                    <div className="skill-name">
                      <span>AWS Services (ECS, S3, RDS)</span>
                      <span className="skill-proficiency">Advanced</span>
                    </div>
                    <div className="skill-bar-bg">
                      <div className="skill-bar-fill" style={{ width: '80%' }}></div>
                    </div>
                  </div>
                  <div className="skill-list-item">
                    <div className="skill-name">
                      <span>Jenkins &amp; CI/CD Pipelines</span>
                      <span className="skill-proficiency">Advanced</span>
                    </div>
                    <div className="skill-bar-bg">
                      <div className="skill-bar-fill" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  <div className="skill-list-item">
                    <div className="skill-name">
                      <span>Docker Containers</span>
                      <span className="skill-proficiency">Advanced</span>
                    </div>
                    <div className="skill-bar-bg">
                      <div className="skill-bar-fill" style={{ width: '80%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Skill Group 3: Frontend */}
              <div className="skill-card reveal-up" style={{ transitionDelay: '0.2s' }}>
                <div className="skill-card-header">
                  <div className="skill-card-icon" aria-hidden="true">
                    <svg
                      width="20"
                      height="20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
                      />
                    </svg>
                  </div>
                  <h3>Frontend</h3>
                </div>
                <div className="skill-list">
                  <div className="skill-list-item">
                    <div className="skill-name">
                      <span>React.js Framework</span>
                      <span className="skill-proficiency">Intermediate</span>
                    </div>
                    <div className="skill-bar-bg">
                      <div className="skill-bar-fill" style={{ width: '70%' }}></div>
                    </div>
                  </div>
                  <div className="skill-list-item">
                    <div className="skill-name">
                      <span>Modern JavaScript (ES6+)</span>
                      <span className="skill-proficiency">Advanced</span>
                    </div>
                    <div className="skill-bar-bg">
                      <div className="skill-bar-fill" style={{ width: '80%' }}></div>
                    </div>
                  </div>
                  <div className="skill-list-item">
                    <div className="skill-name">
                      <span>HTML5 / Vanilla CSS3</span>
                      <span className="skill-proficiency">Advanced</span>
                    </div>
                    <div className="skill-bar-bg">
                      <div className="skill-bar-fill" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Skill Group 4: Integrations */}
              <div className="skill-card reveal-up">
                <div className="skill-card-header">
                  <div className="skill-card-icon" aria-hidden="true">
                    <svg
                      width="20"
                      height="20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
                      />
                    </svg>
                  </div>
                  <h3>Integrations</h3>
                </div>
                <div className="skill-list">
                  <div className="skill-list-item">
                    <div className="skill-name">
                      <span>Salesforce API Sync</span>
                      <span className="skill-proficiency">Advanced</span>
                    </div>
                    <div className="skill-bar-bg">
                      <div className="skill-bar-fill" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  <div className="skill-list-item">
                    <div className="skill-name">
                      <span>Payment Gateways Integration</span>
                      <span className="skill-proficiency">Expert</span>
                    </div>
                    <div className="skill-bar-bg">
                      <div className="skill-bar-fill" style={{ width: '90%' }}></div>
                    </div>
                  </div>
                  <div className="skill-list-item">
                    <div className="skill-name">
                      <span>Server-side Tracking / GTM</span>
                      <span className="skill-proficiency">Advanced</span>
                    </div>
                    <div className="skill-bar-bg">
                      <div className="skill-bar-fill" style={{ width: '80%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Skill Group 5: Database & Monitoring */}
              <div className="skill-card reveal-up" style={{ transitionDelay: '0.1s' }}>
                <div className="skill-card-header">
                  <div className="skill-card-icon" aria-hidden="true">
                    <svg
                      width="20"
                      height="20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125v-3.75m16.5 0v3.75m-16.5-3.75v3.75C3.75 16.103 7.444 18 12 18s8.25-1.897 8.25-4.125v-3.75"
                      />
                    </svg>
                  </div>
                  <h3>Database &amp; Monitoring</h3>
                </div>
                <div className="skill-list">
                  <div className="skill-list-item">
                    <div className="skill-name">
                      <span>Oracle SQL &amp; Query Tuning</span>
                      <span className="skill-proficiency">Advanced</span>
                    </div>
                    <div className="skill-bar-bg">
                      <div className="skill-bar-fill" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  <div className="skill-list-item">
                    <div className="skill-name">
                      <span>ELK Stack Log Diagnostics</span>
                      <span className="skill-proficiency">Advanced</span>
                    </div>
                    <div className="skill-bar-bg">
                      <div className="skill-bar-fill" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  <div className="skill-list-item">
                    <div className="skill-name">
                      <span>PostgreSQL / Relational DBs</span>
                      <span className="skill-proficiency">Advanced</span>
                    </div>
                    <div className="skill-bar-bg">
                      <div className="skill-bar-fill" style={{ width: '80%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Skill Group 6: Delivery, RCA & Testing */}
              <div className="skill-card reveal-up" style={{ transitionDelay: '0.2s' }}>
                <div className="skill-card-header">
                  <div className="skill-card-icon" aria-hidden="true">
                    <svg
                      width="20"
                      height="20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751A11.956 11.956 0 0112 2.714z"
                      />
                    </svg>
                  </div>
                  <h3>Delivery, RCA &amp; Testing</h3>
                </div>
                <div className="skill-list">
                  <div className="skill-list-item">
                    <div className="skill-name">
                      <span>Root Cause Analysis (RCA)</span>
                      <span className="skill-proficiency">Expert</span>
                    </div>
                    <div className="skill-bar-bg">
                      <div className="skill-bar-fill" style={{ width: '90%' }}></div>
                    </div>
                  </div>
                  <div className="skill-list-item">
                    <div className="skill-name">
                      <span>QA Verification Coordination</span>
                      <span className="skill-proficiency">Advanced</span>
                    </div>
                    <div className="skill-bar-bg">
                      <div className="skill-bar-fill" style={{ width: '80%' }}></div>
                    </div>
                  </div>
                  <div className="skill-list-item">
                    <div className="skill-name">
                      <span>Jira Ticketing &amp; Releases</span>
                      <span className="skill-proficiency">Advanced</span>
                    </div>
                    <div className="skill-bar-bg">
                      <div className="skill-bar-fill" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Certifications Roadmap Section */}
        <section id="certifications" className="section muted">
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '50px' }} className="reveal-up">
              <span className="eyebrow">Learning Roadmap</span>
              <h2>Certifications &amp; Credentials</h2>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
                A dashboard tracking completed certifications and targets for specialized backend
                and cloud development validation.
              </p>
            </div>

            <div className="certifications-grid">
              {certifications.map((cert, index) => (
                <div
                  key={cert.id || index}
                  className="cert-card reveal-up"
                  style={{ transitionDelay: `${(index % 3) * 0.1}s` }}
                >
                  <div className="cert-badge-placeholder" aria-label={`${cert.title} Badge slot`}>
                    <img
                      src={getImageUrl(cert.badge, '/assets/cert-aws.svg')}
                      alt={cert.title}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  </div>
                  <div className="cert-info">
                    <h3>{cert.title}</h3>
                    {cert.description && <p>{cert.description}</p>}
                    <span className={`cert-status ${cert.status === 'pending' ? 'pending' : ''}`}>
                      {cert.status === 'pending' ? 'In Progress' : 'Completed'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Resume Section */}
        <section id="resume" className="section">
          <div className="container resume-grid">
            <div
              className="resume-preview-wrapper reveal-up"
              aria-label="Miniature representation of Muni Prasad K Resume"
            >
              <div className="resume-preview-container">
                <img
                  src="/assets/resume-preview.svg"
                  alt="Muni Prasad K Resume PDF Preview Placeholder"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
            </div>

            <div className="resume-content reveal-up" style={{ transitionDelay: '0.2s' }}>
              <span className="eyebrow">Credential Document</span>
              <h2>Review My Complete Career Background</h2>
              <p>
                Get a comprehensive view of my technical competencies, full list of client
                consulting projects, roles across software agencies, and educational highlights.
              </p>
              <div className="resume-list">
                <div className="resume-list-item">
                  <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>10+ Years of detailed experience timelines</span>
                </div>
                <div className="resume-list-item">
                  <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Detailed listing of tools, versions, and frameworks</span>
                </div>
                <div className="resume-list-item">
                  <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Formatted for quick applicant tracking system (ATS) validation</span>
                </div>
              </div>
              <div>
                <a
                  className="btn btn-primary"
                  href="/assets/Muni-Prasad-Resume.pdf"
                  download="Muni-Prasad-Resume.pdf"
                >
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                    />
                  </svg>
                  <span>Download PDF Resume</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="section muted">
          <div className="container contact-container">
            <div className="contact-card reveal-up">
              <div className="contact-header">
                <span className="eyebrow">Connect With Me</span>
                <h2>Let's Discuss Enterprise Systems Integration</h2>
                <p>
                  I am open to senior development, technical consulting, integration engineering, and
                  cloud deployment roles. Get in touch to discuss commerce engineering, production
                  debugging, or integration setups.
                </p>
              </div>

              <div className="contact-methods">
                {/* Email */}
                <div className="contact-method-card">
                  <div className="contact-icon-wrapper">
                    <svg
                      width="20"
                      height="20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0l-7.5-4.615m19.5 0v-2.24a2.25 2.25 0 00-2.25-2.25H3.75m16.5 0V6.75"
                      />
                    </svg>
                  </div>
                  <h3>Email</h3>
                  <p>prasad.krish95@gmail.com</p>
                  <div className="method-btn" id="copy-email-btn" onClick={handleCopyEmail}>
                    Copy Address
                  </div>
                </div>

                {/* LinkedIn */}
                <div className="contact-method-card">
                  <div className="contact-icon-wrapper">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  </div>
                  <h3>LinkedIn</h3>
                  <p>Professional Profile</p>
                  <a
                    href="https://www.linkedin.com/in/muni-prasad-k-7600bb105/"
                    className="method-btn"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visit Profile →
                  </a>
                </div>

                {/* GitHub */}
                <div className="contact-method-card">
                  <div className="contact-icon-wrapper">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  </div>
                  <h3>GitHub</h3>
                  <p>Repositories &amp; Gists</p>
                  <a
                    href="https://github.com/MuniPrasad123"
                    className="method-btn"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visit Repository →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Section */}
      <footer className="footer">
        <div className="container footer-content">
          <div className="footer-nav" aria-label="Footer Quick Links">
            <a href="#about">About</a>
            <a href="#experience">Experience</a>
            <a href="#projects">Projects</a>
            <a href="#skills">Skills</a>
            <a href="#certifications">Certifications</a>
            <a href="#resume">Resume</a>
          </div>
          <p>
            &copy; {new Date().getFullYear()} Muni Prasad K. All Rights Reserved. Built with Next.js, Payload CMS, SQLite, and vanilla CSS.
          </p>
        </div>
      </footer>

      {/* Toast Copy Notification */}
      <div className={`toast-msg ${showToast ? 'show' : ''}`} id="toast-message" role="alert" aria-live="polite">
        Email copied to clipboard!
      </div>
    </>
  )
}

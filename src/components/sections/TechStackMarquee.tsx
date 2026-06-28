'use client'

import React from 'react'

const row1 = [
  { name: 'Java / J2EE', color: '#f89820' },
  { name: 'Oracle ATG Commerce', color: '#ff0000' },
  { name: 'Spring Boot', color: '#6db33f' },
  { name: 'Microservices', color: '#10b981' },
  { name: 'Amazon Web Services (AWS)', color: '#ff9900' },
  { name: 'Docker Containers', color: '#2496ed' },
  { name: 'Kubernetes Orchestration', color: '#326ce5' },
  { name: 'Oracle Database / SQL', color: '#f80000' },
  { name: 'PostgreSQL', color: '#336791' },
  { name: 'KIBO Commerce', color: '#ff5c35' },
]

const row2 = [
  { name: 'React.js Engine', color: '#61dafb' },
  { name: 'Salesforce CRM Integration', color: '#00a1e0' },
  { name: 'APIGEE Gateway', color: '#10a54a' },
  { name: 'Jenkins CI/CD', color: '#d24939' },
  { name: 'ELK Stack Monitoring', color: '#005571' },
  { name: 'Server-side GTM / CAPI', color: '#4285f4' },
  { name: 'Figma Prototyping', color: '#f24e1e' },
  { name: 'GitHub Enterprise', color: '#181717' },
  { name: 'Jira Agile Workspace', color: '#0052cc' },
  { name: 'REST APIs / JSON', color: '#000000' },
]

export function TechStackMarquee() {
  return (
    <section className="py-16 border-t border-b border-white/[0.04] bg-white/[0.01] overflow-hidden" id="tech-marquee">
      <div className="w-full max-w-7xl mx-auto px-6 mb-8 text-center md:text-left">
        <span className="section__eyebrow">Skills at a Glance</span>
        <h2 className="section__title">
          Moving <strong>Tech Stack</strong>
        </h2>
      </div>

      <div className="flex flex-col gap-6 w-full">
        {/* Row 1: Scrolling Left */}
        <div className="marquee-container w-full">
          <div className="marquee-content">
            {row1.map((item, idx) => (
              <div key={idx} className="tech-marquee-item">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span>{item.name}</span>
              </div>
            ))}
            {/* Duplicate for infinite loop */}
            {row1.map((item, idx) => (
              <div key={`dup-${idx}`} className="tech-marquee-item">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span>{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Row 2: Scrolling Right */}
        <div className="marquee-container w-full">
          <div className="marquee-content reverse">
            {row2.map((item, idx) => (
              <div key={idx} className="tech-marquee-item">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span>{item.name}</span>
              </div>
            ))}
            {/* Duplicate for infinite loop */}
            {row2.map((item, idx) => (
              <div key={`dup-${idx}`} className="tech-marquee-item">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span>{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

'use client'

import React from 'react'
import { skillCategories } from '@/data/profile'

const row1 = skillCategories.slice(0, 4).flatMap(category => category.skills).map(name => ({ name, color: '#bba5ea' }))
const row2 = skillCategories.slice(4).flatMap(category => category.skills).map(name => ({ name, color: '#a7d9c5' }))

export function TechStackMarquee() {
  return (
    <section className="py-16 border-t border-b border-white/[0.04] bg-white/[0.01] overflow-hidden" id="tech-marquee">
      <div className="w-full max-w-7xl mx-auto px-6 mb-8 text-center md:text-left">
        <span className="section__eyebrow">Skills at a Glance</span>
        <h2 className="section__title">
          Engineering <strong>Toolkit</strong>
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
              <div key={`dup-${idx}`} aria-hidden="true" className="tech-marquee-item">
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
              <div key={`dup-${idx}`} aria-hidden="true" className="tech-marquee-item">
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

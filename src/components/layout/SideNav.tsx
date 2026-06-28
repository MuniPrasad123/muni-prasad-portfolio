'use client'

import React from 'react'

export function SideNav() {
  return (
    <aside className="side-nav" aria-label="Side navigation">
      <div className="side-nav__text">
        <span>ENTERPRISE COMMERCE</span>
        <span>TECHNICAL CONSULTANT</span>
        <a href="#projects" className="hover:text-primary transition-colors">EXPLORE WORK →</a>
      </div>
    </aside>
  )
}

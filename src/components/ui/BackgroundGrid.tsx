'use client'

import React from 'react'

export function BackgroundGrid() {
  return (
    <div className="bg-grid" aria-hidden="true">
      {/* Premium Glassmorphic / Gradient Background Orbs */}
      <div className="bg-grid__orb-1 animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="bg-grid__orb-2 animate-pulse" style={{ animationDuration: '12s' }} />
      <div className="bg-grid__orb-3 animate-pulse" style={{ animationDuration: '10s' }} />
      
      {/* Dot Grid pattern */}
      <div className="bg-grid__dots" />
      
      {/* Subtle bottom fade */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-transparent pointer-events-none" />
    </div>
  )
}

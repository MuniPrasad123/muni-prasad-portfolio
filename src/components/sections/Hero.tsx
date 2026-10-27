'use client'

import { profile } from '@/data/profile'

export function Hero() {
  return <section id="home" className="studio-hero">
    <div className="studio-hero__layout">
      <div className="studio-copy">
        <span className="studio-eyebrow">Enterprise commerce · Cloud · Generative AI</span>
        <p className="studio-name">{profile.name}</p>
        <h1>Built for the<br />complexity<br /><em>of commerce.</em></h1>
        <h2>{profile.headline}</h2>
        <p className="studio-intro">{profile.summary}</p>
        <div className="studio-actions">
          <a href="#projects" className="studio-primary">Explore selected work ↗</a>
          <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>
        </div>
      </div>
      <div className="studio-system" role="img" aria-label="Enterprise commerce architecture: storefront, Java and Oracle ATG core, payments and cloud services connected by animated data flows.">
        <svg viewBox="0 0 600 570" aria-hidden="true" className="studio-system__svg">
          <defs><radialGradient id="studio-glow"><stop stopColor="#9174c6" stopOpacity=".3" /><stop offset="1" stopColor="#9174c6" stopOpacity="0" /></radialGradient></defs>
          <circle cx="300" cy="285" r="280" fill="url(#studio-glow)" />
          <g className="studio-orbit"><ellipse cx="300" cy="285" rx="265" ry="126" fill="none" stroke="#716084" strokeOpacity=".5" /><ellipse cx="300" cy="285" rx="220" ry="180" fill="none" stroke="#716084" strokeOpacity=".3" /><circle cx="565" cy="285" r="5" fill="#d0b7ff" /></g>
          <g stroke="#76618d" strokeWidth="1"><path id="studio-flow-a" d="M110 130L300 285" /><path id="studio-flow-b" d="M500 175L300 285" /><path id="studio-flow-c" d="M300 285L110 440" /><path id="studio-flow-d" d="M300 285L500 400" /></g>
          {['a', 'b', 'c', 'd'].map((id, i) => <circle key={id} r="3.5" fill="#ace4cc" className="studio-packet"><animateMotion dur={`${3 + i * 0.4}s`} repeatCount="indefinite"><mpath href={`#studio-flow-${id}`} /></animateMotion></circle>)}
          <rect x="210" y="210" width="180" height="150" rx="28" fill="#171724" stroke="#74618b" />
          <text x="300" y="290" textAnchor="middle" fill="#d5c3fa" fontSize="62" fontFamily="monospace">{'{ }'}</text>
          <text x="300" y="330" textAnchor="middle" fill="#b8accd" fontSize="12" fontFamily="monospace">COMMERCE CORE</text>
          {[
            { label: 'STOREFRONT', x: 30, y: 108 }, { label: 'PAYMENTS', x: 420, y: 153 },
            { label: 'JAVA / ATG', x: 30, y: 418 }, { label: 'AWS / GCP / OCI', x: 420, y: 378 },
          ].map(({ label, x, y }) => <g key={label}><rect x={x} y={y} width="160" height="44" rx="11" fill="#151520" stroke="#554663" /><text x={x + 80} y={y + 27} textAnchor="middle" fill="#d0c7de" fontSize="12" fontFamily="monospace">{label}</text></g>)}
        </svg>
        <span className="studio-system__caption">Connected systems. Considered engineering.</span>
      </div>
    </div>
  </section>
}

'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { portfolioProjects } from '@/data/site'
import { ArchitectureDiagram } from './ProjectDetails'

const categories = [
  { value: 'All', label: 'All' },
  { value: 'Professional contribution', label: 'Professional work' },
  { value: 'Independent application', label: 'Independent apps' },
  { value: 'Technical blueprint', label: 'Technical blueprints' },
]

export function ProjectGallery() {
  const [category, setCategory] = useState('All')
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => {
    const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
    return portfolioProjects.filter(project => {
      const matchesCategory = category === 'All' || project.context === category
      const text = [project.title, project.problemStatement, project.category, project.context, ...project.stack].join(' ').toLowerCase()
      return matchesCategory && terms.every(term => text.includes(term))
    })
  }, [category, query])
  const selected = categories.find(item => item.value === category)!
  function reset() { setCategory('All'); setQuery('') }

  return <>
    <div className="portfolio-controls">
      <div className="filter-bar" role="group" aria-label="Filter projects by type">
        {categories.map(item => {
          const count = portfolioProjects.filter(project => item.value === 'All' || project.context === item.value).length
          return <button type="button" className="filter-chip" key={item.value} aria-label={item.label} aria-pressed={category === item.value} aria-controls="project-results" onClick={() => setCategory(item.value)}>{item.label} <span className="filter-count" aria-hidden="true">{count}</span></button>
        })}
      </div>
      <label className="sr-only" htmlFor="project-search">Search projects</label>
      <input id="project-search" className="search-field" type="search" placeholder="Search work and technologies" value={query} onChange={event => setQuery(event.target.value)}/>
    </div>
    <div className="filter-feedback">
      <p role="status" aria-live="polite" aria-atomic="true">{filtered.length} {filtered.length === 1 ? 'project' : 'projects'} · {selected.label}{query.trim() ? ` · Search: “${query.trim()}”` : ''}</p>
      {(category !== 'All' || query) && <button type="button" onClick={reset}>Clear filters</button>}
    </div>
    <div id="project-results">
      {filtered.length ? <div className="project-grid">{filtered.map(project => <Link key={project.slug} href={`/portfolio/${project.slug}`} className="case-card">
        <div className="case-card-art"><ArchitectureDiagram type={project.diagram} compact/></div>
        <div className="case-card-body">
          <div className="project-meta"><span>{project.category}</span><span>{project.context}</span></div>
          <h2>{project.title}</h2><p>{project.problemStatement}</p>
          <div className="tag-list">{project.stack.slice(0,5).map(tech => <span className="tag" key={tech}>{tech}</span>)}</div>
          {project.outcome && <div className="case-card-outcome">{project.outcome}</div>}
          <span className="project-link">Read project detail <span aria-hidden="true">↗</span></span>
        </div>
      </Link>)}</div> : <div className="empty-state"><p>No projects match these filters. Try another technology or reset the selection.</p><button className="button button-outline" type="button" onClick={reset}>Show all projects</button></div>}
    </div>
  </>
}


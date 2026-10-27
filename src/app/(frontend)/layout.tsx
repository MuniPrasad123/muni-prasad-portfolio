import './globals.css'
import './portfolio.css'
import './hero-refinement.css'
import './blog.css'
import 'highlight.js/styles/github-dark.css'
import { articleSummaries } from '@/lib/blog'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { SiteShell } from '@/components/site/SiteShell'
import { StudioControls } from '@/components/sections/StudioControls'
import { profile } from '@/data/profile'

const person = {
  '@context': 'https://schema.org', '@type': 'Person', name: profile.name,
  jobTitle: 'Senior Software Engineer', description: profile.headline,
  url: 'https://www.muniprasad.in', image: 'https://www.muniprasad.in/media/muni-profile.png.jpg',
  sameAs: [profile.linkedin, profile.github],
  homeLocation: { '@type': 'Place', name: profile.location },
  knowsAbout: ['Java', 'Spring Boot', 'Microservices', 'Oracle ATG Commerce', 'Enterprise integration', 'React.js', 'AWS cloud services'],
}

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export default function FrontendLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={plusJakartaSans.className}><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(person).replace(/</g, '\\u003c') }} /><SiteShell articles={articleSummaries()}>{children}</SiteShell><StudioControls /></body>
    </html>
  )
}

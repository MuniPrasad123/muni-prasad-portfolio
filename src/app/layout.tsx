import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Muni Prasad K | Senior Software Engineer & Technical Consultant',
  description:
    'Portfolio of Muni Prasad K, Senior Software Engineer and Technical Consultant with 10+ years of experience in Enterprise E-Commerce, Oracle ATG Commerce, Java, Spring Boot, AWS, React, and Salesforce integrations.',
  keywords: [
    'Senior Software Engineer',
    'Technical Consultant',
    'Oracle ATG Developer',
    'Enterprise E-Commerce Engineer',
    'Java Spring Boot Developer',
    'React AWS Developer',
    'Salesforce Integration Engineer',
    'ATG Commerce Specialist',
    'Spring Boot Microservices Architect'
  ],
  authors: [{ name: 'Muni Prasad K' }],
  openGraph: {
    title: 'Muni Prasad K | Senior Software Engineer & Technical Consultant',
    description: 'Portfolio of Muni Prasad K. 10+ years of experience in Enterprise E-Commerce, Oracle ATG Commerce, Java, Spring Boot, AWS, React, and Salesforce.',
    url: 'https://www.muniprasad.in/',
    siteName: 'Muni Prasad Portfolio',
    type: 'website',
    images: [
      {
        url: 'https://www.muniprasad.in/assets/profile-photo.svg',
        width: 800,
        height: 800,
        alt: 'Muni Prasad K Profile Photo',
      }
    ]
  },
  alternates: {
    canonical: 'https://www.muniprasad.in/',
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}

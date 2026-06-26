import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Muni Prasad K | Senior Software Engineer & Technical Consultant',
  description:
    'Portfolio of Muni Prasad K, Senior Software Engineer and Technical Consultant with 10+ years of experience in Enterprise E-Commerce, Oracle ATG Commerce, Java, Spring Boot, AWS, React, and Salesforce integrations.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}

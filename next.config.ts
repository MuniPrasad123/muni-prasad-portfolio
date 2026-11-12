import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async redirects() {
    return [{
      source: '/portfolio/cloud-devops-portfolio',
      destination: '/portfolio/oracle-atg-modernization',
      permanent: true,
    }]
  },
  outputFileTracingIncludes: { '/*': ['./content/lessons/**/*.md'] },
}

export default withPayload(nextConfig)

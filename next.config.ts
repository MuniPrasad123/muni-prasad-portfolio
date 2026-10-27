import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  outputFileTracingIncludes: { '/*': ['./content/lessons/**/*.md'] },
}

export default withPayload(nextConfig)

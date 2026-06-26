import { NotFoundPage, generatePageMetadata } from '@payloadcms/next/views'
import { importMap } from '../importMap.js'
import config from '@payload-config'

type PageProps = {
  params: Promise<{ segments?: string[] }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export const generateMetadata = ({ params, searchParams }: PageProps) =>
  generatePageMetadata({ config, params, searchParams: searchParams as Promise<{ [key: string]: string | string[] }> })

export default async function NotFound({ params, searchParams }: PageProps) {
  return <NotFoundPage config={config} importMap={importMap} params={params} searchParams={searchParams as Promise<{ [key: string]: string | string[] }>} />
}

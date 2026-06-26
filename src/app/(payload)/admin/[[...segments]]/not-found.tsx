/* eslint-disable @typescript-eslint/no-explicit-any */
import { NotFoundPage, generatePageMetadata } from '@payloadcms/next/views'
import { importMap } from '../importMap.js'
import config from '@payload-config'

type PageProps = {
  params: Promise<{ segments?: string[] }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export const generateMetadata = ({ params, searchParams }: PageProps) =>
  generatePageMetadata({ config, params: params as any, searchParams: searchParams as any })

export default async function NotFound({ params, searchParams }: PageProps) {
  return <NotFoundPage config={config} importMap={importMap} params={params as any} searchParams={searchParams as any} />
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import { RootPage, generatePageMetadata } from '@payloadcms/next/views'
import { importMap } from '../importMap.js'
import config from '@payload-config'

type PageProps = {
  params: Promise<{ segments?: string[] }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export const generateMetadata = ({ params, searchParams }: PageProps) =>
  generatePageMetadata({ config, params: params as any, searchParams: searchParams as any })

export default async function Page({ params, searchParams }: PageProps) {
  return <RootPage config={config} importMap={importMap} params={params as any} searchParams={searchParams as any} />
}

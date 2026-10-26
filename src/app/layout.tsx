import type { Metadata } from 'next'
import { profile } from '@/data/profile'
const siteUrl=process.env.NEXT_PUBLIC_SITE_URL||'https://www.muniprasad.in'
const title=`Muni Prasad K | ${profile.headline}`
export const metadata:Metadata={
  metadataBase:new URL(siteUrl),
  title,
  description:profile.summary,
  authors:[{name:profile.name}],
  openGraph:{title,description:profile.summary,siteName:'Muni Prasad — Software Engineering',type:'website',images:[{url:'/media/muni-profile.png.jpg',alt:'Muni Prasad K, Senior Software Engineer'}]},
  twitter:{card:'summary',title,description:profile.summary,images:['/media/muni-profile.png.jpg']},
}
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return children}

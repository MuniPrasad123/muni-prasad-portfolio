import './globals.css'
import { Plus_Jakarta_Sans } from 'next/font/google'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
})

export default function FrontendLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={plusJakartaSans.className}>{children}</body>
    </html>
  )
}

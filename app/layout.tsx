import type { Metadata } from 'next'
import './globals.css'
import { SessionProvider } from '@/components/SessionProvider'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'Eggbator - Professional Egg Incubator Solutions',
  description: 'Complete egg incubator inventory and order management system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <Navbar />
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}

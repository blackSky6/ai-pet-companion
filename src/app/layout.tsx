import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PawPal — Your AI Pet Companion',
  description: 'Adopt an AI pet with real personality and memory. It remembers you.',
  openGraph: {
    title: 'PawPal — Your AI Pet Companion',
    description: 'Adopt an AI pet with real personality and memory. It remembers you.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen" style={{
          background: 'linear-gradient(180deg, #fff7f2 0%, #ffe8f3 50%, #f4efff 100%)'
        }}>
          {children}
        </div>
      </body>
    </html>
  )
}

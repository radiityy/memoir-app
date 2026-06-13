import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import localFont from 'next/font/local'
import './globals.css'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
})

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
})

export const metadata: Metadata = {
  title: {
    default: 'Memoir',
    template: '%s · Memoir',
  },
  description:
    'A quiet place to save photos, notes, moods, and little pieces of your everyday life.',
  applicationName: 'Memoir',
  keywords: ['Memoir', 'memory journal', 'photo diary', 'personal journal'],
  authors: [{ name: 'Memoir' }],
  creator: 'Memoir',
  publisher: 'Memoir',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    title: 'Memoir',
    description:
      'Keep the small moments before they fade.',
    siteName: 'Memoir',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Memoir',
    description:
      'Keep the small moments before they fade.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}
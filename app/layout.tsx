import './global.css'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import { StatusProvider } from 'lib/status-context'
import { UpdateStatusProvider } from 'lib/update-status-context'
import type { Metadata } from 'next'
import type { Viewport } from 'next'
import type React from 'react'
import AnimatedFooter from './components/animated-footer'
import AnimatedHeader from './components/animated-header'
import { MotionProvider } from './components/motion-provider'
import Nav from './components/nav'
import Footer from './footer'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  metadataBase: new URL('https://buycoffee.top'),
  title: {
    default: 'Hamster1963',
    template: '%s | Hamster1963',
  },
  description: 'Developer, writer, and creator.',
  openGraph: {
    title: 'Hamster1963',
    description: 'Developer, writer, and creator.',
    url: 'https://buycoffee.top',
    siteName: 'Hamster1963',
    locale: 'zh_CN',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  twitter: {
    title: 'Hamster1963',
    card: 'summary_large_image',
  },
  alternates: {
    canonical: 'https://buycoffee.top',
    types: {
      'application/rss+xml': [{ url: 'rss', title: 'RSS 订阅' }],
    },
  },
}

const cx = (...classes: string[]) => classes.filter(Boolean).join(' ')

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={cx(
        'bg-white text-black dark:bg-[#111010] dark:text-white',
        GeistSans.variable,
        GeistMono.variable
      )}
    >
      <body className="relative mx-4 flex max-w-2xl flex-col pt-12 pb-12 antialiased sm:mx-auto md:flex-row">
        <MotionProvider>
            <StatusProvider>
              <UpdateStatusProvider>
                <main className="flex min-w-0 flex-auto flex-col px-2 pt-8 md:px-0">
                  {children}
                  <Nav />
                  <Footer/>
                  <AnimatedHeader />
                  <AnimatedFooter />
                </main>
              </UpdateStatusProvider>
            </StatusProvider>
        </MotionProvider>
      </body>
    </html>
  )
}

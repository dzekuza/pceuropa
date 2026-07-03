import type { Metadata } from 'next'
import Script from "next/script";
import { Geist, Geist_Mono } from 'next/font/google'
import { Plus_Jakarta_Sans, Montserrat } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-jakarta',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

const montserrat = Montserrat({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-montserrat',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'PC EUROPA',
  description: 'Nuomos valdymo sistema',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="lt" suppressHydrationWarning>
      <head>
        {/* react-grab element inspector — dev only, and opt-in via env flag so its
            noisy "useInsertionEffect must not schedule updates" console warnings
            stay off by default. Enable with NEXT_PUBLIC_ENABLE_REACT_GRAB=true. */}
        {process.env.NODE_ENV === "development" &&
          process.env.NEXT_PUBLIC_ENABLE_REACT_GRAB === "true" && (
          <Script
            src="//unpkg.com/react-grab/dist/index.global.js"
            crossOrigin="anonymous"
            strategy="beforeInteractive"
          />
        )}
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${jakarta.variable} ${montserrat.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

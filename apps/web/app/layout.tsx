import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { PrivyProviderShell } from '../components/privy-provider'
import { ThemeProvider } from '../components/theme-provider'
import { SiteNav } from '../components/site-nav'
import type { ReactElement, ReactNode } from 'react'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Konfide — Cross-border B2B payments, settled in seconds',
  description:
    'A B2B payment rail for emerging-market trade corridors. Buyers pay from any chain. Sellers settle on Solana.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>): ReactElement {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider>
          <PrivyProviderShell>
            <SiteNav />
            {children}
          </PrivyProviderShell>
        </ThemeProvider>
      </body>
    </html>
  )
}

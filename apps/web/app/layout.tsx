/**
 * Root layout for the Konfide web app.
 *
 * Wires up the Inter font and the global Tailwind stylesheet. Auth/Privy
 * provider wrapping happens in `components/privy-provider.tsx` (stubbed).
 */
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import type { ReactElement, ReactNode } from 'react'
import { PrivyProviderShell } from '../components/privy-provider'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Konfide',
  description: 'Confidential B2B cross-border payments on Solana.',
}

export default function RootLayout({ children }: { children: ReactNode }): ReactElement {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <PrivyProviderShell>{children}</PrivyProviderShell>
      </body>
    </html>
  )
}

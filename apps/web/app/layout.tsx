import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PrivyProviderShell } from '../components/privy-provider'
import type { ReactElement, ReactNode } from 'react'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Konfide',
  description: 'Confidential B2B cross-border payments on Solana.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>): ReactElement {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <PrivyProviderShell>
          {children}
        </PrivyProviderShell>
      </body>
    </html>
  );
}

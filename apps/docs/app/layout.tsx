/**
 * Root layout for the Konfide docs site (Nextra 4 + App Router).
 *
 * The Nextra theme is wired here rather than via `next.config.ts`. The
 * `Layout` component owns the page chrome (sidebar, breadcrumbs, search);
 * the route at `app/[[...mdxPath]]/page.tsx` resolves and renders the
 * actual MDX content.
 */
import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import type { Metadata } from 'next'
import type { ReactElement, ReactNode } from 'react'
import 'nextra-theme-docs/style.css'

export const metadata: Metadata = {
  title: {
    default: 'Konfide',
    template: '%s — Konfide',
  },
  description: 'Confidential B2B cross-border payments on Solana.',
}

const navbar = (
  <Navbar
    logo={<span style={{ fontWeight: 600 }}>Konfide</span>}
    projectLink="https://github.com/konfide-protocol/konfide"
  />
)

const footer = <Footer>MIT 2026 © Konfide.</Footer>

export default async function RootLayout({
  children,
}: {
  children: ReactNode
}): Promise<ReactElement> {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head />
      <body>
        <Layout
          navbar={navbar}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/konfide-protocol/konfide/tree/main/apps/docs"
          footer={footer}
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}

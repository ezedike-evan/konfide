/**
 * Next.js + Nextra 4 configuration for the Konfide docs site.
 *
 * In Nextra 4 the theme is wired via `app/layout.tsx`, not via
 * `next.config.ts`. This file only configures the Nextra plugin's
 * options and the underlying Next.js config.
 */
import nextra from 'nextra'

const withNextra = nextra({
  // Search defaults to enabled. Add mdxOptions / latex / etc. here as needed.
})

export default withNextra({
  reactStrictMode: true,
})

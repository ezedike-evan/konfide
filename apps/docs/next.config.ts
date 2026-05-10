/**
 * Next.js + Nextra configuration for the Konfide docs site.
 */
import nextra from 'nextra'

const withNextra = nextra({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
})

export default withNextra({
  reactStrictMode: true,
})

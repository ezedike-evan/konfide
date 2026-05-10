/**
 * Next.js configuration for the Konfide web app.
 *
 * Transpiles workspace packages so we can ship raw TS source without each
 * package shipping its own bundle.
 */
import type { NextConfig } from 'next'

const config: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@konfide/core',
    '@konfide/types',
    '@konfide/ui',
    '@konfide/adapter-privy',
  ],
}

export default config

/**
 * Nextra theme configuration.
 */
import type { DocsThemeConfig } from 'nextra-theme-docs'

const config: DocsThemeConfig = {
  logo: <span style={{ fontWeight: 600 }}>Konfide</span>,
  project: {
    link: 'https://github.com/konfide-protocol/konfide',
  },
  docsRepositoryBase: 'https://github.com/konfide-protocol/konfide/tree/main/apps/docs',
  footer: {
    content: 'Konfide — confidential B2B cross-border payments on Solana.',
  },
}

export default config

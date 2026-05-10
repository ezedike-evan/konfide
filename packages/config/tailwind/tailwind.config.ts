/**
 * Shared Tailwind CSS configuration for Konfide apps and the UI package.
 *
 * Apps and packages should extend this base by spreading it inside their own
 * `tailwind.config.ts` so the design tokens stay in lockstep across surfaces.
 */
import type { Config } from 'tailwindcss'

const config = {
  darkMode: 'class',
  content: [],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        background: 'hsl(var(--background) / <alpha-value>)',
        foreground: 'hsl(var(--foreground) / <alpha-value>)',
        muted: 'hsl(var(--muted) / <alpha-value>)',
        accent: 'hsl(var(--accent) / <alpha-value>)',
        border: 'hsl(var(--border) / <alpha-value>)',
      },
    },
  },
  plugins: [],
} satisfies Config

export default config

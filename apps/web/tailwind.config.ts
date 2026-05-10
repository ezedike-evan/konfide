/**
 * App-level Tailwind configuration. Extends the shared Konfide theme and
 * scopes content scanning to this app + the shared UI package.
 */
import sharedConfig from '@konfide/config-tailwind/tailwind.config'
import type { Config } from 'tailwindcss'

const config: Config = {
  ...sharedConfig,
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
}

export default config

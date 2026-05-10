/**
 * `<PrivyProviderShell />` — placeholder wrapper for the Privy auth provider.
 *
 * Stub: just renders its children. The real provider will be configured with
 * `PRIVY_APP_ID` once auth is wired up.
 */
'use client'

import type { ReactElement, ReactNode } from 'react'

export function PrivyProviderShell({ children }: { children: ReactNode }): ReactElement {
  return <>{children}</>
}

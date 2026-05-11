'use client'

import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState, type ReactElement } from 'react'

const ORDER = ['light', 'dark', 'system'] as const
type ThemeKey = (typeof ORDER)[number]

export function ThemeToggle(): ReactElement {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  function cycle(): void {
    const current = (theme as ThemeKey) ?? 'system'
    const idx = ORDER.indexOf(current)
    const next = ORDER[(idx + 1) % ORDER.length]
    setTheme(next)
  }

  const current = mounted ? ((theme as ThemeKey) ?? 'system') : 'system'
  const label =
    current === 'light' ? 'Light theme' : current === 'dark' ? 'Dark theme' : 'System theme'

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`Switch theme. Current: ${label}`}
      title={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-foreground/70 transition hover:text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      <span className="sr-only">{label}</span>
      {/* Render an empty icon-sized placeholder until mounted to avoid hydration mismatch */}
      {!mounted ? (
        <span className="h-4 w-4" />
      ) : current === 'light' ? (
        <Sun className="h-4 w-4" strokeWidth={1.75} />
      ) : current === 'dark' ? (
        <Moon className="h-4 w-4" strokeWidth={1.75} />
      ) : (
        <Monitor className="h-4 w-4" strokeWidth={1.75} />
      )}
    </button>
  )
}

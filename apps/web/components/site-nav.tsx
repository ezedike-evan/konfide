'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { useEffect, useState, type ReactElement } from 'react'
import { ThemeToggle } from './theme-toggle'

interface NavLink {
  readonly label: string
  readonly href: string
}

const LINKS: readonly NavLink[] = [
  { label: 'Create', href: '/invoices/new' },
  { label: 'Invoices', href: '/invoices' },
]

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function SiteNav(): ReactElement | null {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [open])

  // Hide chrome on the public payer page — that route is a focused checkout.
  if (pathname?.startsWith('/pay/')) return null

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-6">
        <Link
          href="/"
          className="text-sm font-semibold uppercase tracking-[0.22em] text-foreground"
        >
          Konfide
        </Link>

        <nav className="hidden items-center gap-8 sm:flex">
          {LINKS.map((link) => {
            const active = isActive(pathname ?? '', link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative text-sm transition-colors ${
                  active
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {link.label}
                {active ? (
                  <span className="absolute -bottom-[22px] left-0 right-0 h-px bg-foreground" />
                ) : null}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-foreground/70 transition hover:text-foreground hover:bg-muted sm:hidden"
          >
            <Menu className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open ? (
        <div className="fixed inset-0 z-50 sm:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />
          <div className="absolute inset-y-0 right-0 flex w-full max-w-xs flex-col border-l border-border bg-background">
            <div className="flex h-16 items-center justify-between border-b border-border px-6">
              <span className="text-sm font-semibold uppercase tracking-[0.22em]">
                Konfide
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-foreground/70 transition hover:text-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>
            <nav className="flex flex-col gap-1 p-4">
              {LINKS.map((link) => {
                const active = isActive(pathname ?? '', link.href)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-md px-3 py-2.5 text-sm transition-colors ${
                      active
                        ? 'bg-muted text-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      ) : null}
    </header>
  )
}

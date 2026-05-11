/**
 * Issuer dashboard: list of invoices.
 *
 * The API does not yet expose a list endpoint. This page renders an empty
 * state that links into the create flow until that lands.
 */
import Link from 'next/link'
import { ArrowRight, FileText } from 'lucide-react'
import type { ReactElement } from 'react'

export default function InvoicesPage(): ReactElement {
  return (
    <main className="bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
              Dashboard
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Invoices</h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Track every invoice you&apos;ve issued. Open one to share its payer link or check
              the settlement status.
            </p>
          </div>
          <Link
            href="/invoices/new"
            className="group inline-flex items-center justify-center gap-2 self-start rounded-md bg-foreground px-5 py-3 text-sm font-medium text-background transition hover:opacity-90"
          >
            New invoice
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              strokeWidth={1.75}
            />
          </Link>
        </div>

        <div className="mt-12 rounded-lg border border-border bg-card">
          <div className="grid grid-cols-12 gap-4 border-b border-border px-6 py-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            <div className="col-span-4">Invoice</div>
            <div className="col-span-3">Recipient</div>
            <div className="col-span-2 text-right">Amount</div>
            <div className="col-span-3 text-right">Status</div>
          </div>
          <div className="flex flex-col items-center justify-center gap-4 px-6 py-20 text-center">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-muted-foreground">
              <FileText className="h-4 w-4" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">No invoices yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Create your first invoice to generate a payer link.
              </p>
            </div>
            <Link
              href="/invoices/new"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-border px-4 py-2 text-xs font-medium text-foreground transition hover:bg-muted"
            >
              Create invoice
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

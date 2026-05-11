/**
 * Issuer dashboard: list of invoices.
 *
 * Server component — fetches from `GET /invoices` on every request so that
 * a row created moments ago appears at the top without manual refresh.
 */
import Link from 'next/link'
import { ArrowRight, FileText } from 'lucide-react'
import type { ReactElement } from 'react'
import { listInvoices, type InvoiceListItem, type InvoiceStatus } from '../../../lib/api'

export const dynamic = 'force-dynamic'

const USD_FORMATTER = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const STATUS_LABEL: Record<InvoiceStatus, string> = {
  draft: 'Draft',
  issued: 'Issued',
  awaiting_payment: 'Awaiting payment',
  partially_paid: 'Partially paid',
  settled: 'Settled',
  refunded: 'Refunded',
  disputed: 'Disputed',
  voided: 'Voided',
  expired: 'Expired',
}

function statusVariant(status: InvoiceStatus): string {
  switch (status) {
    case 'settled':
      return 'border-foreground text-foreground'
    case 'awaiting_payment':
    case 'partially_paid':
    case 'issued':
      return 'border-border text-foreground'
    default:
      return 'border-border text-muted-foreground'
  }
}

function relativeTime(iso: string, now: number = Date.now()): string {
  const then = new Date(iso).getTime()
  if (!Number.isFinite(then)) return ''
  const diffSeconds = Math.round((then - now) / 1000)
  const abs = Math.abs(diffSeconds)
  const units: { readonly limit: number; readonly div: number; readonly suffix: string }[] = [
    { limit: 60, div: 1, suffix: 's' },
    { limit: 60 * 60, div: 60, suffix: 'm' },
    { limit: 60 * 60 * 24, div: 60 * 60, suffix: 'h' },
    { limit: 60 * 60 * 24 * 30, div: 60 * 60 * 24, suffix: 'd' },
    { limit: 60 * 60 * 24 * 365, div: 60 * 60 * 24 * 30, suffix: 'mo' },
  ]
  const unit = units.find((u) => abs < u.limit) ?? {
    limit: Number.POSITIVE_INFINITY,
    div: 60 * 60 * 24 * 365,
    suffix: 'y',
  }
  const value = Math.max(1, Math.floor(abs / unit.div))
  return diffSeconds < 0 ? `${value}${unit.suffix} ago` : `in ${value}${unit.suffix}`
}

export default async function InvoicesPage(): Promise<ReactElement> {
  let invoices: InvoiceListItem[] = []
  let error: string | null = null
  try {
    invoices = await listInvoices({ cache: 'no-store' })
  } catch (err) {
    error = err instanceof Error ? err.message : 'failed to load invoices'
  }

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

        {error ? (
          <div
            role="alert"
            className="mt-12 rounded-lg border border-border bg-card p-6 text-card-foreground"
          >
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
              Couldn&apos;t load invoices
            </p>
            <p className="mt-2 text-sm text-foreground">{error}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Check that the API is running on{' '}
              <code className="font-mono">{process.env.NEXT_PUBLIC_API_URL}</code>.
            </p>
          </div>
        ) : invoices.length === 0 ? (
          <EmptyState />
        ) : (
          <InvoicesTable invoices={invoices} />
        )}
      </div>
    </main>
  )
}

function EmptyState(): ReactElement {
  return (
    <div className="mt-12 rounded-lg border border-border bg-card">
      <div className="hidden grid-cols-12 gap-4 border-b border-border px-6 py-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground sm:grid">
        <div className="col-span-4">Invoice</div>
        <div className="col-span-3">Buyer</div>
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
  )
}

function InvoicesTable({ invoices }: { invoices: readonly InvoiceListItem[] }): ReactElement {
  const now = Date.now()
  return (
    <div className="mt-12">
      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-lg border border-border bg-card sm:block">
        <div className="grid grid-cols-12 gap-4 border-b border-border px-6 py-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          <div className="col-span-3">Invoice</div>
          <div className="col-span-3">Buyer</div>
          <div className="col-span-2 text-right">Amount</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2 text-right">Created</div>
        </div>
        <ul className="divide-y divide-border">
          {invoices.map((invoice) => (
            <li key={invoice.publicId}>
              <Link
                href={`/invoices/${invoice.publicId}`}
                className="grid grid-cols-12 items-center gap-4 px-6 py-4 text-sm transition hover:bg-muted"
              >
                <span className="col-span-3 truncate font-mono text-xs text-foreground">
                  {invoice.publicId.slice(0, 8)}
                </span>
                <span className="col-span-3 truncate text-muted-foreground">
                  {invoice.recipientHandle ?? '—'}
                </span>
                <span className="col-span-2 text-right font-medium text-foreground">
                  {USD_FORMATTER.format(invoice.fiatAmount)} {invoice.fiatCurrency}
                </span>
                <span className="col-span-2">
                  <StatusPill status={invoice.status} />
                </span>
                <span className="col-span-2 text-right text-xs text-muted-foreground">
                  {relativeTime(invoice.createdAt, now)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Mobile stacked cards */}
      <ul className="space-y-3 sm:hidden">
        {invoices.map((invoice) => (
          <li key={invoice.publicId}>
            <Link
              href={`/invoices/${invoice.publicId}`}
              className="block rounded-lg border border-border bg-card p-5 transition hover:bg-muted"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="font-mono text-xs text-muted-foreground">
                  {invoice.publicId.slice(0, 8)}
                </span>
                <StatusPill status={invoice.status} />
              </div>
              <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                {USD_FORMATTER.format(invoice.fiatAmount)}{' '}
                <span className="text-sm font-medium text-muted-foreground">
                  {invoice.fiatCurrency}
                </span>
              </p>
              <dl className="mt-3 flex justify-between gap-4 text-xs">
                <div>
                  <dt className="uppercase tracking-[0.18em] text-muted-foreground">
                    Buyer
                  </dt>
                  <dd className="mt-0.5 text-foreground">{invoice.recipientHandle ?? '—'}</dd>
                </div>
                <div className="text-right">
                  <dt className="uppercase tracking-[0.18em] text-muted-foreground">Created</dt>
                  <dd className="mt-0.5 text-muted-foreground">
                    {relativeTime(invoice.createdAt, now)}
                  </dd>
                </div>
              </dl>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function StatusPill({ status }: { status: InvoiceStatus }): ReactElement {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] ${statusVariant(status)}`}
    >
      {STATUS_LABEL[status]}
    </span>
  )
}

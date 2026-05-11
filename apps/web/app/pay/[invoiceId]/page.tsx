/**
 * Public payer page.
 *
 * Reader: a buyer with a share link from the seller. Renders invoice
 * details and a "Pay with KIRAPAY" button that takes them to the hosted
 * checkout. Unauthenticated; do not surface internal IDs.
 */
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import type { ReactElement } from 'react'
import { getInvoice } from '../../../lib/api'

export default async function PayInvoicePage({
  params,
}: {
  params: Promise<{ invoiceId: string }>
}): Promise<ReactElement> {
  const { invoiceId } = await params

  const invoice = await getInvoice(invoiceId, { cache: 'no-store' }).catch(() => notFound())

  const isPayable =
    invoice.status === 'awaiting_payment' || invoice.status === 'partially_paid'
  const isSettled = invoice.status === 'settled'

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-md items-center justify-between px-6">
          <Link
            href="/"
            className="text-sm font-semibold uppercase tracking-[0.22em] text-foreground"
          >
            Konfide
          </Link>
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.75} />
            Hosted checkout
          </span>
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <div className="rounded-xl border border-border bg-card p-8 text-card-foreground sm:p-10">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
              You&apos;re paying
            </p>

            <p className="mt-5 text-5xl font-semibold tracking-tight">
              ${invoice.amount.toFixed(2)}{' '}
              <span className="text-xl font-medium text-muted-foreground">
                {invoice.currency}
              </span>
            </p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {invoice.cryptoAmount != null && invoice.cryptoCurrency
                ? `≈ ${invoice.cryptoAmount} ${invoice.cryptoCurrency}`
                : `≈ ${(invoice.amount / 24).toFixed(3)} SOL`}
            </p>

            <div className="mt-8 space-y-4 border-t border-border pt-6 text-sm">
              <Row label="Recipient" value={invoice.merchantDisplayName} />
              {invoice.description ? (
                <Row label="Description" value={invoice.description} />
              ) : null}
              <Row label="Expires" value={new Date(invoice.expiresAt).toLocaleString()} />
            </div>

            <div className="mt-8">
              {isPayable && invoice.checkoutUrl ? (
                <a
                  href={invoice.checkoutUrl}
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-md bg-foreground px-5 py-3.5 text-sm font-medium text-background transition hover:opacity-90"
                >
                  Pay with KIRAPAY
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    strokeWidth={1.75}
                  />
                </a>
              ) : (
                <div className="rounded-md border border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
                  {isSettled
                    ? 'This invoice has been settled.'
                    : 'This invoice is no longer accepting payments.'}
                </div>
              )}
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                You&apos;ll be redirected to KIRAPAY to complete payment from any supported
                chain. The merchant receives settlement on Solana.
              </p>
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Powered by Konfide
          </p>
        </div>
      </div>
    </main>
  )
}

function Row({ label, value }: { label: string; value: string }): ReactElement {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</dt>
      <dd className="max-w-[60%] text-right text-sm text-foreground">{value}</dd>
    </div>
  )
}

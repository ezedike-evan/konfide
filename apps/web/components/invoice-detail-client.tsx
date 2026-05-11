/**
 * `<InvoiceDetailClient />` — client-side polling view of an invoice.
 *
 * Polls every 5s while the invoice is `awaiting_payment` so the seller sees
 * the status flip the moment the webhook fires.
 */
'use client'

import { Check, Copy, ExternalLink } from 'lucide-react'
import { useEffect, useState, type ReactElement } from 'react'
import { type InvoiceDetailResponse, getInvoice } from '../lib/api'

interface Props {
  readonly initial: InvoiceDetailResponse
}

const POLL_INTERVAL_MS = 5_000

type Status = InvoiceDetailResponse['status']

const STATUS_LABEL: Record<Status, string> = {
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

function statusVariant(status: Status): string {
  // Monochrome only — distinguish via border weight and text tone.
  switch (status) {
    case 'settled':
      return 'border-foreground text-foreground'
    case 'awaiting_payment':
    case 'partially_paid':
    case 'issued':
      return 'border-border text-foreground'
    case 'expired':
    case 'voided':
    case 'refunded':
    case 'disputed':
      return 'border-border text-muted-foreground'
    default:
      return 'border-border text-muted-foreground'
  }
}

export function InvoiceDetailClient({ initial }: Props): ReactElement {
  const [invoice, setInvoice] = useState<InvoiceDetailResponse>(initial)
  const [copied, setCopied] = useState(false)
  const [payerUrl, setPayerUrl] = useState<string>(`/pay/${initial.publicId}`)

  useEffect(() => {
    setPayerUrl(`${window.location.origin}/pay/${invoice.publicId}`)
  }, [invoice.publicId])

  useEffect(() => {
    if (invoice.status !== 'awaiting_payment') return
    const handle = window.setInterval(async () => {
      try {
        const next = await getInvoice(invoice.publicId)
        setInvoice(next)
      } catch {
        // swallow — keep polling
      }
    }, POLL_INTERVAL_MS)
    return () => window.clearInterval(handle)
  }, [invoice.publicId, invoice.status])

  const polling = invoice.status === 'awaiting_payment'

  async function copyLink(): Promise<void> {
    try {
      await navigator.clipboard.writeText(payerUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      /* ignore */
    }
  }

  return (
    <article>
      <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
            Invoice
          </p>
          <p className="mt-2 font-mono text-xs text-muted-foreground">{invoice.publicId}</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${statusVariant(invoice.status)}`}
          >
            {polling ? (
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-foreground opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-foreground" />
              </span>
            ) : null}
            {STATUS_LABEL[invoice.status]}
          </span>
        </div>
      </header>

      <section className="mt-10 border-t border-border pt-10">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
          Amount due
        </p>
        <p className="mt-3 text-5xl font-semibold tracking-tight sm:text-6xl">
          ${invoice.amount.toFixed(2)}{' '}
          <span className="text-2xl font-medium text-muted-foreground">{invoice.currency}</span>
        </p>
        {invoice.cryptoAmount != null && invoice.cryptoCurrency ? (
          <p className="mt-2 text-sm text-muted-foreground">
            ≈ {invoice.cryptoAmount} {invoice.cryptoCurrency}
          </p>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">
            ≈ {(invoice.amount / 24).toFixed(3)} SOL
          </p>
        )}
      </section>

      <section className="mt-12">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
          Share this link with your buyer
        </p>
        <div className="mt-3 flex items-stretch gap-2 rounded-md border border-input bg-background">
          <input
            readOnly
            value={payerUrl}
            className="flex-1 truncate bg-transparent px-4 py-3 font-mono text-xs text-foreground focus:outline-none"
            aria-label="Payer URL"
          />
          <button
            type="button"
            onClick={copyLink}
            className="inline-flex items-center gap-1.5 border-l border-border px-4 text-xs font-medium text-foreground transition hover:bg-muted"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" strokeWidth={2} /> Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" strokeWidth={2} /> Copy
              </>
            )}
          </button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          The buyer will be taken to a hosted KIRAPAY checkout.
        </p>
      </section>

      <section className="mt-12 border-t border-border pt-10">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
          Details
        </p>
        <dl className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <DetailRow label="Merchant" value={invoice.merchantDisplayName} />
          <DetailRow label="Description" value={invoice.description ?? '—'} />
          <DetailRow label="Created" value={new Date(invoice.createdAt).toLocaleString()} />
          <DetailRow label="Expires" value={new Date(invoice.expiresAt).toLocaleString()} />
          <DetailRow label="Settlement chain" value="Solana (devnet)" />
          {invoice.settledAt ? (
            <DetailRow label="Settled" value={new Date(invoice.settledAt).toLocaleString()} />
          ) : null}
        </dl>
      </section>

      {invoice.settlement ? (
        <section className="mt-12 rounded-lg border border-foreground/40 bg-card p-6 text-card-foreground">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
            On-chain settlement
          </p>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Tx signature
              </dt>
              <dd className="mt-1 break-all font-mono text-xs">
                <a
                  href={`https://explorer.solana.com/tx/${encodeURIComponent(
                    invoice.settlement.txSignature,
                  )}?cluster=devnet`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 underline decoration-border underline-offset-2 transition hover:decoration-foreground"
                >
                  {invoice.settlement.txSignature}
                  <ExternalLink className="h-3 w-3" strokeWidth={2} />
                </a>
              </dd>
            </div>
            <div className="flex gap-8">
              <div>
                <dt className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Source chain
                </dt>
                <dd className="mt-1 font-mono text-xs">{invoice.settlement.chainId}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Confirmed
                </dt>
                <dd className="mt-1 text-xs">
                  {new Date(invoice.settlement.confirmedAt).toLocaleString()}
                </dd>
              </div>
            </div>
          </dl>
        </section>
      ) : null}
    </article>
  )
}

function DetailRow({ label, value }: { label: string; value: string }): ReactElement {
  return (
    <div>
      <dt className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm text-foreground">{value}</dd>
    </div>
  )
}

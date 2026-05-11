/**
 * `<InvoiceDetailClient />` — client-side polling view of an invoice.
 *
 * Renders status pill, amount, payer link, expiry, and (once settled) the
 * Solana Explorer link for the on-chain settlement TX. Polls every 5s while
 * status is `awaiting_payment`.
 */
'use client'

import { useEffect, useState } from 'react'
import { type InvoiceDetailResponse, getInvoice } from '../lib/api'

interface Props {
  readonly initial: InvoiceDetailResponse
}

const POLL_INTERVAL_MS = 5_000

const STATUS_STYLE: Record<InvoiceDetailResponse['status'], string> = {
  draft: 'bg-neutral-100 text-neutral-700',
  issued: 'bg-blue-100 text-blue-800',
  awaiting_payment: 'bg-amber-100 text-amber-800',
  partially_paid: 'bg-orange-100 text-orange-800',
  settled: 'bg-emerald-100 text-emerald-800',
  refunded: 'bg-purple-100 text-purple-800',
  disputed: 'bg-red-100 text-red-800',
  voided: 'bg-neutral-200 text-neutral-700',
  expired: 'bg-neutral-200 text-neutral-700',
}

export function InvoiceDetailClient({ initial }: Props): React.ReactElement {
  const [invoice, setInvoice] = useState<InvoiceDetailResponse>(initial)
  const [copied, setCopied] = useState(false)

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

  const payerUrl =
    typeof window !== 'undefined' ? `${window.location.origin}/pay/${invoice.publicId}` : `/pay/${invoice.publicId}`

  return (
    <article>
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Invoice</h1>
          <p className="mt-1 font-mono text-xs text-neutral-500">{invoice.publicId}</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLE[invoice.status]}`}
        >
          {invoice.status.replace('_', ' ')}
        </span>
      </header>

      <dl className="mt-8 grid grid-cols-[max-content_1fr] gap-x-6 gap-y-3 text-sm">
        <dt className="text-neutral-500">Amount</dt>
        <dd className="font-medium">
          {invoice.amount.toFixed(2)} {invoice.currency}
        </dd>

        <dt className="text-neutral-500">Merchant</dt>
        <dd>{invoice.merchantDisplayName}</dd>

        <dt className="text-neutral-500">Description</dt>
        <dd>{invoice.description ?? '—'}</dd>

        <dt className="text-neutral-500">Created</dt>
        <dd>{new Date(invoice.createdAt).toLocaleString()}</dd>

        <dt className="text-neutral-500">Expires</dt>
        <dd>{new Date(invoice.expiresAt).toLocaleString()}</dd>

        {invoice.settledAt ? (
          <>
            <dt className="text-neutral-500">Settled</dt>
            <dd>{new Date(invoice.settledAt).toLocaleString()}</dd>
          </>
        ) : null}
      </dl>

      <section className="mt-8">
        <h2 className="text-sm font-semibold">Share with payer</h2>
        <div className="mt-2 flex items-center gap-2 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2">
          <code className="flex-1 truncate text-xs">{payerUrl}</code>
          <button
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(payerUrl)
                setCopied(true)
                window.setTimeout(() => setCopied(false), 1500)
              } catch {
                /* ignore */
              }
            }}
            className="rounded bg-black px-2.5 py-1 text-xs font-medium text-white"
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </section>

      {invoice.settlement ? (
        <section className="mt-8 rounded-md border border-emerald-200 bg-emerald-50 p-4">
          <h2 className="text-sm font-semibold text-emerald-900">On-chain settlement</h2>
          <dl className="mt-2 grid grid-cols-[max-content_1fr] gap-x-6 gap-y-1 text-xs">
            <dt className="text-emerald-700">Tx signature</dt>
            <dd className="break-all font-mono">
              <a
                href={`https://explorer.solana.com/tx/${encodeURIComponent(invoice.settlement.txSignature)}?cluster=devnet`}
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                {invoice.settlement.txSignature}
              </a>
            </dd>
            <dt className="text-emerald-700">Source chain</dt>
            <dd className="font-mono">{invoice.settlement.chainId}</dd>
            <dt className="text-emerald-700">Confirmed</dt>
            <dd>{new Date(invoice.settlement.confirmedAt).toLocaleString()}</dd>
          </dl>
        </section>
      ) : null}
    </article>
  )
}

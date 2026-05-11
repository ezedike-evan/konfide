/**
 * Public payer page.
 *
 * Reader: a buyer with the share link from the seller. Renders invoice
 * details and a "Pay with KIRAPAY" button that takes them to the hosted
 * checkout. Unauthenticated; do not surface internal IDs.
 */
import { notFound } from 'next/navigation'
import { getInvoice } from '../../../lib/api'

export default async function PayInvoicePage({
  params,
}: {
  params: Promise<{ invoiceId: string }>
}) {
  const { invoiceId } = await params

  const invoice = await getInvoice(invoiceId, { cache: 'no-store' }).catch(() => notFound())

  const isPayable = invoice.status === 'awaiting_payment' || invoice.status === 'partially_paid'

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <p className="text-xs uppercase tracking-wide text-neutral-500">{invoice.merchantDisplayName}</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        {invoice.amount.toFixed(2)} {invoice.currency}
      </h1>
      {invoice.cryptoAmount != null && invoice.cryptoCurrency ? (
        <p className="mt-1 text-sm text-neutral-500">
          settling {invoice.cryptoAmount} {invoice.cryptoCurrency} ≈ {invoice.amount.toFixed(2)}{' '}
          {invoice.currency}
        </p>
      ) : null}
      {invoice.description ? (
        <p className="mt-3 text-sm text-neutral-700">{invoice.description}</p>
      ) : null}

      <dl className="mt-6 grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 text-xs text-neutral-500">
        <dt>Status</dt>
        <dd className="font-medium text-neutral-800">{invoice.status.replace('_', ' ')}</dd>
        <dt>Expires</dt>
        <dd className="font-medium text-neutral-800">{new Date(invoice.expiresAt).toLocaleString()}</dd>
      </dl>

      {isPayable && invoice.checkoutUrl ? (
        <a
          href={invoice.checkoutUrl}
          className="mt-8 block rounded-md bg-black px-4 py-3 text-center text-sm font-medium text-white"
        >
          Pay with KIRAPAY
        </a>
      ) : (
        <p className="mt-8 rounded-md bg-neutral-100 px-4 py-3 text-sm text-neutral-700">
          This invoice is no longer accepting payments.
        </p>
      )}

      <p className="mt-12 text-xs text-neutral-400">
        Powered by Konfide. You will pay through KIRAPAY's hosted checkout. The merchant receives SOL on Solana (USDC swap roadmap'd via Jupiter).
      </p>
    </main>
  )
}


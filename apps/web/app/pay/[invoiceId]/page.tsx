/**
 * Public payer page — payer-facing checkout for a given invoice.
 *
 * Placeholder route. Real implementation will render `<CheckoutButton />`
 * from `@konfide/ui` and call `PaymentRouter`.
 */
import type { ReactElement } from 'react'

export default async function PayInvoicePage({
  params,
}: {
  params: Promise<{ invoiceId: string }>
}): Promise<ReactElement> {
  const { invoiceId } = await params
  return (
    <main className="mx-auto max-w-md px-6 py-24">
      <h1 className="text-2xl font-semibold">Pay invoice {invoiceId}</h1>
    </main>
  )
}

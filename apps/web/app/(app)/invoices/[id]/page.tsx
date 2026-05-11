/**
 * Issuer dashboard: invoice detail page.
 *
 * Server component fetches the initial state; the embedded client component
 * polls every 5 seconds while the invoice is `awaiting_payment`.
 */
import type { ReactElement } from 'react'
import { notFound } from 'next/navigation'
import { getInvoice } from '../../../../lib/api'
import { InvoiceDetailClient } from '../../../../components/invoice-detail-client'

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<ReactElement> {
  const { id } = await params
  const initial = await getInvoice(id, { cache: 'no-store' }).catch(() => notFound())
  return (
    <main className="bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
        <InvoiceDetailClient initial={initial} />
      </div>
    </main>
  )
}

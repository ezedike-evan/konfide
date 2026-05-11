/**
 * Issuer dashboard: invoice detail page.
 *
 * Server component fetches the initial state; the embedded client component
 * polls every 5 seconds while the invoice is still `awaiting_payment` so the
 * seller sees the status flip the moment the webhook fires.
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
    <section className="mx-auto max-w-2xl px-6 py-12">
      <InvoiceDetailClient initial={initial} />
    </section>
  )
}

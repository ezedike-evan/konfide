/**
 * Issuer dashboard: invoice detail page.
 *
 * Placeholder route — surface invoice + settlements once API endpoints exist.
 */
import type { ReactElement } from 'react'

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<ReactElement> {
  const { id } = await params
  return (
    <section className="px-6 py-12">
      <h1 className="text-2xl font-semibold">Invoice {id}</h1>
    </section>
  )
}

/**
 * `<InvoiceCard />` — renders a compact summary of an invoice for use in
 * lists and dashboards. Stub component: returns `null` until styling lands.
 */
import type { Invoice } from '@konfide/types'

export interface InvoiceCardProps {
  readonly invoice: Invoice
  readonly onClick?: (invoiceId: string) => void
}

export function InvoiceCard(_props: InvoiceCardProps): null {
  // TODO: implement layout, status pill, and total formatting.
  return null
}

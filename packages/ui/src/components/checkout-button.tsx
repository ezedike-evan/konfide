/**
 * `<CheckoutButton />` — entrypoint button shown on the public payer page.
 * Stub component.
 */
import type { Invoice } from '@konfide/types'

export interface CheckoutButtonProps {
  readonly invoice: Invoice
  readonly onCheckout: (invoiceId: string) => void
  readonly disabled?: boolean
}

export function CheckoutButton(_props: CheckoutButtonProps): null {
  // TODO: connect to PaymentRouter via API.
  return null
}

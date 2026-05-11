/**
 * Port: InvoiceRepository.
 *
 * Persistence boundary for the `Invoice` aggregate. Adapters in `apps/api`
 * implement this against Drizzle/Postgres; tests can stub it. Domain code
 * never sees row types.
 */
import type { Invoice, InvoiceStatus } from '@konfide/types'

export interface InvoiceRepository {
  /**
   * Persist a brand-new invoice.
   *
   * @param invoice - The fully-validated invoice to persist.
   */
  save(invoice: Invoice): Promise<void>

  /**
   * Look up an invoice by its internal UUID.
   *
   * @param id - The invoice id.
   * @returns The invoice, or `null` if not found.
   */
  findById(id: string): Promise<Invoice | null>

  /**
   * Look up an invoice by the public id surfaced on the payer page. For now,
   * the public id is the same UUID; the seam is here so we can swap in
   * shorter/opaque tokens later without touching domain code.
   *
   * @param publicId - The payer-facing invoice id.
   * @returns The invoice, or `null` if not found.
   */
  findByPublicId(publicId: string): Promise<Invoice | null>

  /**
   * Look up an invoice by the `customOrderId` sent to KIRAPAY at payment-link
   * creation time. This is the reconciliation key the webhook handler uses
   * to attribute an inbound KIRAPAY event to a local invoice.
   *
   * @param customOrderId - The id we sent to KIRAPAY.
   * @returns The invoice, or `null` if not found.
   */
  findByCustomOrderId(customOrderId: string): Promise<Invoice | null>

  /**
   * Update the status of an existing invoice. Caller is responsible for
   * ensuring the transition is legal (the `Invoice` aggregate enforces this
   * before calling).
   *
   * @param id - The invoice id.
   * @param status - The new status.
   * @param settledAt - Optional ISO timestamp; persisted only when status is
   *   transitioning into a settled or partially-paid state.
   */
  updateStatus(id: string, status: InvoiceStatus, settledAt?: string | null): Promise<void>

  /**
   * Attach payment-router checkout session metadata to an existing invoice.
   * This is denormalised storage: the URL/session-id come from KIRAPAY and
   * are stamped onto the invoice for the public payer page to redirect to.
   *
   * Fiat / crypto fields are optional because not every router quotes them
   * (KIRAPAY does — both come back on `POST /api/link/generate`).
   *
   * @param id - The invoice id.
   * @param session - Checkout session URL, id, expiry and optional priced
   *   fiat/crypto amounts.
   */
  attachCheckoutSession(
    id: string,
    session: {
      readonly url: string
      readonly sessionId: string
      readonly expiresAt: string
      readonly customOrderId?: string
      readonly fiatAmount?: number
      readonly fiatCurrency?: string
      readonly cryptoAmount?: number
      readonly cryptoCurrency?: string
      readonly settlementChainId?: string
      readonly settlementTokenAddress?: string
      readonly settlementReceiver?: string
    },
  ): Promise<void>

  /**
   * Read the checkout session previously attached via `attachCheckoutSession`.
   *
   * @param id - The invoice id.
   * @returns The checkout session, or `null` if none was attached.
   */
  findCheckoutSession(
    id: string,
  ): Promise<{
    readonly url: string
    readonly sessionId: string
    readonly expiresAt: string
    readonly fiatAmount: number | null
    readonly fiatCurrency: string | null
    readonly cryptoAmount: number | null
    readonly cryptoCurrency: string | null
  } | null>

  /**
   * Record the KIRAPAY transaction id (the `_id` echoed in webhooks) on the
   * invoice so we have a cross-reference for forensics. Optional because the
   * id only becomes known once we receive a webhook.
   */
  attachKirapayTransactionId?(id: string, kirapayTransactionId: string): Promise<void>
}

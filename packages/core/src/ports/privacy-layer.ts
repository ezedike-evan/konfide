/**
 * Port: PrivacyLayer.
 *
 * Abstracts confidential settlement on an ephemeral rollup. Implemented by
 * the Magicblock adapter — invoices are settled inside an ephemeral session
 * so amounts and counterparties never appear on the public ledger.
 */
import type { Invoice, Settlement } from '@konfide/types'

export interface PrivacySession {
  readonly id: string
  readonly rollupEndpoint: string
  readonly expiresAt: string
}

export interface PrivacyLayer {
  /**
   * Begin a confidential session for an invoice.
   *
   * @param invoice - The invoice to settle privately.
   * @returns The privacy session metadata.
   */
  beginSession(invoice: Invoice): Promise<PrivacySession>

  /**
   * Settle an invoice inside the privacy session and produce the resulting
   * (public) commitment as a `Settlement`.
   *
   * @param sessionId - The privacy session.
   * @param invoice - The invoice to settle.
   * @returns The settlement after the session is committed.
   */
  settle(sessionId: string, invoice: Invoice): Promise<Settlement>
}

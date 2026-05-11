/**
 * Invoice aggregate.
 *
 * Encodes the invariants of an invoice's lifecycle: only certain status
 * transitions are legal, and once settled an invoice cannot be reissued. All
 * mutations return a new `Invoice` — the aggregate is immutable from the
 * outside.
 */
import type { Invoice as InvoiceShape, InvoiceStatus } from '@konfide/types'
import { InvalidInvoiceTransitionError } from '../errors/index.js'

/**
 * Forward-only invoice transitions.
 *
 * KIRAPAY drives the awaiting_payment → settled (or expired/voided) transition
 * via webhooks. Once settled, a refund webhook can move the invoice to
 * `refunded` (terminal). `disputed` is kept as an off-rail escape hatch the
 * operator can land on for manual reconciliation.
 */
const ALLOWED_TRANSITIONS: Record<InvoiceStatus, readonly InvoiceStatus[]> = {
  draft: ['issued', 'voided'],
  issued: ['awaiting_payment', 'voided', 'expired'],
  awaiting_payment: ['partially_paid', 'settled', 'disputed', 'voided', 'expired'],
  partially_paid: ['settled', 'disputed', 'expired'],
  settled: ['refunded', 'disputed'],
  refunded: [],
  disputed: ['settled', 'voided'],
  voided: [],
  expired: [],
}

export class Invoice {
  readonly data: InvoiceShape

  /**
   * @param data - The validated invoice shape (typically from `InvoiceSchema`).
   */
  constructor(data: InvoiceShape) {
    this.data = data
  }

  /**
   * Transition this invoice to a new status. Returns a fresh `Invoice` with
   * the updated status; throws if the transition is not allowed.
   *
   * @param next - The desired next status.
   * @returns A new `Invoice` carrying the updated status.
   */
  transitionTo(next: InvoiceStatus): Invoice {
    const allowed = ALLOWED_TRANSITIONS[this.data.status] ?? []
    if (!allowed.includes(next)) {
      throw new InvalidInvoiceTransitionError(this.data.status, next)
    }
    return new Invoice({
      ...this.data,
      status: next,
      updatedAt: new Date().toISOString(),
    })
  }

  /** Whether this invoice is in a terminal status (`voided` or `expired`). */
  isTerminal(): boolean {
    return this.data.status === 'voided' || this.data.status === 'expired'
  }
}

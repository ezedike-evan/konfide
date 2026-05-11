/**
 * Settlement aggregate and the `SettlementStatus` enum.
 *
 * `Settlement` wraps a recorded payment and exposes `Money` accessors;
 * `SettlementStatus` mirrors the real status enum surfaced by the KIRAPAY
 * payment-routing layer (`Cancel | Pending | Success | Failed | Refunded |
 * Refunding | RefundedByRelay`). Domain code stays unaware of KIRAPAY
 * specifics — the enum names are KIRAPAY-shaped because that is the only
 * routing layer in flight; future routers will normalise into the same
 * vocabulary.
 */
import type { Settlement as SettlementShape } from '@konfide/types'
import { Money } from './money.js'

/**
 * Routing-side status of a settlement-in-flight.
 *
 * - `Pending`         — link issued, payer has not yet completed checkout.
 * - `Success`         — payer paid; funds have landed on the merchant
 *                       settlement chain (Solana for Konfide).
 * - `Failed`          — payment attempt errored; invoice stays open for retry
 *                       until it expires.
 * - `Cancel`          — payer or operator cancelled before completion.
 * - `Refunding`       — refund flow started, settlement chain transfer in
 *                       flight.
 * - `Refunded`        — refund landed; merchant no longer holds the funds.
 * - `RefundedByRelay` — refund was effected by a relayer (KIRAPAY pays back
 *                       the customer and recoups from the merchant on a
 *                       different rail). Domain treats this identically to
 *                       `Refunded`.
 */
export enum SettlementStatus {
  Pending = 'Pending',
  Success = 'Success',
  Failed = 'Failed',
  Cancel = 'Cancel',
  Refunding = 'Refunding',
  Refunded = 'Refunded',
  RefundedByRelay = 'RefundedByRelay',
}

/** Terminal-state predicate — refund flows still leave the invoice settled. */
export function isTerminalSettlementStatus(status: SettlementStatus): boolean {
  return (
    status === SettlementStatus.Success ||
    status === SettlementStatus.Failed ||
    status === SettlementStatus.Cancel ||
    status === SettlementStatus.Refunded ||
    status === SettlementStatus.RefundedByRelay
  )
}

export class Settlement {
  readonly data: SettlementShape

  /**
   * @param data - The validated settlement shape.
   */
  constructor(data: SettlementShape) {
    this.data = data
  }

  /** The amount actually received (after FX) as a `Money`. */
  receivedMoney(): Money {
    return Money.from(this.data.receivedAmount)
  }

  /** The amount the payer paid (pre-FX) as a `Money`. */
  paidMoney(): Money {
    return Money.from(this.data.paidAmount)
  }
}

/**
 * Settlement aggregate.
 *
 * Wraps a settled payment and surfaces helpers (e.g. whether a settlement
 * fully covers an invoice). Pure — no I/O.
 */
import type { Settlement as SettlementShape } from '@konfide/types'
import { Money } from './money.js'

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

/**
 * Counterparty aggregate.
 *
 * Wraps the `Counterparty` shape and exposes domain-level helpers (e.g.
 * verification status). Pure — no I/O.
 */
import type { Counterparty as CounterpartyShape } from '@konfide/types'

export class Counterparty {
  readonly data: CounterpartyShape

  /**
   * @param data - The validated counterparty shape.
   */
  constructor(data: CounterpartyShape) {
    this.data = data
  }

  /** Whether this counterparty has been KYB-verified. */
  isVerified(): boolean {
    return this.data.verified
  }

  /** Whether this counterparty can issue invoices. */
  canIssue(): boolean {
    return this.data.kind === 'issuer' || this.data.kind === 'both'
  }

  /** Whether this counterparty can pay invoices. */
  canPay(): boolean {
    return this.data.kind === 'payer' || this.data.kind === 'both'
  }
}

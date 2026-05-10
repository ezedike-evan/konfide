/**
 * Domain error classes.
 *
 * All errors thrown by `@konfide/core` extend `KonfideError` so callers can
 * tell domain failures apart from infrastructure failures.
 */
import type { InvoiceStatus } from '@konfide/types'

export class KonfideError extends Error {
  readonly code: string

  constructor(code: string, message: string) {
    super(message)
    this.name = 'KonfideError'
    this.code = code
  }
}

export class NotImplementedError extends KonfideError {
  constructor(symbol: string) {
    super('NOT_IMPLEMENTED', `${symbol} is not implemented`)
    this.name = 'NotImplementedError'
  }
}

export class InvalidInvoiceTransitionError extends KonfideError {
  constructor(from: InvoiceStatus, to: InvoiceStatus) {
    super('INVALID_INVOICE_TRANSITION', `Cannot transition invoice from ${from} to ${to}`)
    this.name = 'InvalidInvoiceTransitionError'
  }
}

export class CounterpartyNotFoundError extends KonfideError {
  constructor(handle: string) {
    super('COUNTERPARTY_NOT_FOUND', `No counterparty with handle ${handle}`)
    this.name = 'CounterpartyNotFoundError'
  }
}

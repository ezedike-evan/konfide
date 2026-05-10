/**
 * InvoiceService — orchestrates invoice creation, settlement, and disputes
 * using injected ports. Stub implementation.
 */
import type { Invoice, Settlement } from '@konfide/types'
import { NotImplementedError } from '../errors/index.js'
import type { Identity, PaymentRouter, PrivacyLayer } from '../ports/index.js'

export interface InvoiceServiceDeps {
  readonly paymentRouter: PaymentRouter
  readonly privacyLayer: PrivacyLayer
  readonly identity: Identity
}

export class InvoiceService {
  private readonly deps: InvoiceServiceDeps

  /**
   * @param deps - The ports this service depends on.
   */
  constructor(deps: InvoiceServiceDeps) {
    this.deps = deps
  }

  /**
   * Issue a new invoice on behalf of the authenticated issuer.
   *
   * @returns The newly issued invoice.
   */
  issue(): Promise<Invoice> {
    throw new NotImplementedError('InvoiceService.issue')
  }

  /**
   * Settle an invoice through the privacy layer.
   *
   * @returns The recorded settlement.
   */
  settle(): Promise<Settlement> {
    throw new NotImplementedError('InvoiceService.settle')
  }

  /** Mark an invoice as disputed. */
  dispute(): Promise<Invoice> {
    throw new NotImplementedError('InvoiceService.dispute')
  }
}

/**
 * InvoiceService — orchestrates invoice creation and settlement.
 *
 * Reader: anyone wiring HTTP routes or webhook handlers. The service is
 * pure: it depends only on injected ports, never on SDKs. The four public
 * methods cover the whole demo path:
 *
 *   createInvoice  — persist + open a checkout session
 *   markSettled    — webhook says payment confirmed → DB + on-chain record
 *   markPartial    — webhook says partial → record settlement, mark partial
 *   markFailed     — webhook says failed → log; invoice stays awaiting_payment
 *
 * `markFailed` deliberately does NOT transition the invoice — the payer can
 * retry within the session expiry window. We surface the failure in logs and
 * (future) in a settlement-attempts table.
 */
import type { Invoice as InvoiceShape, Money, Settlement } from '@konfide/types'
import { Invoice } from '../domain/invoice.js'
import { InvoiceNotFoundError } from '../errors/index.js'
import type {
  Clock,
  CounterpartyRepository,
  IdGenerator,
  InvoiceRepository,
  PaymentRouter,
  SettlementRecorder,
  SettlementRepository,
} from '../ports/index.js'

/** Input to `createInvoice`. */
export interface CreateInvoiceInput {
  readonly issuerHandle: string
  readonly amountMinorUnits: bigint
  readonly currency: string
  readonly recipientHandle: string | null
  readonly description: string | null
  readonly expiresInMinutes: number
}

/** Result of `createInvoice` — what the API surfaces back to the issuer. */
export interface CreateInvoiceResult {
  readonly invoice: InvoiceShape
  readonly checkoutUrl: string
  readonly checkoutSessionId: string
  readonly checkoutExpiresAt: string
  readonly fiatAmount: number | null
  readonly fiatCurrency: string | null
  readonly cryptoAmount: number | null
  readonly cryptoCurrency: string | null
}

/** Input to `markSettled`. */
export interface MarkSettledInput {
  readonly invoiceId: string
  readonly settlement: Omit<Settlement, 'id' | 'invoiceId'>
}

/** Input to `markPartial`. */
export interface MarkPartialInput {
  readonly invoiceId: string
  readonly receivedAmount: Money
  readonly settlement: Omit<Settlement, 'id' | 'invoiceId'>
}

/** Input to `markFailed`. */
export interface MarkFailedInput {
  readonly invoiceId: string
  readonly reason: string
}

/** Input to `markRefunded`. */
export interface MarkRefundedInput {
  readonly invoiceId: string
  /** KIRAPAY status for the refund (`Refunded` or `RefundedByRelay`). */
  readonly refundKind: 'Refunded' | 'RefundedByRelay'
  readonly refundedAt: string
}

/** Result of a settlement application — what the webhook handler logs. */
export interface SettlementApplied {
  readonly invoice: InvoiceShape
  readonly settlement: Settlement
  readonly onChainSignature: string | null
}

export interface InvoiceServiceDeps {
  readonly paymentRouter: PaymentRouter
  readonly invoices: InvoiceRepository
  readonly settlements: SettlementRepository
  readonly counterparties: CounterpartyRepository
  readonly clock: Clock
  readonly idGenerator: IdGenerator
  readonly settlementRecorder?: SettlementRecorder
  /** Issued by the API request id; helps logs trace through a webhook. */
  readonly logger?: { info: (msg: string, meta?: unknown) => void; error: (msg: string, meta?: unknown) => void }
}

export class InvoiceService {
  private readonly deps: InvoiceServiceDeps

  /**
   * @param deps - Ports the service depends on.
   */
  constructor(deps: InvoiceServiceDeps) {
    this.deps = deps
  }

  /**
   * Create a new invoice and open a KIRAPAY checkout session for it. The
   * invoice is persisted in `awaiting_payment` so it shows up in dashboards
   * and on the public payer page right away.
   *
   * @param input - Invoice fields supplied by the API caller.
   * @returns The persisted invoice and the hosted checkout URL.
   */
  async createInvoice(input: CreateInvoiceInput): Promise<CreateInvoiceResult> {
    const issuer = await this.deps.counterparties.findByHandle(input.issuerHandle)
    if (!issuer) {
      throw new InvoiceNotFoundError(`issuer:${input.issuerHandle}`)
    }
    const recipient = input.recipientHandle
      ? await this.deps.counterparties.findByHandle(input.recipientHandle)
      : null

    const now = this.deps.clock.nowIso()
    const dueAt = new Date(Date.now() + input.expiresInMinutes * 60_000).toISOString()

    const id = this.deps.idGenerator.uuid()
    const invoice: InvoiceShape = {
      id,
      issuerId: issuer.id,
      payerId: recipient ? recipient.id : null,
      status: 'awaiting_payment',
      total: { amount: input.amountMinorUnits, currency: input.currency },
      lineItems: [
        {
          description: input.description ?? 'Invoice',
          quantity: 1,
          unitPrice: { amount: input.amountMinorUnits, currency: input.currency },
        },
      ],
      memo: input.description ?? null,
      dueAt,
      createdAt: now,
      updatedAt: now,
      settledAt: null,
      onChainRef: null,
    }
    await this.deps.invoices.save(invoice)

    const quotes = await this.deps.paymentRouter.quote(invoice, 'any')
    const route = quotes[0]?.route ?? 'default'
    const session = await this.deps.paymentRouter.createSession(invoice, route)

    await this.deps.invoices.attachCheckoutSession(invoice.id, {
      url: session.checkoutUrl,
      sessionId: session.id,
      expiresAt: session.expiresAt,
      customOrderId: session.id,
      ...(session.fiatAmount !== undefined ? { fiatAmount: session.fiatAmount } : {}),
      ...(session.fiatCurrency !== undefined ? { fiatCurrency: session.fiatCurrency } : {}),
      ...(session.cryptoAmount !== undefined ? { cryptoAmount: session.cryptoAmount } : {}),
      ...(session.cryptoCurrency !== undefined ? { cryptoCurrency: session.cryptoCurrency } : {}),
    })

    return {
      invoice,
      checkoutUrl: session.checkoutUrl,
      checkoutSessionId: session.id,
      checkoutExpiresAt: session.expiresAt,
      fiatAmount: session.fiatAmount ?? null,
      fiatCurrency: session.fiatCurrency ?? null,
      cryptoAmount: session.cryptoAmount ?? null,
      cryptoCurrency: session.cryptoCurrency ?? null,
    }
  }

  /**
   * Mark an invoice as fully settled. Persists the settlement, transitions
   * the invoice to `settled`, and best-effort records the settlement on
   * Solana. On-chain failure does not roll back the DB write — the indexer
   * (out of scope) will reconcile.
   *
   * @param input - Invoice id and the settlement details from the rails.
   * @returns The applied invoice, settlement, and on-chain signature.
   */
  async markSettled(input: MarkSettledInput): Promise<SettlementApplied> {
    const current = await this.requireInvoice(input.invoiceId)
    const aggregate = new Invoice(current).transitionTo('settled')

    const settlement: Settlement = {
      id: this.deps.idGenerator.uuid(),
      invoiceId: current.id,
      ...input.settlement,
    }
    await this.deps.settlements.save(settlement)

    const settledAt = settlement.confirmedAt
    await this.deps.invoices.updateStatus(current.id, 'settled', settledAt)

    const updated: InvoiceShape = {
      ...aggregate.data,
      settledAt,
    }

    let onChainSignature: string | null = null
    if (this.deps.settlementRecorder) {
      try {
        onChainSignature = await this.deps.settlementRecorder.submitSettlement({
          invoiceId: current.id,
          amountAtomic: settlement.receivedAmount.amount,
          recipient: settlement.paidBy,
        })
      } catch (err) {
        this.deps.logger?.error('on-chain settle_invoice failed', {
          invoiceId: current.id,
          error: err instanceof Error ? err.message : String(err),
        })
      }
    }

    this.deps.logger?.info('invoice.settled', {
      invoiceId: current.id,
      settlementId: settlement.id,
      onChainSignature,
    })

    return { invoice: updated, settlement, onChainSignature }
  }

  /**
   * Mark an invoice as partially paid. Persists the partial settlement and
   * transitions the invoice to `partially_paid`.
   *
   * @param input - Invoice id, received amount, settlement details.
   * @returns The applied invoice and settlement (no on-chain commit on partial).
   */
  async markPartial(input: MarkPartialInput): Promise<SettlementApplied> {
    const current = await this.requireInvoice(input.invoiceId)
    const aggregate = new Invoice(current).transitionTo('partially_paid')

    const settlement: Settlement = {
      id: this.deps.idGenerator.uuid(),
      invoiceId: current.id,
      ...input.settlement,
      receivedAmount: input.receivedAmount,
    }
    await this.deps.settlements.save(settlement)
    await this.deps.invoices.updateStatus(current.id, 'partially_paid', null)

    this.deps.logger?.info('invoice.partial', {
      invoiceId: current.id,
      receivedAmount: settlement.receivedAmount,
      expected: current.total,
    })

    return { invoice: aggregate.data, settlement, onChainSignature: null }
  }

  /**
   * Record a failed payment attempt without transitioning the invoice. The
   * payer can retry within the session expiry window.
   *
   * @param input - Invoice id and the failure reason from KIRAPAY.
   */
  async markFailed(input: MarkFailedInput): Promise<void> {
    await this.requireInvoice(input.invoiceId)
    this.deps.logger?.info('invoice.payment_failed', {
      invoiceId: input.invoiceId,
      reason: input.reason,
    })
  }

  /**
   * Mark a previously-settled invoice as refunded. Reached from the
   * `transaction.refund` KIRAPAY webhook for both `Refunded` and
   * `RefundedByRelay` outcomes.
   *
   * @param input - Invoice id, refund kind, and the refund timestamp.
   * @returns The invoice in its post-transition state.
   */
  async markRefunded(input: MarkRefundedInput): Promise<InvoiceShape> {
    const current = await this.requireInvoice(input.invoiceId)
    const aggregate = new Invoice(current).transitionTo('refunded')
    await this.deps.invoices.updateStatus(current.id, 'refunded', null)
    this.deps.logger?.info('invoice.refunded', {
      invoiceId: current.id,
      refundKind: input.refundKind,
      refundedAt: input.refundedAt,
    })
    return aggregate.data
  }

  private async requireInvoice(id: string): Promise<InvoiceShape> {
    const invoice = await this.deps.invoices.findById(id)
    if (!invoice) throw new InvoiceNotFoundError(id)
    return invoice
  }
}

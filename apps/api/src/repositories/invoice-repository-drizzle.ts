  import type {
  Clock,
  InvoiceRepository,
} from '@konfide/core/ports'
import type { Invoice, InvoiceStatus } from '@konfide/types'
import { desc, eq } from 'drizzle-orm'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import * as schema from '../db/schema.js'

interface InvoiceEncryptedPayload {
  readonly description: string | null
  readonly recipientHandle: string | null
  readonly lineItems: Invoice['lineItems']
}

type InvoiceRow = typeof schema.invoices.$inferSelect

export class InvoiceRepositoryDrizzle implements InvoiceRepository {
  private readonly db: PostgresJsDatabase<typeof schema>
  private readonly clock: Clock

  constructor(db: PostgresJsDatabase<typeof schema>, clock: Clock) {
    this.db = db
    this.clock = clock
  }

  async save(invoice: Invoice): Promise<void> {
    const payload: InvoiceEncryptedPayload = {
      description: invoice.memo,
      recipientHandle: null,
      lineItems: invoice.lineItems,
    }
    await this.db.insert(schema.invoices).values({
      id: invoice.id,
      issuerId: invoice.issuerId,
      payerId: invoice.payerId,
      status: invoice.status,
      totalAmount: invoice.total.amount,
      totalCurrency: invoice.total.currency,
      encryptedPayload: JSON.stringify(payload, (_key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ),
      dueAt: new Date(invoice.dueAt),
      createdAt: new Date(invoice.createdAt),
      updatedAt: new Date(invoice.updatedAt),
      settledAt: invoice.settledAt ? new Date(invoice.settledAt) : null,
      onChainRef: invoice.onChainRef,
    })
  }

  async findById(id: string): Promise<Invoice | null> {
    const rows = await this.db
      .select()
      .from(schema.invoices)
      .where(eq(schema.invoices.id, id))
      .limit(1)
    const row = rows[0]
    return row ? this.toDomain(row) : null
  }

  async findByPublicId(publicId: string): Promise<Invoice | null> {
    return this.findById(publicId)
  }

  async listByIssuer(issuerId: string, limit?: number): Promise<Invoice[]> {
    const clamped = Math.min(Math.max(1, Math.floor(limit ?? 50)), 200)
    const rows = await this.db
      .select()
      .from(schema.invoices)
      .where(eq(schema.invoices.issuerId, issuerId))
      .orderBy(desc(schema.invoices.createdAt))
      .limit(clamped)
    return rows.map((row) => this.toDomain(row))
  }

  /**
   * Look up an invoice by its KIRAPAY `customOrderId`. Used by the inbound
   * webhook handler to reconcile a delivered event to a local invoice.
   */
  async findByCustomOrderId(customOrderId: string): Promise<Invoice | null> {
    const rows = await this.db
      .select()
      .from(schema.invoices)
      .where(eq(schema.invoices.customOrderId, customOrderId))
      .limit(1)
    const row = rows[0]
    return row ? this.toDomain(row) : null
  }

  async updateStatus(
    id: string,
    status: InvoiceStatus,
    settledAt?: string | null,
  ): Promise<void> {
    const update: Partial<typeof schema.invoices.$inferInsert> = {
      status,
      updatedAt: new Date(this.clock.nowIso()),
    }
    if (settledAt !== undefined) {
      update.settledAt = settledAt ? new Date(settledAt) : null
    }
    await this.db.update(schema.invoices).set(update).where(eq(schema.invoices.id, id))
  }

  async attachCheckoutSession(
    id: string,
    session: {
      url: string
      sessionId: string
      expiresAt: string
      customOrderId?: string
      fiatAmount?: number
      fiatCurrency?: string
      cryptoAmount?: number
      cryptoCurrency?: string
      settlementChainId?: string
      settlementTokenAddress?: string
      settlementReceiver?: string
    },
  ): Promise<void> {
    const update: Partial<typeof schema.invoices.$inferInsert> = {
      checkoutSessionId: session.sessionId,
      checkoutUrl: session.url,
      checkoutExpiresAt: new Date(session.expiresAt),
      kirapayLinkUrl: session.url,
      updatedAt: new Date(this.clock.nowIso()),
    }
    if (session.customOrderId !== undefined) update.customOrderId = session.customOrderId
    if (session.fiatAmount !== undefined) update.fiatAmount = session.fiatAmount.toString()
    if (session.fiatCurrency !== undefined) update.fiatCurrency = session.fiatCurrency
    if (session.cryptoAmount !== undefined)
      update.cryptoAmount = session.cryptoAmount.toString()
    if (session.cryptoCurrency !== undefined) update.cryptoCurrency = session.cryptoCurrency
    if (session.settlementChainId !== undefined)
      update.settlementChainId = session.settlementChainId
    if (session.settlementTokenAddress !== undefined)
      update.settlementTokenAddress = session.settlementTokenAddress
    if (session.settlementReceiver !== undefined)
      update.settlementReceiver = session.settlementReceiver

    await this.db.update(schema.invoices).set(update).where(eq(schema.invoices.id, id))
  }

  async findCheckoutSession(
    id: string,
  ): Promise<{
    url: string
    sessionId: string
    expiresAt: string
    fiatAmount: number | null
    fiatCurrency: string | null
    cryptoAmount: number | null
    cryptoCurrency: string | null
  } | null> {
    const rows = await this.db
      .select({
        sessionId: schema.invoices.checkoutSessionId,
        url: schema.invoices.checkoutUrl,
        expiresAt: schema.invoices.checkoutExpiresAt,
        fiatAmount: schema.invoices.fiatAmount,
        fiatCurrency: schema.invoices.fiatCurrency,
        cryptoAmount: schema.invoices.cryptoAmount,
        cryptoCurrency: schema.invoices.cryptoCurrency,
      })
      .from(schema.invoices)
      .where(eq(schema.invoices.id, id))
      .limit(1)
    const row = rows[0]
    if (!row || !row.sessionId || !row.url || !row.expiresAt) return null
    return {
      sessionId: row.sessionId,
      url: row.url,
      expiresAt: row.expiresAt.toISOString(),
      fiatAmount: row.fiatAmount != null ? Number.parseFloat(row.fiatAmount) : null,
      fiatCurrency: row.fiatCurrency,
      cryptoAmount: row.cryptoAmount != null ? Number.parseFloat(row.cryptoAmount) : null,
      cryptoCurrency: row.cryptoCurrency,
    }
  }

  async attachKirapayTransactionId(id: string, kirapayTransactionId: string): Promise<void> {
    await this.db
      .update(schema.invoices)
      .set({
        kirapayTransactionId,
        updatedAt: new Date(this.clock.nowIso()),
      })
      .where(eq(schema.invoices.id, id))
  }

  private toDomain(row: InvoiceRow): Invoice {
    let payload: InvoiceEncryptedPayload
    try {
      payload = JSON.parse(row.encryptedPayload) as InvoiceEncryptedPayload
    } catch {
      payload = { description: null, recipientHandle: null, lineItems: [] }
    }

    return {
      id: row.id,
      issuerId: row.issuerId,
      payerId: row.payerId,
      status: row.status as InvoiceStatus,
      total: { amount: row.totalAmount, currency: row.totalCurrency },
      lineItems:
        payload.lineItems.length > 0
          ? payload.lineItems
          : [
              {
                description: payload.description ?? 'Invoice',
                quantity: 1,
                unitPrice: { amount: row.totalAmount, currency: row.totalCurrency },
              },
            ],
      memo: payload.description,
      dueAt: row.dueAt.toISOString(),
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      settledAt: row.settledAt ? row.settledAt.toISOString() : null,
      onChainRef: row.onChainRef,
    }
  }
}

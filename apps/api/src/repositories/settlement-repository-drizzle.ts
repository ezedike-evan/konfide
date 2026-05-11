/**
 * Drizzle-backed `SettlementRepository`.
 */
import type { SettlementRepository } from '@konfide/core/ports'
import type { Settlement, SettlementRoute } from '@konfide/types'
import { eq } from 'drizzle-orm'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import * as schema from '../db/schema.js'

type SettlementRow = typeof schema.settlements.$inferSelect

export class SettlementRepositoryDrizzle implements SettlementRepository {
  private readonly db: PostgresJsDatabase<typeof schema>

  constructor(db: PostgresJsDatabase<typeof schema>) {
    this.db = db
  }

  async save(settlement: Settlement): Promise<void> {
    await this.db.insert(schema.settlements).values({
      id: settlement.id,
      invoiceId: settlement.invoiceId,
      route: settlement.route,
      paidBy: settlement.paidBy,
      paidAmount: settlement.paidAmount.amount,
      paidCurrency: settlement.paidAmount.currency,
      receivedAmount: settlement.receivedAmount.amount,
      receivedCurrency: settlement.receivedAmount.currency,
      txSignature: settlement.txSignature,
      chainId: settlement.chainId,
      confirmedAt: new Date(settlement.confirmedAt),
    })
  }

  async findByInvoiceId(invoiceId: string): Promise<readonly Settlement[]> {
    const rows = await this.db
      .select()
      .from(schema.settlements)
      .where(eq(schema.settlements.invoiceId, invoiceId))
    return rows.map((row) => this.toDomain(row))
  }

  private toDomain(row: SettlementRow): Settlement {
    return {
      id: row.id,
      invoiceId: row.invoiceId,
      route: row.route as SettlementRoute,
      paidBy: row.paidBy,
      paidAmount: { amount: row.paidAmount, currency: row.paidCurrency },
      receivedAmount: { amount: row.receivedAmount, currency: row.receivedCurrency },
      txSignature: row.txSignature,
      chainId: row.chainId,
      confirmedAt: row.confirmedAt.toISOString(),
    }
  }
}

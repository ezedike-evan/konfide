/**
 * Drizzle-backed `CounterpartyRepository`.
 */
import type { CounterpartyRepository } from '@konfide/core/ports'
import type { Counterparty, CounterpartyKind } from '@konfide/types'
import { eq } from 'drizzle-orm'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import * as schema from '../db/schema.js'

type CounterpartyRow = typeof schema.counterparties.$inferSelect

export class CounterpartyRepositoryDrizzle implements CounterpartyRepository {
  private readonly db: PostgresJsDatabase<typeof schema>

  constructor(db: PostgresJsDatabase<typeof schema>) {
    this.db = db
  }

  async findByHandle(handle: string): Promise<Counterparty | null> {
    const rows = await this.db
      .select()
      .from(schema.counterparties)
      .where(eq(schema.counterparties.handle, handle))
      .limit(1)
    const row = rows[0]
    return row ? this.toDomain(row) : null
  }

  async findById(id: string): Promise<Counterparty | null> {
    const rows = await this.db
      .select()
      .from(schema.counterparties)
      .where(eq(schema.counterparties.id, id))
      .limit(1)
    const row = rows[0]
    return row ? this.toDomain(row) : null
  }

  private toDomain(row: CounterpartyRow): Counterparty {
    return {
      id: row.id,
      handle: row.handle,
      displayName: row.displayName,
      kind: row.kind as CounterpartyKind,
      primaryWallet: row.primaryWallet,
      jurisdiction: row.jurisdiction,
      verified: row.verified === 'true',
      createdAt: row.createdAt.toISOString(),
    }
  }
}

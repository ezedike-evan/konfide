/**
 * Webhook idempotency store. Tracks the upstream event id of every webhook
 * we've successfully processed so duplicate deliveries become 200-no-ops.
 */
import { eq } from 'drizzle-orm'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import * as schema from '../db/schema.js'

export class WebhookEventRepositoryDrizzle {
  private readonly db: PostgresJsDatabase<typeof schema>

  constructor(db: PostgresJsDatabase<typeof schema>) {
    this.db = db
  }

  async hasProcessed(eventId: string): Promise<boolean> {
    const rows = await this.db
      .select({ id: schema.webhookEvents.id })
      .from(schema.webhookEvents)
      .where(eq(schema.webhookEvents.id, eventId))
      .limit(1)
    return rows.length > 0
  }

  async record(input: {
    readonly id: string
    readonly source: string
    readonly type: string
    readonly payload: unknown
    readonly rawBody?: string
  }): Promise<void> {
    await this.db
      .insert(schema.webhookEvents)
      .values({
        id: input.id,
        source: input.source,
        type: input.type,
        payload: input.payload as object,
        ...(input.rawBody !== undefined ? { rawBody: input.rawBody } : {}),
      })
      .onConflictDoNothing()
  }
}

/**
 * Drizzle schema for the Konfide API.
 *
 * Tables are intentionally minimal: we persist only what the protocol needs
 * to coordinate off-chain state. Sensitive trade-finance content stays
 * encrypted at rest (handled at the application layer).
 *
 * KIRAPAY columns on `invoices`:
 *   - `custom_order_id`            — the reconciliation key sent to KIRAPAY
 *                                    on link creation. Unique index so a
 *                                    webhook can dedupe back to one invoice.
 *   - `fiat_amount` / `fiat_currency` — what the payer sees in the link UI.
 *   - `crypto_amount` / `crypto_currency` — what KIRAPAY says the merchant
 *                                    will receive on the settlement chain
 *                                    (nullable until KIRAPAY responds).
 *   - `settlement_chain_id`        — KIRAPAY `tokenOut.chainId`, default `sol`.
 *   - `settlement_token_address`   — KIRAPAY `tokenOut.address`, default `SOL`.
 *   - `settlement_receiver`        — Solana base58 pubkey funds land at.
 *   - `kirapay_link_url`           — the hosted-checkout URL returned by
 *                                    `POST /api/link/generate`.
 *   - `kirapay_transaction_id`     — KIRAPAY's `_id` for the transaction,
 *                                    populated from inbound webhooks.
 */
import { sql } from 'drizzle-orm'
import {
  bigint,
  index,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'

export const counterparties = pgTable('counterparties', {
  id: uuid('id').primaryKey().defaultRandom(),
  handle: text('handle').notNull().unique(),
  displayName: text('display_name').notNull(),
  kind: text('kind', { enum: ['issuer', 'payer', 'both'] }).notNull(),
  primaryWallet: text('primary_wallet').notNull(),
  jurisdiction: text('jurisdiction'),
  verified: text('verified').notNull().default('false'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const invoices = pgTable(
  'invoices',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    issuerId: uuid('issuer_id')
      .notNull()
      .references(() => counterparties.id),
    payerId: uuid('payer_id').references(() => counterparties.id),
    status: text('status').notNull(),
    totalAmount: bigint('total_amount', { mode: 'bigint' }).notNull(),
    totalCurrency: text('total_currency').notNull(),
    encryptedPayload: text('encrypted_payload').notNull(),
    customOrderId: text('custom_order_id'),
    fiatAmount: numeric('fiat_amount'),
    fiatCurrency: text('fiat_currency'),
    cryptoAmount: numeric('crypto_amount'),
    cryptoCurrency: text('crypto_currency'),
    settlementChainId: text('settlement_chain_id').notNull().default('sol'),
    settlementTokenAddress: text('settlement_token_address').notNull().default('SOL'),
    settlementReceiver: text('settlement_receiver'),
    kirapayLinkUrl: text('kirapay_link_url'),
    kirapayTransactionId: text('kirapay_transaction_id'),
    checkoutSessionId: text('checkout_session_id'),
    checkoutUrl: text('checkout_url'),
    checkoutExpiresAt: timestamp('checkout_expires_at', { withTimezone: true }),
    dueAt: timestamp('due_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    settledAt: timestamp('settled_at', { withTimezone: true }),
    onChainRef: text('on_chain_ref'),
  },
  (table) => ({
    customOrderIdIdx: uniqueIndex('invoices_custom_order_id_idx').on(table.customOrderId),
    kirapayTransactionIdIdx: index('invoices_kirapay_transaction_id_idx').on(
      table.kirapayTransactionId,
    ),
  }),
)

export const settlements = pgTable('settlements', {
  id: uuid('id').primaryKey().defaultRandom(),
  invoiceId: uuid('invoice_id')
    .notNull()
    .references(() => invoices.id),
  route: text('route').notNull(),
  paidBy: text('paid_by').notNull(),
  paidAmount: bigint('paid_amount', { mode: 'bigint' }).notNull(),
  paidCurrency: text('paid_currency').notNull(),
  receivedAmount: bigint('received_amount', { mode: 'bigint' }).notNull(),
  receivedCurrency: text('received_currency').notNull(),
  txSignature: text('tx_signature').notNull(),
  chainId: text('chain_id').notNull(),
  confirmedAt: timestamp('confirmed_at', { withTimezone: true }).notNull(),
})

export const trustScores = pgTable('trust_scores', {
  counterpartyId: uuid('counterparty_id')
    .primaryKey()
    .references(() => counterparties.id),
  score: bigint('score', { mode: 'number' }).notNull(),
  tier: text('tier').notNull(),
  factors: jsonb('factors').notNull(),
  computedAt: timestamp('computed_at', { withTimezone: true }).notNull().defaultNow(),
})

/**
 * Inbound webhook events we have already processed, keyed by the upstream
 * event id. Used as the idempotency table so a duplicate delivery from
 * KIRAPAY is acknowledged with 200 but not re-applied.
 *
 * `raw_body` is stored verbatim for replay / forensics in case the parsed
 * `payload` JSON has dropped a field due to a schema mismatch.
 */
export const webhookEvents = pgTable('webhook_events', {
  id: text('id').primaryKey(),
  source: text('source').notNull(),
  type: text('type').notNull(),
  payload: jsonb('payload').notNull(),
  rawBody: text('raw_body'),
  processed: text('processed').notNull().default('true'),
  receivedAt: timestamp('received_at', { withTimezone: true }).notNull().defaultNow(),
})

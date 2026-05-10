/**
 * Drizzle schema for the Konfide API.
 *
 * Tables are intentionally minimal: we persist only what the protocol needs
 * to coordinate off-chain state. Sensitive trade-finance content stays
 * encrypted at rest (handled at the application layer).
 */
import { sql } from 'drizzle-orm'
import { bigint, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

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

export const invoices = pgTable('invoices', {
  id: uuid('id').primaryKey().defaultRandom(),
  issuerId: uuid('issuer_id')
    .notNull()
    .references(() => counterparties.id),
  payerId: uuid('payer_id').references(() => counterparties.id),
  status: text('status').notNull(),
  totalAmount: bigint('total_amount', { mode: 'bigint' }).notNull(),
  totalCurrency: text('total_currency').notNull(),
  encryptedPayload: text('encrypted_payload').notNull(),
  dueAt: timestamp('due_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .default(sql`now()`),
  settledAt: timestamp('settled_at', { withTimezone: true }),
  onChainRef: text('on_chain_ref'),
})

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

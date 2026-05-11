/**
 * Zod schemas and inferred types for invoices.
 *
 * Invoices are the central artifact of Konfide: an issuer creates one, a payer
 * settles it via a payment route, and the protocol records the result on
 * Solana. Schemas here describe the wire shape; domain rules live in
 * `@konfide/core`.
 */
import { z } from 'zod'

/**
 * Lifecycle states an invoice can be in. Transitions are enforced by
 * `@konfide/core`'s `Invoice` aggregate.
 */
export const InvoiceStatusSchema = z.enum([
  'draft',
  'issued',
  'awaiting_payment',
  'partially_paid',
  'settled',
  'refunded',
  'disputed',
  'voided',
  'expired',
])

export type InvoiceStatus = z.infer<typeof InvoiceStatusSchema>

/**
 * Money value object: integer minor units plus an ISO-4217-like currency code
 * or token symbol (e.g. `USDC`, `EURC`, `SOL`).
 */
export const MoneySchema = z.object({
  amount: z.bigint().nonnegative(),
  currency: z.string().min(2).max(8),
})

export type Money = z.infer<typeof MoneySchema>

/**
 * A single invoice line item. The protocol does not interpret descriptions —
 * they are encrypted at rest and surfaced only to the counterparties.
 */
export const InvoiceLineItemSchema = z.object({
  description: z.string().min(1).max(500),
  quantity: z.number().int().positive(),
  unitPrice: MoneySchema,
})

export type InvoiceLineItem = z.infer<typeof InvoiceLineItemSchema>

/**
 * Full invoice schema as stored in the API and surfaced to clients.
 */
export const InvoiceSchema = z.object({
  id: z.string().uuid(),
  issuerId: z.string().uuid(),
  payerId: z.string().uuid().nullable(),
  status: InvoiceStatusSchema,
  total: MoneySchema,
  lineItems: z.array(InvoiceLineItemSchema).min(1),
  memo: z.string().max(1000).nullable(),
  dueAt: z.string().datetime(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  settledAt: z.string().datetime().nullable(),
  onChainRef: z.string().nullable(),
})

export type Invoice = z.infer<typeof InvoiceSchema>

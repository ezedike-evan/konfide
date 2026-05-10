/**
 * Request/response schemas for the public Konfide API.
 *
 * These describe the wire contract between `apps/web` and `apps/api`.
 * Anything that crosses an HTTP boundary should be validated against one
 * of these schemas.
 */
import { z } from 'zod'
import { CounterpartySchema } from './counterparty.js'
import { InvoiceLineItemSchema, InvoiceSchema, MoneySchema } from './invoice.js'
import { SettlementSchema } from './settlement.js'
import { TrustScoreSchema } from './trust-score.js'

export const CreateInvoiceRequestSchema = z.object({
  payerHandle: z.string().min(2).max(64).nullable(),
  lineItems: z.array(InvoiceLineItemSchema).min(1),
  total: MoneySchema,
  memo: z.string().max(1000).nullable(),
  dueAt: z.string().datetime(),
})

export type CreateInvoiceRequest = z.infer<typeof CreateInvoiceRequestSchema>

export const CreateInvoiceResponseSchema = z.object({
  invoice: InvoiceSchema,
})

export type CreateInvoiceResponse = z.infer<typeof CreateInvoiceResponseSchema>

export const GetInvoiceResponseSchema = z.object({
  invoice: InvoiceSchema,
  settlements: z.array(SettlementSchema),
})

export type GetInvoiceResponse = z.infer<typeof GetInvoiceResponseSchema>

export const GetCounterpartyResponseSchema = z.object({
  counterparty: CounterpartySchema,
  trustScore: TrustScoreSchema.nullable(),
})

export type GetCounterpartyResponse = z.infer<typeof GetCounterpartyResponseSchema>

export const ApiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.record(z.unknown()).optional(),
})

export type ApiError = z.infer<typeof ApiErrorSchema>

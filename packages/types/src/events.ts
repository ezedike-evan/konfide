/**
 * Domain event schemas.
 *
 * These describe the events the protocol emits as state changes happen —
 * consumed by the indexer, the API webhooks, and downstream loyalty/Torque
 * integrations.
 */
import { z } from 'zod'
import { InvoiceSchema } from './invoice.js'
import { SettlementSchema } from './settlement.js'

export const InvoiceIssuedEventSchema = z.object({
  type: z.literal('invoice.issued'),
  occurredAt: z.string().datetime(),
  invoice: InvoiceSchema,
})

export const InvoiceSettledEventSchema = z.object({
  type: z.literal('invoice.settled'),
  occurredAt: z.string().datetime(),
  invoice: InvoiceSchema,
  settlement: SettlementSchema,
})

export const InvoiceDisputedEventSchema = z.object({
  type: z.literal('invoice.disputed'),
  occurredAt: z.string().datetime(),
  invoice: InvoiceSchema,
  reason: z.string().max(500),
})

export const DomainEventSchema = z.discriminatedUnion('type', [
  InvoiceIssuedEventSchema,
  InvoiceSettledEventSchema,
  InvoiceDisputedEventSchema,
])

export type InvoiceIssuedEvent = z.infer<typeof InvoiceIssuedEventSchema>
export type InvoiceSettledEvent = z.infer<typeof InvoiceSettledEventSchema>
export type InvoiceDisputedEvent = z.infer<typeof InvoiceDisputedEventSchema>
export type DomainEvent = z.infer<typeof DomainEventSchema>

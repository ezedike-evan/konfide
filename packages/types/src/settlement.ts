/**
 * Zod schemas and inferred types for settlements.
 *
 * A settlement records the on-chain side of an invoice payment: the route
 * taken, the chain it landed on, and the resulting transaction signature.
 */
import { z } from 'zod'
import { MoneySchema } from './invoice.js'

export const SettlementRouteSchema = z.enum([
  'kirapay_direct',
  'kirapay_swap',
  'magicblock_confidential',
  'on_chain_native',
])

export type SettlementRoute = z.infer<typeof SettlementRouteSchema>

export const SettlementSchema = z.object({
  id: z.string().uuid(),
  invoiceId: z.string().uuid(),
  route: SettlementRouteSchema,
  paidBy: z.string().min(32).max(64),
  paidAmount: MoneySchema,
  receivedAmount: MoneySchema,
  txSignature: z.string().min(64).max(128),
  chainId: z.string(),
  confirmedAt: z.string().datetime(),
})

export type Settlement = z.infer<typeof SettlementSchema>

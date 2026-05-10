/**
 * Zod schemas and inferred types for counterparties.
 *
 * A counterparty is anyone Konfide tracks across trades — an issuer who sends
 * invoices, or a payer who settles them. Counterparties accrue trust scores
 * over time based on on-chain history.
 */
import { z } from 'zod'

export const CounterpartyKindSchema = z.enum(['issuer', 'payer', 'both'])
export type CounterpartyKind = z.infer<typeof CounterpartyKindSchema>

/**
 * Off-chain handle ↔ on-chain wallet mapping for a counterparty.
 */
export const CounterpartySchema = z.object({
  id: z.string().uuid(),
  handle: z.string().min(2).max(64),
  displayName: z.string().min(1).max(120),
  kind: CounterpartyKindSchema,
  primaryWallet: z.string().min(32).max(64),
  jurisdiction: z.string().length(2).nullable(),
  verified: z.boolean(),
  createdAt: z.string().datetime(),
})

export type Counterparty = z.infer<typeof CounterpartySchema>

/**
 * Zod schemas and inferred types for trust scores.
 *
 * Trust scores summarize a counterparty's on-chain trade history. They are
 * recomputed by the indexer; the schema here is the persisted snapshot, not
 * the scoring algorithm (that lives in `@konfide/core`).
 */
import { z } from 'zod'

export const TrustScoreTierSchema = z.enum(['unrated', 'bronze', 'silver', 'gold', 'platinum'])
export type TrustScoreTier = z.infer<typeof TrustScoreTierSchema>

export const TrustScoreFactorsSchema = z.object({
  paymentTimeliness: z.number().min(0).max(1),
  volumeStability: z.number().min(0).max(1),
  disputeRate: z.number().min(0).max(1),
  counterpartyDiversity: z.number().min(0).max(1),
  longevityMonths: z.number().int().min(0),
})

export type TrustScoreFactors = z.infer<typeof TrustScoreFactorsSchema>

export const TrustScoreSchema = z.object({
  counterpartyId: z.string().uuid(),
  score: z.number().int().min(0).max(1000),
  tier: TrustScoreTierSchema,
  factors: TrustScoreFactorsSchema,
  computedAt: z.string().datetime(),
})

export type TrustScore = z.infer<typeof TrustScoreSchema>

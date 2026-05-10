/**
 * Trust score scoring function signatures.
 *
 * The actual scoring algorithm will be implemented in `scoring-service.ts`;
 * this file declares the inputs, the tier thresholds, and the pure helper
 * for mapping a numeric score to a tier.
 */
import type { TrustScoreFactors, TrustScoreTier } from '@konfide/types'

export interface TrustScoreInputs {
  readonly counterpartyId: string
  readonly factors: TrustScoreFactors
}

const TIER_THRESHOLDS: ReadonlyArray<readonly [number, TrustScoreTier]> = [
  [900, 'platinum'],
  [750, 'gold'],
  [500, 'silver'],
  [250, 'bronze'],
]

/**
 * Map a numeric trust score (0–1000) to its tier.
 *
 * @param score - The numeric score.
 * @returns The corresponding tier.
 */
export function tierForScore(score: number): TrustScoreTier {
  for (const [threshold, tier] of TIER_THRESHOLDS) {
    if (score >= threshold) {
      return tier
    }
  }
  return 'unrated'
}

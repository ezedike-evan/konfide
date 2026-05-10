/**
 * `<TrustScoreBadge />` — small badge that visualizes a counterparty's trust
 * tier. Stub component.
 */
import type { TrustScoreTier } from '@konfide/types'

export interface TrustScoreBadgeProps {
  readonly tier: TrustScoreTier
  readonly score: number
}

export function TrustScoreBadge(_props: TrustScoreBadgeProps): null {
  // TODO: implement tier color mapping + accessible label.
  return null
}

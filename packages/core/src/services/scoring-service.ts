/**
 * ScoringService — recomputes a counterparty's trust score from on-chain
 * history. Stub implementation.
 */
import type { TrustScore } from '@konfide/types'
import { NotImplementedError } from '../errors/index.js'
import type { ChainData } from '../ports/index.js'

export interface ScoringServiceDeps {
  readonly chainData: ChainData
}

export class ScoringService {
  private readonly deps: ScoringServiceDeps

  /**
   * @param deps - The ports this service depends on.
   */
  constructor(deps: ScoringServiceDeps) {
    this.deps = deps
  }

  /**
   * Compute the latest trust score for a counterparty.
   *
   * @returns The freshly-computed trust score snapshot.
   */
  refresh(): Promise<TrustScore> {
    throw new NotImplementedError('ScoringService.refresh')
  }
}

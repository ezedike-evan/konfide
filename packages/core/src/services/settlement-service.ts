/**
 * SettlementService — handles the privacy-preserving settlement flow once a
 * payer's funds have arrived through the payment rails. Stub implementation.
 */
import type { Settlement } from '@konfide/types'
import { NotImplementedError } from '../errors/index.js'
import type { Loyalty, PrivacyLayer } from '../ports/index.js'

export interface SettlementServiceDeps {
  readonly privacyLayer: PrivacyLayer
  readonly loyalty: Loyalty
}

export class SettlementService {
  private readonly deps: SettlementServiceDeps

  /**
   * @param deps - The ports this service depends on.
   */
  constructor(deps: SettlementServiceDeps) {
    this.deps = deps
  }

  /**
   * Finalize a settlement and emit the corresponding loyalty events.
   *
   * @returns The recorded settlement.
   */
  finalize(): Promise<Settlement> {
    throw new NotImplementedError('SettlementService.finalize')
  }
}

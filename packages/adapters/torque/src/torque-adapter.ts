/**
 * TorqueLoyalty — implements the `Loyalty` port from `@konfide/core` using
 * Torque's retention primitives. Stub implementation.
 */
import { NotImplementedError } from '@konfide/core'
import type { Loyalty, LoyaltyCampaignReference, LoyaltyEvent } from '@konfide/core/ports'
import { TorqueClient, type TorqueClientConfig } from './client.js'

export class TorqueLoyalty implements Loyalty {
  private readonly client: TorqueClient

  /**
   * @param config - Torque client configuration.
   */
  constructor(config: TorqueClientConfig) {
    this.client = new TorqueClient(config)
  }

  record(_event: LoyaltyEvent): Promise<void> {
    void this.client
    throw new NotImplementedError('TorqueLoyalty.record')
  }

  campaignsFor(_counterpartyId: string): Promise<readonly LoyaltyCampaignReference[]> {
    throw new NotImplementedError('TorqueLoyalty.campaignsFor')
  }
}

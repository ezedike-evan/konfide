/**
 * Port: Loyalty.
 *
 * Abstracts retention primitives — campaigns, rewards, and tier perks for
 * counterparties. Implemented by the Torque adapter.
 */

export interface LoyaltyEvent {
  readonly counterpartyId: string
  readonly kind: 'invoice_settled' | 'invoice_disputed' | 'tier_promoted'
  readonly metadata: Record<string, string | number>
}

export interface LoyaltyCampaignReference {
  readonly id: string
  readonly name: string
}

export interface Loyalty {
  /**
   * Record an event the loyalty engine should consider.
   *
   * @param event - The event to record.
   */
  record(event: LoyaltyEvent): Promise<void>

  /**
   * Fetch active campaigns relevant to the given counterparty.
   *
   * @param counterpartyId - The counterparty to fetch campaigns for.
   * @returns The active campaigns.
   */
  campaignsFor(counterpartyId: string): Promise<readonly LoyaltyCampaignReference[]>
}

/**
 * Port: SettlementRepository.
 *
 * Persistence boundary for the `Settlement` aggregate.
 */
import type { Settlement } from '@konfide/types'

export interface SettlementRepository {
  /**
   * Persist a settlement record. Caller has already validated the settlement
   * against the domain rules.
   *
   * @param settlement - The settlement to persist.
   */
  save(settlement: Settlement): Promise<void>

  /**
   * List settlements for a given invoice. A partially-paid invoice may have
   * multiple settlements; a confirmed invoice typically has one.
   *
   * @param invoiceId - The invoice id.
   * @returns The persisted settlements for that invoice.
   */
  findByInvoiceId(invoiceId: string): Promise<readonly Settlement[]>
}

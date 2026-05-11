/**
 * Port: CounterpartyRepository.
 *
 * Lookup-only port the invoice service uses to resolve recipient handles into
 * counterparty ids and the issuer profile that issued the invoice.
 */
import type { Counterparty } from '@konfide/types'

export interface CounterpartyRepository {
  /**
   * Find a counterparty by its public handle (e.g. `tunde-imports`).
   *
   * @param handle - The handle to look up.
   * @returns The counterparty, or `null` if not found.
   */
  findByHandle(handle: string): Promise<Counterparty | null>

  /**
   * Find a counterparty by id.
   *
   * @param id - The counterparty id.
   * @returns The counterparty, or `null` if not found.
   */
  findById(id: string): Promise<Counterparty | null>
}

/**
 * Port: ChainData.
 *
 * Abstracts on-chain history queries for trust scoring. Implemented by the
 * Covalent adapter — pulls historical transfers and counterparty interactions
 * across the chains Konfide cares about.
 */

export interface CounterpartyHistoryEntry {
  readonly chainId: string
  readonly txSignature: string
  readonly counterpartyAddress: string
  readonly amount: bigint
  readonly currency: string
  readonly direction: 'in' | 'out'
  readonly occurredAt: string
}

export interface ChainData {
  /**
   * Fetch historical transfers for a given wallet across supported chains.
   *
   * @param wallet - The wallet to query.
   * @param sinceIso - Lower bound (ISO datetime); inclusive.
   * @returns The transfer history, newest first.
   */
  fetchHistory(wallet: string, sinceIso: string): Promise<readonly CounterpartyHistoryEntry[]>
}

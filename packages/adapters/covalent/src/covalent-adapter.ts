/**
 * CovalentChainData — implements the `ChainData` port from `@konfide/core`
 * using Covalent's unified-data API. Stub implementation.
 */
import { NotImplementedError } from '@konfide/core'
import type { ChainData, CounterpartyHistoryEntry } from '@konfide/core/ports'
import { CovalentClient, type CovalentClientConfig } from './client.js'

export class CovalentChainData implements ChainData {
  private readonly client: CovalentClient

  /**
   * @param config - Covalent client configuration.
   */
  constructor(config: CovalentClientConfig) {
    this.client = new CovalentClient(config)
  }

  fetchHistory(_wallet: string, _sinceIso: string): Promise<readonly CounterpartyHistoryEntry[]> {
    void this.client
    throw new NotImplementedError('CovalentChainData.fetchHistory')
  }
}

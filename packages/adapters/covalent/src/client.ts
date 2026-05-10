/**
 * Thin Covalent unified-data client.
 *
 * The real implementation will hit the Covalent REST API; for now it is a
 * typed stub.
 */
import { NotImplementedError } from '@konfide/core'

export interface CovalentClientConfig {
  readonly apiKey: string
  readonly baseUrl?: string
}

export class CovalentClient {
  private readonly config: CovalentClientConfig

  /**
   * @param config - Covalent API key and optional base URL.
   */
  constructor(config: CovalentClientConfig) {
    this.config = config
  }

  /**
   * Fetch raw transfer history for a wallet.
   *
   * @param wallet - The wallet address.
   * @returns The raw payload.
   */
  fetchTransfers<T>(_wallet: string): Promise<T> {
    void this.config
    throw new NotImplementedError('CovalentClient.fetchTransfers')
  }
}

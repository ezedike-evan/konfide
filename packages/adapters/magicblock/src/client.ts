/**
 * Thin Magicblock client.
 *
 * Wraps the Magicblock ephemeral-rollup endpoint. Stubbed for now.
 */
import { NotImplementedError } from '@konfide/core'

export interface MagicblockClientConfig {
  readonly apiKey: string
  readonly rpcUrl: string
}

export class MagicblockClient {
  private readonly config: MagicblockClientConfig

  /**
   * @param config - Magicblock API key and rollup RPC URL.
   */
  constructor(config: MagicblockClientConfig) {
    this.config = config
  }

  /**
   * Open an ephemeral rollup session.
   *
   * @returns The session id and rollup endpoint.
   */
  openSession(): Promise<{ id: string; endpoint: string }> {
    void this.config
    throw new NotImplementedError('MagicblockClient.openSession')
  }
}

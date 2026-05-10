/**
 * MagicblockPrivacyLayer — implements the `PrivacyLayer` port using a
 * Magicblock ephemeral rollup. Stub: every method throws.
 */
import { NotImplementedError } from '@konfide/core'
import type { PrivacyLayer, PrivacySession } from '@konfide/core/ports'
import type { Invoice, Settlement } from '@konfide/types'
import { MagicblockClient, type MagicblockClientConfig } from './client.js'

export class MagicblockPrivacyLayer implements PrivacyLayer {
  private readonly client: MagicblockClient

  /**
   * @param config - Magicblock client configuration.
   */
  constructor(config: MagicblockClientConfig) {
    this.client = new MagicblockClient(config)
  }

  beginSession(_invoice: Invoice): Promise<PrivacySession> {
    void this.client
    throw new NotImplementedError('MagicblockPrivacyLayer.beginSession')
  }

  settle(_sessionId: string, _invoice: Invoice): Promise<Settlement> {
    throw new NotImplementedError('MagicblockPrivacyLayer.settle')
  }
}

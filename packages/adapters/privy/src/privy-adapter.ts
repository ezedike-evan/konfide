/**
 * PrivyIdentity — implements the `Identity` port from `@konfide/core` using
 * Privy's auth + embedded-wallet API. Stub implementation.
 */
import { NotImplementedError } from '@konfide/core'
import type { AuthenticatedUser, Identity } from '@konfide/core/ports'
import { PrivyClient, type PrivyClientConfig } from './client.js'

export class PrivyIdentity implements Identity {
  private readonly client: PrivyClient

  /**
   * @param config - Privy client configuration.
   */
  constructor(config: PrivyClientConfig) {
    this.client = new PrivyClient(config)
  }

  verifyToken(_token: string): Promise<AuthenticatedUser | null> {
    void this.client
    throw new NotImplementedError('PrivyIdentity.verifyToken')
  }

  ensureWallet(_userId: string, _chainId: string): Promise<string> {
    throw new NotImplementedError('PrivyIdentity.ensureWallet')
  }
}

/**
 * Thin Privy client.
 *
 * Wraps Privy's server-side token verification + embedded-wallet API.
 * Stubbed for now.
 */
import { NotImplementedError } from '@konfide/core'

export interface PrivyClientConfig {
  readonly appId: string
  readonly appSecret: string
}

export class PrivyClient {
  private readonly config: PrivyClientConfig

  /**
   * @param config - Privy app credentials.
   */
  constructor(config: PrivyClientConfig) {
    this.config = config
  }

  /**
   * Verify a Privy session token.
   *
   * @param token - The session token.
   */
  verify<T>(_token: string): Promise<T> {
    void this.config
    throw new NotImplementedError('PrivyClient.verify')
  }
}

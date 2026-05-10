/**
 * Thin Torque client.
 *
 * Wraps the Torque retention API. Stubbed for now.
 */
import { NotImplementedError } from '@konfide/core'

export interface TorqueClientConfig {
  readonly apiKey: string
  readonly baseUrl?: string
}

export class TorqueClient {
  private readonly config: TorqueClientConfig

  /**
   * @param config - Torque API key and optional base URL.
   */
  constructor(config: TorqueClientConfig) {
    this.config = config
  }

  /**
   * Send an event to Torque.
   *
   * @param payload - The event payload.
   */
  emit(_payload: Record<string, unknown>): Promise<void> {
    void this.config
    throw new NotImplementedError('TorqueClient.emit')
  }
}

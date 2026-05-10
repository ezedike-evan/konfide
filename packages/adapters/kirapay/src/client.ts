/**
 * Thin Kirapay HTTP client.
 *
 * The real implementation will wrap the Kirapay REST/SDK surface; for now
 * this is a typed stub so the adapter compiles against a stable seam.
 */
import { NotImplementedError } from '@konfide/core'

export interface KirapayClientConfig {
  readonly apiKey: string
  readonly baseUrl?: string
}

export class KirapayClient {
  private readonly config: KirapayClientConfig

  /**
   * @param config - The Kirapay API key and optional base URL.
   */
  constructor(config: KirapayClientConfig) {
    this.config = config
  }

  /**
   * Issue a raw HTTP request against the Kirapay API.
   *
   * @param path - The API path (e.g. `/v1/quotes`).
   * @param init - The fetch init.
   * @returns The parsed JSON response.
   */
  request<T>(_path: string, _init?: RequestInit): Promise<T> {
    void this.config
    throw new NotImplementedError('KirapayClient.request')
  }
}

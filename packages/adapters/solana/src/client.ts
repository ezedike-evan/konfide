/**
 * KonfideProgramClient — typed wrapper around the on-chain Konfide Anchor
 * program. Stubbed: methods will be filled in once the IDL is generated.
 */
import { NotImplementedError } from '@konfide/core'
import { KONFIDE_PROGRAM_ID, type KonfideIdl } from './idl.js'

export interface KonfideProgramClientConfig {
  readonly rpcUrl: string
  readonly programId?: string
}

export class KonfideProgramClient {
  readonly programId: string
  private readonly rpcUrl: string

  /**
   * @param config - RPC URL and optional program-id override.
   */
  constructor(config: KonfideProgramClientConfig) {
    this.rpcUrl = config.rpcUrl
    this.programId = config.programId ?? KONFIDE_PROGRAM_ID
  }

  /**
   * Submit the `create_invoice` instruction.
   *
   * @returns The transaction signature.
   */
  createInvoice(): Promise<string> {
    void this.rpcUrl
    throw new NotImplementedError('KonfideProgramClient.createInvoice')
  }

  /**
   * Submit the `settle_invoice` instruction.
   *
   * @returns The transaction signature.
   */
  settleInvoice(): Promise<string> {
    throw new NotImplementedError('KonfideProgramClient.settleInvoice')
  }

  /**
   * Submit the `record_dispute` instruction.
   *
   * @returns The transaction signature.
   */
  recordDispute(): Promise<string> {
    throw new NotImplementedError('KonfideProgramClient.recordDispute')
  }

  /** Return the (stub) IDL the client is bound to. */
  idl(): KonfideIdl {
    return { version: '0.1.0', name: 'konfide' }
  }
}

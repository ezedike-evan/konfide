/**
 * KonfideProgramClient — typed wrapper around the on-chain Konfide Anchor
 * program.
 *
 * Reader: the API composition root, which calls `submitSettlement` after a
 * confirmed KIRAPAY webhook. The settlement instruction is best-effort and
 * idempotent on-chain; transient devnet errors are retried with exponential
 * backoff up to 3 times. Logical errors (already recorded, bad accounts) are
 * NOT retried.
 *
 * NOTE: Until `anchor build` produces a real IDL and the program is deployed
 * to devnet, the implementation logs the call shape but does not submit a
 * transaction. This keeps the API server runnable end-to-end without a live
 * Solana cluster — the surface stays the same once the program is deployed.
 */
import { readFile } from 'node:fs/promises'
import type {
  SettlementRecorder,
  SettlementRecorderInput,
} from '@konfide/core/ports'
import { KONFIDE_PROGRAM_ID, type KonfideIdl } from './idl.js'

const DEFAULT_RPC_URL = 'https://api.devnet.solana.com'
const MAX_RETRIES = 3

export interface KonfideProgramClientConfig {
  readonly rpcUrl: string
  readonly programId?: string
  /** Path to the JSON keypair file used to pay fees. Defaults to env. */
  readonly payerKeypairPath?: string
}

/** Loaded service keypair — secret bytes plus pubkey base58. */
interface LoadedKeypair {
  readonly secretBytes: Uint8Array
  readonly publicKey: string
}

export class KonfideProgramClient implements SettlementRecorder {
  readonly programId: string
  private readonly rpcUrl: string
  private readonly payerKeypairPath: string | null
  private cachedKeypair: LoadedKeypair | null = null

  /**
   * @param config - RPC URL, optional program-id override, optional keypair path.
   */
  constructor(config: KonfideProgramClientConfig) {
    this.rpcUrl = config.rpcUrl || DEFAULT_RPC_URL
    this.programId = config.programId ?? KONFIDE_PROGRAM_ID
    this.payerKeypairPath =
      config.payerKeypairPath ?? process.env.SOLANA_PAYER_KEYPAIR_PATH ?? null
  }

  /**
   * Submit the `settle_invoice` instruction for an invoice.
   *
   * @param input - Invoice id, atomic amount, recipient.
   * @returns The transaction signature on success.
   */
  async submitSettlement(input: SettlementRecorderInput): Promise<string> {
    let lastError: unknown
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        return await this.submitOnce(input)
      } catch (err) {
        lastError = err
        if (this.isLogicalError(err)) {
          throw err
        }
        await new Promise((resolve) => setTimeout(resolve, 2 ** attempt * 250))
      }
    }
    throw lastError instanceof Error
      ? lastError
      : new Error(`submitSettlement failed after ${MAX_RETRIES} attempts`)
  }

  /** Returns the IDL header. Real IDL ships once `anchor build` runs. */
  idl(): KonfideIdl {
    return { version: '0.1.0', name: 'konfide' }
  }

  private async submitOnce(input: SettlementRecorderInput): Promise<string> {
    // [TBD] Replace this stub once the IDL is generated and the program is
    // deployed. The wire-up is:
    //   1. Build a Connection at this.rpcUrl
    //   2. Build the program from the IDL + this.programId
    //   3. Load the payer keypair via `ensureKeypair`
    //   4. Derive the settlement PDA: ["settlement", invoiceIdBytes]
    //   5. Send `settle_invoice(invoiceIdBytes, amountAtomic, recipientPubkey)`
    //   6. Return the signature
    //
    // For now, log the call shape and synthesize a deterministic stub
    // signature so the rest of the API can flow end-to-end without a live
    // Solana cluster.
    if (this.payerKeypairPath) {
      try {
        await this.ensureKeypair()
      } catch (err) {
        console.warn('[konfide-program] keypair unavailable; continuing in stub mode', {
          error: err instanceof Error ? err.message : String(err),
        })
      }
    }
    const stubSignature = `STUB_${input.invoiceId.replace(/-/g, '')}_${input.amountAtomic.toString()}`
    console.log('[konfide-program] submitSettlement (stub)', {
      programId: this.programId,
      rpcUrl: this.rpcUrl,
      invoiceId: input.invoiceId,
      amountAtomic: input.amountAtomic.toString(),
      recipient: input.recipient,
      stubSignature,
    })
    return stubSignature
  }

  private isLogicalError(err: unknown): boolean {
    const message = err instanceof Error ? err.message : String(err)
    return /already.*settled|bad.*account|invalid.*pda/i.test(message)
  }

  private async ensureKeypair(): Promise<LoadedKeypair> {
    if (this.cachedKeypair) return this.cachedKeypair
    if (!this.payerKeypairPath) {
      throw new Error('SOLANA_PAYER_KEYPAIR_PATH not set')
    }
    const buf = await readFile(this.payerKeypairPath, 'utf8')
    const parsed = JSON.parse(buf) as number[]
    if (!Array.isArray(parsed) || parsed.length < 32) {
      throw new Error(`malformed keypair file at ${this.payerKeypairPath}`)
    }
    const secretBytes = Uint8Array.from(parsed)
    this.cachedKeypair = { secretBytes, publicKey: '<deferred>' }
    return this.cachedKeypair
  }
}

import { randomUUID } from 'node:crypto'
import {
  InvoiceService,
  systemClock,
  type Clock,
  type IdGenerator,
  type SettlementRecorder,
} from '@konfide/core'
import {
  KirapayClient,
  KirapayPaymentRouter,
} from '@konfide/adapter-kirapay'
import { KonfideProgramClient } from '@konfide/adapter-solana'
import { getDb } from './db/index.js'
import { CounterpartyRepositoryDrizzle } from './repositories/counterparty-repository-drizzle.js'
import { InvoiceRepositoryDrizzle } from './repositories/invoice-repository-drizzle.js'
import { SettlementRepositoryDrizzle } from './repositories/settlement-repository-drizzle.js'
import { WebhookEventRepositoryDrizzle } from './repositories/webhook-event-repository-drizzle.js'

export interface Env {
  readonly DATABASE_URL: string
  readonly KIRAPAY_API_KEY: string
  readonly KIRAPAY_BASE_URL?: string
  readonly KIRAPAY_WEBHOOK_SECRET: string
  readonly KIRAPAY_SETTLEMENT_CHAIN_ID: string
  readonly KIRAPAY_SETTLEMENT_TOKEN_ADDRESS: string
  readonly KIRAPAY_SETTLEMENT_RECEIVER: string
  readonly SOLANA_RPC_URL?: string
  readonly APP_BASE_URL?: string
  readonly KONFIDE_ISSUER_HANDLE: string
}

function readEnv(name: keyof Env, optional = false): string {
  const v = process.env[name as string]
  if (!v && !optional) {
    throw new Error(`[konfide/api] env var ${String(name)} is not set`)
  }
  return v ?? ''
}

/** The full set of services exposed to HTTP routes and workers. */
export interface AppContext {
  readonly env: Env
  readonly clock: Clock
  readonly idGenerator: IdGenerator
  readonly invoiceService: InvoiceService
  readonly invoices: InvoiceRepositoryDrizzle
  readonly settlements: SettlementRepositoryDrizzle
  readonly counterparties: CounterpartyRepositoryDrizzle
  readonly webhookEvents: WebhookEventRepositoryDrizzle
  readonly settlementRecorder: SettlementRecorder | null
}

let cachedContext: AppContext | null = null

/**
 * Build (or return the cached) `AppContext`. Idempotent.
 *
 * @returns The composed app context.
 */
export function getAppContext(): AppContext {
  if (cachedContext) return cachedContext

  const env: Env = {
    DATABASE_URL: readEnv('DATABASE_URL'),
    KIRAPAY_API_KEY: readEnv('KIRAPAY_API_KEY'),
    KIRAPAY_WEBHOOK_SECRET: readEnv('KIRAPAY_WEBHOOK_SECRET'),
    KIRAPAY_SETTLEMENT_CHAIN_ID: process.env.KIRAPAY_SETTLEMENT_CHAIN_ID ?? 'sol',
    KIRAPAY_SETTLEMENT_TOKEN_ADDRESS:
      process.env.KIRAPAY_SETTLEMENT_TOKEN_ADDRESS ?? 'SOL',
    KIRAPAY_SETTLEMENT_RECEIVER: readEnv('KIRAPAY_SETTLEMENT_RECEIVER'),
    KONFIDE_ISSUER_HANDLE: process.env.KONFIDE_ISSUER_HANDLE ?? 'konfide-demo',
    ...(process.env.KIRAPAY_BASE_URL ? { KIRAPAY_BASE_URL: process.env.KIRAPAY_BASE_URL } : {}),
    ...(process.env.SOLANA_RPC_URL ? { SOLANA_RPC_URL: process.env.SOLANA_RPC_URL } : {}),
    ...(process.env.APP_BASE_URL ? { APP_BASE_URL: process.env.APP_BASE_URL } : {}),
  }

  const db = getDb()
  const clock = systemClock
  const idGenerator: IdGenerator = { uuid: () => randomUUID() }

  const kirapayClient = new KirapayClient({
    apiKey: env.KIRAPAY_API_KEY,
    ...(env.KIRAPAY_BASE_URL ? { baseUrl: env.KIRAPAY_BASE_URL } : {}),
  })
  // Note: `receiverAddress` is intentionally NOT passed here. Konfide is
  // non-custodial — `InvoiceService` resolves the settlement receiver from
  // the issuer counterparty's `primaryWallet` per invoice and forwards it via
  // `createSession({ settlementReceiver })`. The env value is supplied to the
  // service as a fallback for legacy rows, not to the adapter.
  const paymentRouter = new KirapayPaymentRouter({
    client: kirapayClient,
    settlement: {
      chainId: env.KIRAPAY_SETTLEMENT_CHAIN_ID,
      tokenAddress: env.KIRAPAY_SETTLEMENT_TOKEN_ADDRESS,
      fiatCurrency: 'USD',
      ...(env.APP_BASE_URL ? { appBaseUrl: env.APP_BASE_URL } : {}),
    },
  })

  const invoices = new InvoiceRepositoryDrizzle(db, clock)
  const settlements = new SettlementRepositoryDrizzle(db)
  const counterparties = new CounterpartyRepositoryDrizzle(db)
  const webhookEvents = new WebhookEventRepositoryDrizzle(db)

  const settlementRecorder: SettlementRecorder | null = env.SOLANA_RPC_URL
    ? new KonfideProgramClient({ rpcUrl: env.SOLANA_RPC_URL })
    : null

  const invoiceService = new InvoiceService({
    paymentRouter,
    invoices,
    settlements,
    counterparties,
    clock,
    idGenerator,
    fallbackSettlementWallet: env.KIRAPAY_SETTLEMENT_RECEIVER,
    ...(settlementRecorder ? { settlementRecorder } : {}),
    logger: {
      info: (msg, meta) => console.log(`[invoice-service] ${msg}`, meta ?? {}),
      error: (msg, meta) => console.error(`[invoice-service] ${msg}`, meta ?? {}),
    },
  })

  cachedContext = {
    env,
    clock,
    idGenerator,
    invoiceService,
    invoices,
    settlements,
    counterparties,
    webhookEvents,
    settlementRecorder,
  }
  return cachedContext
}

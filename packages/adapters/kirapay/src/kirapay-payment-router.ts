/**
 * `KirapayPaymentRouter` — implementation of the `PaymentRouter` port using
 * KIRAPAY's hosted-link product, settling on Solana.
 *
 * Reader: anyone wiring KIRAPAY into the API. This adapter is the seam
 * between the domain (which knows nothing about KIRAPAY) and the KIRAPAY
 * REST API. The mapping is intentionally narrow:
 *   - `quote`           → static fee estimate; KIRAPAY does not expose a
 *                         quote endpoint.
 *   - `createSession`   → POST /api/link/generate with `tokenOut`
 *                         `{ chainId: "sol", address: "SOL" }`. The Konfide
 *                         invoice id is sent as `customOrderId` — that is the
 *                         only reconciliation key between our DB and a
 *                         KIRAPAY transaction.
 *   - `resolveSession`  → GET /api/wallet/transactions filtered by the
 *                         `customOrderId` we sent in. Used only as a polling
 *                         fallback for missed webhooks.
 */
import { SettlementStatus } from '@konfide/core'
import type {
  PaymentRouteQuote,
  PaymentRouter,
  PaymentSession,
} from '@konfide/core/ports'
import type { Invoice, Settlement } from '@konfide/types'
import { KirapayClient, type KirapayClientConfig } from './client.js'
import type { TransactionListItem } from './schemas.js'

/** Static fee estimate constants — KIRAPAY does not expose a quote endpoint. */
const PROTOCOL_FEE_BPS = 25
/**
 * Placeholder routing fee for the static estimate returned by `quote()`.
 * Adjust once KIRAPAY publishes pricing or once we have telemetry across
 * real settled transactions.
 */
const KIRAPAY_ROUTING_FEE_BPS = 30

/** Default settlement-token = native SOL on Solana. */
const DEFAULT_SETTLEMENT_CHAIN_ID = 'sol'
const DEFAULT_SETTLEMENT_TOKEN_ADDRESS = 'SOL'
const DEFAULT_SETTLEMENT_CURRENCY = 'SOL'
const SOL_LAMPORTS_PER_UNIT = 1_000_000_000n
const FIAT_MICRO_PER_UNIT = 1_000_000n

/** Settlement target Konfide tells KIRAPAY to pay out to. */
export interface KirapaySettlementConfig {
  /** KIRAPAY chainId for the settlement chain. Defaults to `"sol"`. */
  readonly chainId?: string
  /** KIRAPAY token address for the settlement token. Defaults to `"SOL"`. */
  readonly tokenAddress?: string
  /** Settlement-token symbol surfaced to the UI. Defaults to `"SOL"`. */
  readonly tokenSymbol?: string
  /** Solana base58 pubkey that should receive settled funds. */
  readonly receiverAddress: string
  /** Default fiat currency for new invoices. Defaults to `"USD"`. */
  readonly fiatCurrency?: string
  /** Public base URL used to build the KIRAPAY `redirectUrl`. */
  readonly appBaseUrl?: string
}

export interface KirapayPaymentRouterDeps {
  readonly client: KirapayClient
  readonly settlement: KirapaySettlementConfig
}

/**
 * Construct a `KirapayPaymentRouter` directly from a client config — handy
 * for the API composition root.
 */
export function createKirapayPaymentRouter(
  config: KirapayClientConfig & KirapaySettlementConfig,
): KirapayPaymentRouter {
  const clientConfig: KirapayClientConfig = { apiKey: config.apiKey }
  if (config.baseUrl !== undefined) Object.assign(clientConfig, { baseUrl: config.baseUrl })
  if (config.fetchImpl !== undefined) Object.assign(clientConfig, { fetchImpl: config.fetchImpl })

  const settlement: KirapaySettlementConfig = { receiverAddress: config.receiverAddress }
  if (config.chainId !== undefined) Object.assign(settlement, { chainId: config.chainId })
  if (config.tokenAddress !== undefined)
    Object.assign(settlement, { tokenAddress: config.tokenAddress })
  if (config.tokenSymbol !== undefined)
    Object.assign(settlement, { tokenSymbol: config.tokenSymbol })
  if (config.fiatCurrency !== undefined)
    Object.assign(settlement, { fiatCurrency: config.fiatCurrency })
  if (config.appBaseUrl !== undefined)
    Object.assign(settlement, { appBaseUrl: config.appBaseUrl })

  return new KirapayPaymentRouter({
    client: new KirapayClient(clientConfig),
    settlement,
  })
}

/**
 * Map a KIRAPAY transaction status to the in-flight `SettlementStatus` enum.
 *
 * @param status - The PascalCase string returned by KIRAPAY.
 * @returns The matching `SettlementStatus`.
 */
export function mapKirapayStatusToSettlementStatus(
  status:
    | 'Pending'
    | 'Success'
    | 'Failed'
    | 'Cancel'
    | 'Refunding'
    | 'Refunded'
    | 'RefundedByRelay',
): SettlementStatus {
  return SettlementStatus[status]
}

export class KirapayPaymentRouter implements PaymentRouter {
  private readonly client: KirapayClient
  private readonly settlement: KirapaySettlementConfig

  constructor(deps: KirapayPaymentRouterDeps) {
    this.client = deps.client
    this.settlement = deps.settlement
  }

  /**
   * Static fee estimate. KIRAPAY does not expose a quote API; we surface
   * Konfide's protocol fee plus a constant placeholder routing fee. Re-tune
   * once we have settled-transaction telemetry.
   *
   * @param invoice - Invoice being paid.
   * @param fromChain - Source chain id (ignored; KIRAPAY chooses the route).
   * @returns A single-element list with the static estimate.
   */
  async quote(
    invoice: Invoice,
    fromChain: string,
  ): Promise<readonly PaymentRouteQuote[]> {
    void fromChain
    const quote: PaymentRouteQuote = {
      route: 'kirapay_sol_direct',
      payAmount: invoice.total,
      receiveAmount: invoice.total,
      estimatedSeconds: 60,
      feesBps: PROTOCOL_FEE_BPS + KIRAPAY_ROUTING_FEE_BPS,
    }
    return [quote]
  }

  /**
   * Create a hosted KIRAPAY payment link for the given invoice. The returned
   * `PaymentSession.id` is the Konfide invoice id (which we sent as
   * `customOrderId`) — that is the reconciliation key for both inbound
   * webhooks and `resolveSession`. `PaymentSession.checkoutUrl` is what the
   * payer page redirects to.
   *
   * @param invoice - The invoice the payer is settling.
   * @param route - Quote route id; ignored, retained for port compatibility.
   * @returns The hosted-checkout session augmented with fiat/crypto fields.
   */
  async createSession(invoice: Invoice, route: string): Promise<PaymentSession> {
    void route
    const chainId = this.settlement.chainId ?? DEFAULT_SETTLEMENT_CHAIN_ID
    const tokenAddress = this.settlement.tokenAddress ?? DEFAULT_SETTLEMENT_TOKEN_ADDRESS
    const tokenSymbol = this.settlement.tokenSymbol ?? DEFAULT_SETTLEMENT_CURRENCY
    const fiatCurrency =
      this.settlement.fiatCurrency ?? invoice.total.currency ?? 'USD'

    const redirectUrl = this.settlement.appBaseUrl
      ? `${this.settlement.appBaseUrl}/pay/${invoice.id}/return`
      : undefined

    const fiatAmountNumber = bigintToFiatNumber(invoice.total.amount)

    const response = await this.client.generatePaymentLink({
      tokenOut: { chainId, address: tokenAddress },
      receiver: this.settlement.receiverAddress,
      originalPrice: fiatAmountNumber,
      fiatCurrency,
      name: `Konfide invoice ${invoice.id}`,
      customOrderId: invoice.id,
      type: 'single_use',
      isViewAsCrypto: false,
      ...(redirectUrl !== undefined ? { redirectUrl } : {}),
    })

    return {
      id: invoice.id,
      checkoutUrl: response.data.url,
      expiresAt: invoice.dueAt,
      fiatAmount: response.data.originalPrice,
      fiatCurrency,
      cryptoAmount: response.data.price,
      cryptoCurrency: tokenSymbol,
    }
  }

  /**
   * Polling fallback for missed webhooks. Looks up transactions for our
   * `customOrderId`, picks the latest, and — only if its status is
   * `Success` — returns a `Settlement`. Returns `null` otherwise (the
   * caller's invoice stays in `awaiting_payment`).
   *
   * @param sessionId - The Konfide invoice id used as `customOrderId`.
   * @returns The resolved settlement, or `null` if not yet `Success`.
   */
  async resolveSession(sessionId: string): Promise<Settlement | null> {
    const list = await this.client.listTransactions({
      customOrderId: sessionId,
      limit: 5,
    })
    const latest = pickLatestForOrderId(list.data.transactions, sessionId)
    if (!latest || latest.status !== 'Success') return null

    return buildSettlementFromListItem(latest, sessionId, this.settlement)
  }
}

/**
 * Convert a Konfide minor-unit fiat amount (micro-USD) back to the
 * KIRAPAY-facing decimal `originalPrice`. Inverse of the `× 1_000_000`
 * scaling done at the API edge.
 */
function bigintToFiatNumber(amount: bigint): number {
  const whole = amount / FIAT_MICRO_PER_UNIT
  const fraction = amount % FIAT_MICRO_PER_UNIT
  return Number(whole) + Number(fraction) / Number(FIAT_MICRO_PER_UNIT)
}

/** Convert a SOL decimal amount to lamports. */
function solDecimalToLamports(sol: number): bigint {
  if (!Number.isFinite(sol) || sol < 0) return 0n
  return BigInt(Math.round(sol * Number(SOL_LAMPORTS_PER_UNIT)))
}

function pickLatestForOrderId(
  rows: readonly TransactionListItem[],
  orderId: string,
): TransactionListItem | null {
  const matches = rows.filter((r) => r.customOrderId === orderId || r.customOrderId == null)
  if (matches.length === 0) return rows[0] ?? null
  return (
    matches.slice().sort((a, b) => {
      const ta = a.updatedAt ?? a.createdAt ?? ''
      const tb = b.updatedAt ?? b.createdAt ?? ''
      return tb.localeCompare(ta)
    })[0] ?? null
  )
}

function buildSettlementFromListItem(
  row: TransactionListItem,
  invoiceId: string,
  settlement: KirapaySettlementConfig,
): Settlement {
  const tokenSymbol = settlement.tokenSymbol ?? DEFAULT_SETTLEMENT_CURRENCY
  const settlementAmount =
    typeof row.settlementAmount === 'string'
      ? Number.parseFloat(row.settlementAmount)
      : (row.settlementAmount ?? 0)
  const priceLink = row.priceLink ?? 0
  const confirmedAt = row.updatedAt ?? row.createdAt ?? new Date(0).toISOString()
  const txSignature = row.outTxHash ?? row.hash ?? row.inputTransactionHash ?? row._id

  return {
    id: crypto.randomUUID(),
    invoiceId,
    route: 'kirapay_direct',
    paidBy: row.sender ?? 'unknown',
    paidAmount: {
      amount: BigInt(Math.round(priceLink * Number(FIAT_MICRO_PER_UNIT))),
      currency: settlement.fiatCurrency ?? 'USD',
    },
    receivedAmount: {
      amount: solDecimalToLamports(settlementAmount),
      currency: tokenSymbol,
    },
    txSignature,
    chainId: `kirapay:${settlement.chainId ?? DEFAULT_SETTLEMENT_CHAIN_ID}`,
    confirmedAt,
  }
}

/**
 * KirapayClient — typed HTTP wrapper around the real KIRAPAY REST API.
 *
 * Reader: any code that needs to talk to KIRAPAY. Every outbound call goes
 * through this class — no `fetch` to KIRAPAY happens elsewhere in the
 * codebase. Responses are validated with strict Zod schemas (see
 * `schemas.ts`); failures surface as `KirapayApiError` with the upstream
 * status, code, and message.
 *
 * Endpoint coverage:
 *   - generatePaymentLink   → POST /api/link/generate
 *   - registerWebhook       → POST /api/webhooks
 *   - getTransaction        → GET  /api/wallet/transactions/{id}
 *   - getTransactionByHash  → GET  /api/wallet/transactions/status/{hash}
 *   - listTransactions      → GET  /api/wallet/transactions
 *
 * Auth is `x-api-key: <KIRAPAY_API_KEY>` on every authed endpoint.
 */
import { z } from 'zod'
import {
  KirapayErrorBodySchema,
  type KirapayLinkType,
  type KirapayRefundStatusFilter,
  type KirapayTokenOut,
  type KirapayTransactionStatus,
  PaymentLinkResponseSchema,
  type PaymentLinkResponse,
  TransactionDetailSchema,
  type TransactionDetail,
  TransactionListResponseSchema,
  type TransactionListResponse,
  TransactionStatusResponseSchema,
  type TransactionStatusResponse,
  WebhookRegistrationResponseSchema,
  type WebhookRegistrationResponse,
} from './schemas.js'

const DEFAULT_BASE_URL = 'https://api.kira-pay.com'

/** Configuration accepted by `KirapayClient`. */
export interface KirapayClientConfig {
  readonly apiKey: string
  readonly baseUrl?: string
  /** Override the global `fetch` (mainly for tests). */
  readonly fetchImpl?: typeof fetch
}

/** Body for `POST /api/link/generate` — Konfide-friendly shape. */
export interface GeneratePaymentLinkParams {
  readonly tokenOut: KirapayTokenOut
  readonly receiver: string
  readonly originalPrice: number
  readonly fiatCurrency?: string
  readonly name?: string
  readonly customOrderId?: string
  readonly redirectUrl?: string
  readonly type?: KirapayLinkType
  readonly isViewAsCrypto?: boolean
  readonly cryptoCurrency?: string | null
}

/** Body for `POST /api/webhooks`. */
export interface RegisterWebhookParams {
  readonly url: string
  readonly secret: string
}

/** Query for `GET /api/wallet/transactions`. */
export interface ListTransactionsParams {
  readonly status?: KirapayTransactionStatus
  /** Free-text key search — matches tx id, hash, customOrderId, etc. */
  readonly key?: string
  readonly customOrderId?: string
  readonly transactionHash?: string
  readonly fromDate?: string
  readonly toDate?: string
  readonly amountMin?: number
  readonly amountMax?: number
  readonly currency?: string
  readonly customerAddress?: string
  readonly refundStatus?: KirapayRefundStatusFilter
  readonly paymentLinkId?: string
  readonly projectId?: string
  readonly page?: number
  readonly limit?: number
}

/**
 * Typed error thrown when KIRAPAY returns a non-2xx response or an
 * unparseable body. Surfaces the upstream HTTP status, a derived code
 * (KIRAPAY's error envelope uses `statusCode`), and the human-readable
 * message so callers can log/branch without parsing strings.
 */
export class KirapayApiError extends Error {
  readonly status: number
  readonly code: string

  constructor(status: number, code: string, message: string) {
    super(`[kirapay ${status}] ${code}: ${message}`)
    this.name = 'KirapayApiError'
    this.status = status
    this.code = code
  }
}

export class KirapayClient {
  private readonly apiKey: string
  private readonly baseUrl: string
  private readonly fetchImpl: typeof fetch

  constructor(config: KirapayClientConfig) {
    this.apiKey = config.apiKey
    this.baseUrl = (config.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, '')
    this.fetchImpl = config.fetchImpl ?? fetch
  }

  /**
   * Create a hosted payment link via `POST /api/link/generate`.
   *
   * @param params - Token-out / receiver / price plus optional checkout fields.
   * @returns Parsed link response: `{ url, price, originalPrice }` in `data`.
   * @throws {KirapayApiError} On non-2xx responses or schema mismatch.
   */
  async generatePaymentLink(
    params: GeneratePaymentLinkParams,
  ): Promise<PaymentLinkResponse> {
    const body: Record<string, unknown> = {
      tokenOut: params.tokenOut,
      receiver: params.receiver,
      originalPrice: params.originalPrice,
    }
    if (params.fiatCurrency !== undefined) body.fiatCurrency = params.fiatCurrency
    if (params.name !== undefined) body.name = params.name
    if (params.customOrderId !== undefined) body.customOrderId = params.customOrderId
    if (params.redirectUrl !== undefined) body.redirectUrl = params.redirectUrl
    if (params.type !== undefined) body.type = params.type
    if (params.isViewAsCrypto !== undefined) body.isViewAsCrypto = params.isViewAsCrypto
    if (params.cryptoCurrency !== undefined) body.cryptoCurrency = params.cryptoCurrency

    return this.requestJson(
      '/api/link/generate',
      'POST',
      body,
      PaymentLinkResponseSchema,
    )
  }

  /**
   * Register (or update) the webhook endpoint for this API key via
   * `POST /api/webhooks`. KIRAPAY stores the `secret` exactly as we send it;
   * we use it later to sign-verify inbound webhook bodies.
   */
  async registerWebhook(
    params: RegisterWebhookParams,
  ): Promise<WebhookRegistrationResponse> {
    return this.requestJson(
      '/api/webhooks',
      'POST',
      { url: params.url, secret: params.secret },
      WebhookRegistrationResponseSchema,
    )
  }

  /** `GET /api/wallet/transactions/{id}` — full transaction detail. */
  async getTransaction(id: string): Promise<TransactionDetail> {
    return this.requestJson(
      `/api/wallet/transactions/${encodeURIComponent(id)}`,
      'GET',
      undefined,
      TransactionDetailSchema,
    )
  }

  /** `GET /api/wallet/transactions/status/{hash}` — status-only lookup. */
  async getTransactionByHash(hash: string): Promise<TransactionStatusResponse> {
    return this.requestJson(
      `/api/wallet/transactions/status/${encodeURIComponent(hash)}`,
      'GET',
      undefined,
      TransactionStatusResponseSchema,
    )
  }

  /**
   * `GET /api/wallet/transactions` — filterable list.
   *
   * Note KIRAPAY does not expose a dedicated `customOrderId` filter; both
   * `customOrderId` and `key` map to the documented `key` query parameter
   * which is a free-text search across tx id / hash / customOrderId / etc.
   * Callers that need exact-match by `customOrderId` should re-filter the
   * returned `transactions` array.
   */
  async listTransactions(
    params: ListTransactionsParams = {},
  ): Promise<TransactionListResponse> {
    const query = new URLSearchParams()
    if (params.status !== undefined) query.set('status', params.status)
    const searchKey = params.customOrderId ?? params.key
    if (searchKey !== undefined) query.set('key', searchKey)
    if (params.transactionHash !== undefined)
      query.set('transaction_hash', params.transactionHash)
    if (params.fromDate !== undefined) query.set('from_date', params.fromDate)
    if (params.toDate !== undefined) query.set('to_date', params.toDate)
    if (params.amountMin !== undefined)
      query.set('amount_min', params.amountMin.toString())
    if (params.amountMax !== undefined)
      query.set('amount_max', params.amountMax.toString())
    if (params.currency !== undefined) query.set('currency', params.currency)
    if (params.customerAddress !== undefined)
      query.set('customer_address', params.customerAddress)
    if (params.refundStatus !== undefined)
      query.set('refund_status', params.refundStatus)
    if (params.paymentLinkId !== undefined)
      query.set('payment_link_id', params.paymentLinkId)
    if (params.projectId !== undefined) query.set('project_id', params.projectId)
    if (params.page !== undefined) query.set('page', params.page.toString())
    if (params.limit !== undefined) query.set('limit', params.limit.toString())

    const suffix = query.size > 0 ? `?${query.toString()}` : ''
    return this.requestJson(
      `/api/wallet/transactions${suffix}`,
      'GET',
      undefined,
      TransactionListResponseSchema,
    )
  }

  private async requestJson<TSchema extends z.ZodTypeAny>(
    path: string,
    method: 'GET' | 'POST',
    body: Record<string, unknown> | undefined,
    schema: TSchema,
  ): Promise<z.infer<TSchema>> {
    const init: RequestInit = {
      method,
      headers: {
        Accept: 'application/json',
        'x-api-key': this.apiKey,
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    }

    const res = await this.fetchImpl(`${this.baseUrl}${path}`, init)
    const text = await res.text()

    if (!res.ok) {
      const parsed = this.parseErrorBody(text)
      throw new KirapayApiError(
        res.status,
        parsed.code ?? `http_${res.status}`,
        parsed.message ?? `request to ${path} failed`,
      )
    }

    let raw: unknown
    try {
      raw = text.length === 0 ? {} : JSON.parse(text)
    } catch {
      throw new KirapayApiError(res.status, 'invalid_json', `non-JSON response from ${path}`)
    }

    const result = schema.safeParse(raw)
    if (!result.success) {
      throw new KirapayApiError(
        res.status,
        'schema_mismatch',
        `unexpected response shape from ${path}: ${result.error.message}`,
      )
    }
    return result.data as z.infer<TSchema>
  }

  private parseErrorBody(text: string): { code?: string; message?: string } {
    if (text.length === 0) return {}
    try {
      const parsed = KirapayErrorBodySchema.safeParse(JSON.parse(text))
      if (!parsed.success) return { message: text.slice(0, 500) }
      const code =
        parsed.data.statusCode !== undefined
          ? `http_${parsed.data.statusCode}`
          : undefined
      const message = parsed.data.message ?? text.slice(0, 500)
      return code !== undefined ? { code, message } : { message }
    } catch {
      return { message: text.slice(0, 500) }
    }
  }
}

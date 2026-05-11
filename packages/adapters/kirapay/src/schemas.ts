/**
 * Zod schemas for the real KIRAPAY REST API.
 *
 * Source of truth: KIRAPAY API reference excerpts shipped with this rewrite.
 * Every response the `KirapayClient` parses and every webhook event payload
 * is defined here. All object schemas are `.strict()` so unexpected upstream
 * fields surface as `KirapayApiError` (`schema_mismatch`) rather than being
 * silently dropped.
 *
 * Two areas are explicitly marked TBD where KIRAPAY's public docs do not
 * (yet) define the wire shape; downstream callers must treat those parses as
 * best-guesses until KIRAPAY publishes a spec or returns a real payload:
 *   - {@link KirapayWebhookEventSchema} — event payload shape
 *   - signature scheme (see `verify-webhook.ts`)
 */
import { z } from 'zod'

// ---------------------------------------------------------------------------
// Status enums
// ---------------------------------------------------------------------------

/**
 * Transaction status as surfaced by KIRAPAY. PascalCase per the actual API
 * enum — not the lower-case lifecycle implied by older internal specs.
 */
export const KirapayTransactionStatusSchema = z.enum([
  'Cancel',
  'Pending',
  'Success',
  'Failed',
  'Refunded',
  'Refunding',
  'RefundedByRelay',
])

export type KirapayTransactionStatus = z.infer<typeof KirapayTransactionStatusSchema>

/** Refund-status filter accepted by `GET /api/wallet/transactions`. */
export const KirapayRefundStatusFilterSchema = z.enum([
  'all',
  'refunded',
  'refunding',
  'not_refunded',
])

export type KirapayRefundStatusFilter = z.infer<typeof KirapayRefundStatusFilterSchema>

// ---------------------------------------------------------------------------
// POST /api/link/generate
// ---------------------------------------------------------------------------

/**
 * Settlement-token specification sent in `tokenOut`. For Konfide on Solana
 * this is always `{ chainId: "sol", address: "SOL" }`; modelled loosely so
 * future settlement tokens (e.g. USDC on Solana) drop in without a schema
 * change.
 */
export const KirapayTokenOutSchema = z
  .object({
    chainId: z.string().min(1),
    address: z.string().min(1),
  })
  .strict()

export type KirapayTokenOut = z.infer<typeof KirapayTokenOutSchema>

/** Hosted-checkout link type. */
export const KirapayLinkTypeSchema = z.enum(['single_use', 'unlimited'])

export type KirapayLinkType = z.infer<typeof KirapayLinkTypeSchema>

/** Response body from `POST /api/link/generate` (HTTP 201). */
export const PaymentLinkResponseSchema = z
  .object({
    message: z.string(),
    code: z.number().int(),
    data: z
      .object({
        url: z.string().url(),
        price: z.number(),
        originalPrice: z.number(),
      })
      .strict(),
  })
  .strict()

export type PaymentLinkResponse = z.infer<typeof PaymentLinkResponseSchema>

// ---------------------------------------------------------------------------
// POST /api/webhooks
// ---------------------------------------------------------------------------

export const WebhookRegistrationResponseSchema = z
  .object({
    message: z.string(),
    code: z.number().int(),
    data: z
      .object({
        _id: z.string(),
        key: z.string(),
        isActive: z.boolean(),
        webhookEndpoint: z
          .object({
            _id: z.string(),
            url: z.string().url(),
            secret: z.string(),
            createdAt: z.string(),
            updatedAt: z.string(),
          })
          .strict(),
      })
      .strict(),
  })
  .strict()

export type WebhookRegistrationResponse = z.infer<typeof WebhookRegistrationResponseSchema>

// ---------------------------------------------------------------------------
// Transaction shapes — GET /api/wallet/transactions/{id} (single) and
// GET /api/wallet/transactions (list).
//
// The two endpoints return overlapping but not-identical objects. We model
// them separately and provide a normalisation helper at the router layer.
// ---------------------------------------------------------------------------

/** Token block shared between in/out tokens in the list response. */
const TokenBlockSchema = z
  .object({
    symbol: z.string(),
    name: z.string().optional(),
    address: z.string().optional(),
    decimals: z.number().int().optional(),
    chainId: z.union([z.string(), z.number()]).optional(),
    amount: z.string().optional(),
  })
  .passthrough()

/** Detail returned by `GET /api/wallet/transactions/{id}`. */
export const TransactionDetailSchema = z
  .object({
    message: z.string(),
    code: z.number().int(),
    data: z
      .object({
        _id: z.string(),
        status: KirapayTransactionStatusSchema,
        hash: z.string(),
        price: z.number(),
        settlementAmount: z.number(),
        source: z.string().optional(),
        tokenIn: TokenBlockSchema,
        tokenOut: TokenBlockSchema,
        summary: z
          .object({
            sender: z.string().nullable().optional(),
            recipient: z.string(),
            code: z.string().optional(),
            name: z.string().optional(),
            customOrderId: z.string().nullable().optional(),
          })
          .passthrough(),
        refundInfo: z.unknown().nullable(),
      })
      .passthrough(),
  })
  .strict()

export type TransactionDetail = z.infer<typeof TransactionDetailSchema>

/** Compact status response from `GET /api/wallet/transactions/status/{hash}`. */
export const TransactionStatusResponseSchema = z
  .object({
    message: z.string(),
    code: z.number().int(),
    data: z
      .object({
        status: KirapayTransactionStatusSchema,
      })
      .strict(),
  })
  .strict()

export type TransactionStatusResponse = z.infer<typeof TransactionStatusResponseSchema>

/** A single row in `GET /api/wallet/transactions` `data.transactions`. */
export const TransactionListItemSchema = z
  .object({
    _id: z.string(),
    tokenIn: TokenBlockSchema,
    tokenOut: TokenBlockSchema,
    recipient: z.string(),
    sender: z.string().nullable().optional(),
    status: KirapayTransactionStatusSchema,
    updatedAt: z.string().optional(),
    createdAt: z.string().optional(),
    settlementAmount: z.union([z.string(), z.number()]).optional(),
    outTxHash: z.string().optional(),
    outChainId: z.union([z.string(), z.number()]).optional(),
    nameLink: z.string().optional(),
    priceLink: z.number().optional(),
    paymentLinkId: z.string().optional(),
    inputTransactionHash: z.string().optional(),
    hash: z.string().optional(),
    customOrderId: z.string().nullable().optional(),
  })
  .passthrough()

export type TransactionListItem = z.infer<typeof TransactionListItemSchema>

/** Response body from `GET /api/wallet/transactions`. */
export const TransactionListResponseSchema = z
  .object({
    message: z.string(),
    code: z.number().int(),
    data: z
      .object({
        transactions: z.array(TransactionListItemSchema),
        total: z.number().int(),
        page: z.number().int(),
        totalPages: z.number().int(),
      })
      .strict(),
  })
  .strict()

export type TransactionListResponse = z.infer<typeof TransactionListResponseSchema>

// ---------------------------------------------------------------------------
// Error envelope
// ---------------------------------------------------------------------------

export const KirapayErrorBodySchema = z
  .object({
    statusCode: z.number().int().optional(),
    message: z.string().optional(),
    timestamp: z.string().optional(),
    path: z.string().optional(),
  })
  .passthrough()

export type KirapayErrorBody = z.infer<typeof KirapayErrorBodySchema>

// ---------------------------------------------------------------------------
// Webhook events
//
// TBD: KIRAPAY has not published the webhook event payload shape. The schema
// below is a defensive best-guess derived from the GET-by-ID transaction
// shape (which is the underlying record), the spec-author's event names
// (`transaction.created` / `transaction.succeeded` / `transaction.refund`),
// and the real status enum. Treat every parse as provisional. When KIRAPAY
// publishes the spec, reconcile here first — the rest of the adapter flows
// from these types.
//
// Defensive choices made until then:
//   - Discriminator: `event` (preferred) with a fallback parser that also
//     accepts `type` (handled in `verify-webhook.ts`).
//   - We accept the underlying transaction body as either `data` or
//     `transaction`, with `passthrough()` so extra fields don't break us.
//   - We require some stable id (`id`, `_id`, or `eventId`) for idempotency.
// ---------------------------------------------------------------------------

/**
 * Event-type strings we recognise. Drawn from the spec author's list. If
 * KIRAPAY actually emits `transaction.success`/`transaction.refunded`, add
 * those values here and update the dispatch in `apps/api/routes/webhooks.ts`.
 */
export const KirapayWebhookEventTypeSchema = z.enum([
  'transaction.created',
  'transaction.succeeded',
  'transaction.refund',
])

export type KirapayWebhookEventType = z.infer<typeof KirapayWebhookEventTypeSchema>

/**
 * Webhook envelope. `data` is the transaction record (same fields as the
 * GET-by-ID response's `data` block, hence reused via `passthrough()`).
 *
 * TBD: confirm field names with KIRAPAY before relying on this shape in
 * production. Idempotency key is `id`.
 */
export const KirapayWebhookEventSchema = z
  .object({
    id: z.string().min(1),
    event: KirapayWebhookEventTypeSchema,
    createdAt: z.string().optional(),
    data: z
      .object({
        _id: z.string().optional(),
        status: KirapayTransactionStatusSchema.optional(),
        hash: z.string().optional(),
        price: z.number().optional(),
        settlementAmount: z.union([z.string(), z.number()]).optional(),
        source: z.string().optional(),
        tokenIn: TokenBlockSchema.optional(),
        tokenOut: TokenBlockSchema.optional(),
        summary: z
          .object({
            sender: z.string().nullable().optional(),
            recipient: z.string().optional(),
            code: z.string().optional(),
            name: z.string().optional(),
            customOrderId: z.string().nullable().optional(),
          })
          .passthrough()
          .optional(),
        customOrderId: z.string().nullable().optional(),
        refundInfo: z.unknown().nullable().optional(),
      })
      .passthrough(),
  })
  .passthrough()

export type KirapayWebhookEvent = z.infer<typeof KirapayWebhookEventSchema>

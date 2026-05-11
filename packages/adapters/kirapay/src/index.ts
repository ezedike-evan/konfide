/**
 * Barrel export for `@konfide/adapter-kirapay`.
 *
 * Surfaces the public API: HTTP client, payment-router adapter, webhook
 * verifier, and inferred types from the response schemas.
 */
export { KirapayClient, KirapayApiError } from './client.js'
export type {
  KirapayClientConfig,
  GeneratePaymentLinkParams,
  RegisterWebhookParams,
  ListTransactionsParams,
} from './client.js'

export {
  KirapayPaymentRouter,
  createKirapayPaymentRouter,
  mapKirapayStatusToSettlementStatus,
} from './kirapay-payment-router.js'
export type {
  KirapayPaymentRouterDeps,
  KirapaySettlementConfig,
} from './kirapay-payment-router.js'

export { verifyKirapayWebhook } from './verify-webhook.js'
export type {
  VerifyKirapayWebhookInput,
  VerifyKirapayWebhookResult,
} from './verify-webhook.js'

export type {
  KirapayLinkType,
  KirapayRefundStatusFilter,
  KirapayTokenOut,
  KirapayTransactionStatus,
  KirapayWebhookEvent,
  KirapayWebhookEventType,
  PaymentLinkResponse,
  TransactionDetail,
  TransactionListItem,
  TransactionListResponse,
  TransactionStatusResponse,
  WebhookRegistrationResponse,
} from './schemas.js'

/**
 * Barrel export for all core ports.
 *
 * Adapters import from this entrypoint to discover the interfaces they must
 * implement. No runtime code lives here.
 */
export type {
  PaymentRouter,
  PaymentRouteQuote,
  PaymentSession,
  CreateSessionOptions,
} from './payment-router.js'
export type { PrivacyLayer, PrivacySession } from './privacy-layer.js'
export type { ChainData, CounterpartyHistoryEntry } from './chain-data.js'
export type { Loyalty, LoyaltyEvent, LoyaltyCampaignReference } from './loyalty.js'
export type { Identity, AuthenticatedUser } from './identity.js'
export type { InvoiceRepository } from './invoice-repository.js'
export type { SettlementRepository } from './settlement-repository.js'
export type { CounterpartyRepository } from './counterparty-repository.js'
export type {
  SettlementRecorder,
  SettlementRecorderInput,
} from './settlement-recorder.js'
export { systemClock } from './clock.js'
export type { Clock } from './clock.js'
export type { IdGenerator } from './id-generator.js'

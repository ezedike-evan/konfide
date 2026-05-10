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
} from './payment-router.js'
export type { PrivacyLayer, PrivacySession } from './privacy-layer.js'
export type { ChainData, CounterpartyHistoryEntry } from './chain-data.js'
export type { Loyalty, LoyaltyEvent, LoyaltyCampaignReference } from './loyalty.js'
export type { Identity, AuthenticatedUser } from './identity.js'

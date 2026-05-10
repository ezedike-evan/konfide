/**
 * Barrel export for `@konfide/core`.
 *
 * This is the only entry point external code should depend on. Adapters
 * additionally import from `@konfide/core/ports` for port interfaces.
 */
export { Money } from './domain/money.js'
export { Corridor } from './domain/corridor.js'
export { Invoice } from './domain/invoice.js'
export { Counterparty } from './domain/counterparty.js'
export { Settlement } from './domain/settlement.js'
export { tierForScore } from './domain/trust-score.js'
export type { TrustScoreInputs } from './domain/trust-score.js'
export {
  walletAddress,
  chainId,
  tokenAddress,
  invoiceId,
  counterpartyId,
  settlementId,
} from './domain/value-objects.js'
export type {
  WalletAddress,
  ChainId,
  TokenAddress,
  InvoiceId,
  CounterpartyId,
  SettlementId,
} from './domain/value-objects.js'

export { InvoiceService } from './services/invoice-service.js'
export type { InvoiceServiceDeps } from './services/invoice-service.js'
export { ScoringService } from './services/scoring-service.js'
export type { ScoringServiceDeps } from './services/scoring-service.js'
export { SettlementService } from './services/settlement-service.js'
export type { SettlementServiceDeps } from './services/settlement-service.js'

export {
  KonfideError,
  NotImplementedError,
  InvalidInvoiceTransitionError,
  CounterpartyNotFoundError,
} from './errors/index.js'

export type * from './ports/index.js'

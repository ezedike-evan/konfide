/**
 * Port: PaymentRouter.
 *
 * Abstracts cross-chain checkout. Implemented by the Kirapay adapter today;
 * could be implemented by additional rails in the future without touching
 * core.
 */
import type { Invoice, Money, Settlement } from '@konfide/types'

export interface PaymentRouteQuote {
  readonly route: string
  readonly payAmount: Money
  readonly receiveAmount: Money
  readonly estimatedSeconds: number
  readonly feesBps: number
}

export interface PaymentSession {
  readonly id: string
  readonly checkoutUrl: string
  readonly expiresAt: string
  /**
   * Amount the payer sees in fiat (e.g. `56`). Present when the routing
   * adapter prices in fiat — KIRAPAY always does.
   */
  readonly fiatAmount?: number
  /** Fiat ISO code (`USD`, `VND`, …). */
  readonly fiatCurrency?: string
  /**
   * Crypto amount the merchant will receive on the settlement chain
   * (e.g. `0.123` SOL). Present once the routing adapter has quoted the
   * checkout — for KIRAPAY this comes back on payment-link creation.
   */
  readonly cryptoAmount?: number
  /** Settlement-token symbol (`SOL`, `USDC`, …). */
  readonly cryptoCurrency?: string
}

export interface PaymentRouter {
  /**
   * Quote available routes for paying a given invoice from a payer wallet.
   *
   * @param invoice - The invoice being paid.
   * @param fromChain - Chain id the payer wants to pay from.
   * @returns A list of quotes ranked by the router.
   */
  quote(invoice: Invoice, fromChain: string): Promise<readonly PaymentRouteQuote[]>

  /**
   * Open a checkout session for the chosen route.
   *
   * @param invoice - The invoice being paid.
   * @param route - The route the payer selected.
   * @returns The hosted-checkout session.
   */
  createSession(invoice: Invoice, route: string): Promise<PaymentSession>

  /**
   * Resolve a session into a finalized `Settlement` once the rails report
   * confirmation.
   *
   * @param sessionId - The session to resolve.
   * @returns The resulting settlement, or `null` if still pending.
   */
  resolveSession(sessionId: string): Promise<Settlement | null>
}

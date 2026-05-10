/**
 * KirapayPaymentRouter — implements the `PaymentRouter` port using Kirapay's
 * cross-border rails. Stub: every method throws `NotImplementedError`.
 */
import { NotImplementedError } from '@konfide/core'
import type {
  PaymentRouteQuote,
  PaymentRouter,
  PaymentSession,
} from '@konfide/core/ports'
import type { Invoice, Settlement } from '@konfide/types'
import { KirapayClient, type KirapayClientConfig } from './client.js'

export class KirapayPaymentRouter implements PaymentRouter {
  private readonly client: KirapayClient

  /**
   * @param config - Kirapay client configuration.
   */
  constructor(config: KirapayClientConfig) {
    this.client = new KirapayClient(config)
  }

  quote(_invoice: Invoice, _fromChain: string): Promise<readonly PaymentRouteQuote[]> {
    void this.client
    throw new NotImplementedError('KirapayPaymentRouter.quote')
  }

  createSession(_invoice: Invoice, _route: string): Promise<PaymentSession> {
    throw new NotImplementedError('KirapayPaymentRouter.createSession')
  }

  resolveSession(_sessionId: string): Promise<Settlement | null> {
    throw new NotImplementedError('KirapayPaymentRouter.resolveSession')
  }
}

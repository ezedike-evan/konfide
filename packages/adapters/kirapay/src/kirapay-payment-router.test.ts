/**
 * Unit tests for `KirapayPaymentRouter`.
 *
 * The HTTP `KirapayClient` is mocked at the method level so these tests
 * exercise only the mapping between domain types and KIRAPAY wire shapes —
 * specifically: do we send Solana settlement (`chainId: "sol"`,
 * `address: "SOL"`), do we set `customOrderId` to the invoice id, and does
 * `resolveSession` correctly translate `Success` into a `Settlement`?
 */
import { describe, expect, it, vi } from 'vitest'
import type { Invoice } from '@konfide/types'
import { SettlementStatus } from '@konfide/core'
import { KirapayClient } from './client.js'
import {
  KirapayPaymentRouter,
  mapKirapayStatusToSettlementStatus,
} from './kirapay-payment-router.js'

const RECEIVER = 'SoLanaDestinationWallet1111111111111111111111'

function buildInvoice(): Invoice {
  return {
    id: '11111111-1111-4111-8111-111111111111',
    issuerId: '22222222-2222-4222-8222-222222222222',
    payerId: null,
    status: 'awaiting_payment',
    total: { amount: 56_000_000n, currency: 'USD' },
    lineItems: [
      {
        description: 'Container 40HQ',
        quantity: 1,
        unitPrice: { amount: 56_000_000n, currency: 'USD' },
      },
    ],
    memo: null,
    dueAt: '2026-06-01T00:00:00.000Z',
    createdAt: '2026-05-10T00:00:00.000Z',
    updatedAt: '2026-05-10T00:00:00.000Z',
    settledAt: null,
    onChainRef: null,
  }
}

function buildRouter(client: KirapayClient): KirapayPaymentRouter {
  return new KirapayPaymentRouter({
    client,
    settlement: {
      chainId: 'sol',
      tokenAddress: 'SOL',
      tokenSymbol: 'SOL',
      receiverAddress: RECEIVER,
      fiatCurrency: 'USD',
      appBaseUrl: 'https://app.konfide.test',
    },
  })
}

describe('KirapayPaymentRouter.createSession', () => {
  it('sends Solana tokenOut and invoice id as customOrderId', async () => {
    const client = new KirapayClient({ apiKey: 'test' })
    const spy = vi.spyOn(client, 'generatePaymentLink').mockResolvedValue({
      message: 'success',
      code: 201,
      data: {
        url: 'https://checkout.kira-pay.com/abc123',
        price: 0.42,
        originalPrice: 56,
      },
    })

    const router = buildRouter(client)
    const invoice = buildInvoice()
    const session = await router.createSession(invoice, 'kirapay_sol_direct')

    expect(spy).toHaveBeenCalledTimes(1)
    const body = spy.mock.calls[0]?.[0]
    expect(body?.tokenOut).toEqual({ chainId: 'sol', address: 'SOL' })
    expect(body?.receiver).toBe(RECEIVER)
    expect(body?.customOrderId).toBe(invoice.id)
    expect(body?.type).toBe('single_use')
    expect(body?.isViewAsCrypto).toBe(false)
    expect(body?.fiatCurrency).toBe('USD')
    expect(body?.redirectUrl).toBe(`https://app.konfide.test/pay/${invoice.id}/return`)
    expect(body?.originalPrice).toBeCloseTo(56, 6)

    expect(session.id).toBe(invoice.id)
    expect(session.checkoutUrl).toBe('https://checkout.kira-pay.com/abc123')
    expect(session.fiatAmount).toBe(56)
    expect(session.fiatCurrency).toBe('USD')
    expect(session.cryptoAmount).toBe(0.42)
    expect(session.cryptoCurrency).toBe('SOL')
    expect(session.expiresAt).toBe(invoice.dueAt)
  })
})

describe('KirapayPaymentRouter.resolveSession', () => {
  it('returns null while the latest transaction is Pending', async () => {
    const client = new KirapayClient({ apiKey: 'test' })
    vi.spyOn(client, 'listTransactions').mockResolvedValue({
      message: 'success',
      code: 200,
      data: {
        transactions: [
          {
            _id: 'tx_1',
            tokenIn: { symbol: 'USDC' },
            tokenOut: { symbol: 'SOL' },
            recipient: RECEIVER,
            sender: 'SenderBase581111111111111111111111111111',
            status: 'Pending',
            customOrderId: '11111111-1111-4111-8111-111111111111',
            updatedAt: '2026-05-10T00:01:00.000Z',
          },
        ],
        total: 1,
        page: 1,
        totalPages: 1,
      },
    })

    const router = buildRouter(client)
    const result = await router.resolveSession('11111111-1111-4111-8111-111111111111')
    expect(result).toBeNull()
  })

  it('returns a Settlement when the latest transaction is Success', async () => {
    const client = new KirapayClient({ apiKey: 'test' })
    vi.spyOn(client, 'listTransactions').mockResolvedValue({
      message: 'success',
      code: 200,
      data: {
        transactions: [
          {
            _id: 'tx_99',
            tokenIn: { symbol: 'USDC' },
            tokenOut: { symbol: 'SOL' },
            recipient: RECEIVER,
            sender: 'SenderBase581111111111111111111111111111',
            status: 'Success',
            customOrderId: '11111111-1111-4111-8111-111111111111',
            updatedAt: '2026-05-10T00:05:00.000Z',
            outTxHash: 'a'.repeat(88),
            settlementAmount: '0.42',
            priceLink: 56,
          },
        ],
        total: 1,
        page: 1,
        totalPages: 1,
      },
    })

    const router = buildRouter(client)
    const settlement = await router.resolveSession('11111111-1111-4111-8111-111111111111')
    expect(settlement).not.toBeNull()
    expect(settlement?.invoiceId).toBe('11111111-1111-4111-8111-111111111111')
    expect(settlement?.route).toBe('kirapay_direct')
    expect(settlement?.chainId).toBe('kirapay:sol')
    expect(settlement?.txSignature).toBe('a'.repeat(88))
    expect(settlement?.receivedAmount).toEqual({ amount: 420_000_000n, currency: 'SOL' })
    expect(settlement?.paidAmount).toEqual({ amount: 56_000_000n, currency: 'USD' })
  })

  it('maps KIRAPAY statuses 1:1 to SettlementStatus', () => {
    expect(mapKirapayStatusToSettlementStatus('Pending')).toBe(SettlementStatus.Pending)
    expect(mapKirapayStatusToSettlementStatus('Success')).toBe(SettlementStatus.Success)
    expect(mapKirapayStatusToSettlementStatus('Failed')).toBe(SettlementStatus.Failed)
    expect(mapKirapayStatusToSettlementStatus('Cancel')).toBe(SettlementStatus.Cancel)
    expect(mapKirapayStatusToSettlementStatus('Refunded')).toBe(SettlementStatus.Refunded)
    expect(mapKirapayStatusToSettlementStatus('Refunding')).toBe(SettlementStatus.Refunding)
    expect(mapKirapayStatusToSettlementStatus('RefundedByRelay')).toBe(
      SettlementStatus.RefundedByRelay,
    )
  })
})

describe('KirapayPaymentRouter.quote', () => {
  it('returns a static estimate without calling KIRAPAY', async () => {
    const client = new KirapayClient({ apiKey: 'test' })
    const spy = vi.spyOn(client, 'generatePaymentLink')
    const router = buildRouter(client)
    const quotes = await router.quote(buildInvoice(), 'any')
    expect(spy).not.toHaveBeenCalled()
    expect(quotes).toHaveLength(1)
    expect(quotes[0]?.route).toBe('kirapay_sol_direct')
    expect(quotes[0]?.feesBps).toBeGreaterThan(0)
  })
})

/**
 * `/webhooks` route — sponsor-side webhook receivers.
 *
 * KIRAPAY: signature-verified using the raw body (we read bytes, not JSON).
 * Idempotent: the upstream event id is recorded in `webhook_events` and
 * duplicate deliveries return 200 without re-applying.
 *
 * Dispatch table (per the rewrite spec):
 *   - transaction.created   → no-op (invoice already in `awaiting_payment`)
 *   - transaction.succeeded → InvoiceService.markSettled + on-chain commit
 *   - transaction.refund    → InvoiceService.markRefunded
 *
 * Reconciliation key: every payload's `customOrderId` (or `data.summary
 * .customOrderId`) is the Konfide invoice id we sent at link-creation time.
 * The handler refuses to dispatch if it can't resolve back to a local
 * invoice — KIRAPAY's `_id` alone is not enough since we may have raced the
 * `transaction.created` event before the link finished saving locally.
 *
 * NOTE: KIRAPAY's webhook event payload shape is not formally documented.
 * The parser in `verifyKirapayWebhook` is `passthrough()` and tolerates
 * unknown fields; this handler reads the well-known fields defensively. If
 * KIRAPAY publishes the spec and the field locations differ, update both
 * the dispatch below and `KirapayWebhookEventSchema` in the adapter.
 */
import { Hono } from 'hono'
import { verifyKirapayWebhook, type KirapayWebhookEvent } from '@konfide/adapter-kirapay'
import { getAppContext } from '../composition.js'

export const webhooksRoute = new Hono()

webhooksRoute.post('/kirapay', async (c) => {
  const ctx = getAppContext()
  const rawBody = await c.req.text()
  const signatureHeader = c.req.header('x-kirapay-signature') ?? null

  const result = verifyKirapayWebhook({
    rawBody,
    signatureHeader,
    secret: ctx.env.KIRAPAY_WEBHOOK_SECRET,
  })

  if (!result.valid) {
    console.warn('[webhooks/kirapay] signature verification failed', { reason: result.reason })
    return c.body(null, 401)
  }

  const event = result.event
  console.log('[webhooks/kirapay] received', { id: event.id, type: event.event })

  if (await ctx.webhookEvents.hasProcessed(event.id)) {
    return c.json({ status: 'already_processed' }, 200)
  }

  const customOrderId = extractCustomOrderId(event)
  if (!customOrderId) {
    console.warn('[webhooks/kirapay] missing customOrderId; cannot reconcile', { id: event.id })
    await ctx.webhookEvents.record({
      id: event.id,
      source: 'kirapay',
      type: event.event,
      payload: event,
      rawBody,
    })
    return c.json({ status: 'ignored', reason: 'missing_custom_order_id' }, 200)
  }

  const invoice = await ctx.invoices.findByCustomOrderId(customOrderId)
  if (!invoice) {
    console.warn('[webhooks/kirapay] no invoice for customOrderId', { customOrderId })
    await ctx.webhookEvents.record({
      id: event.id,
      source: 'kirapay',
      type: event.event,
      payload: event,
      rawBody,
    })
    return c.json({ status: 'ignored', reason: 'unknown_invoice' }, 200)
  }

  const kirapayTxId = event.data._id
  if (kirapayTxId) {
    await ctx.invoices.attachKirapayTransactionId?.(invoice.id, kirapayTxId)
  }

  try {
    if (event.event === 'transaction.created') {
      // No state change — `transaction.created` is informational. We still
      // persist the event id for the idempotency table.
    } else if (event.event === 'transaction.succeeded') {
      const sender = event.data.summary?.sender ?? 'unknown'
      const settlementChainId =
        (typeof event.data.tokenOut?.chainId === 'string'
          ? event.data.tokenOut.chainId
          : undefined) ?? 'sol'
      const settlementSymbol = event.data.tokenOut?.symbol ?? 'SOL'
      const fiatPrice = event.data.price ?? 0
      const settlementAmountRaw = event.data.settlementAmount
      const settlementAmount =
        typeof settlementAmountRaw === 'string'
          ? Number.parseFloat(settlementAmountRaw)
          : (settlementAmountRaw ?? 0)
      const txSignature =
        event.data.hash ??
        (typeof event.data._id === 'string' ? event.data._id : `kirapay:${event.id}`)

      await ctx.invoiceService.markSettled({
        invoiceId: invoice.id,
        settlement: {
          route: 'kirapay_direct',
          paidBy: sender,
          paidAmount: {
            amount: BigInt(Math.round(fiatPrice * 1_000_000)),
            currency: invoice.total.currency,
          },
          receivedAmount: {
            amount: BigInt(Math.round(settlementAmount * 1_000_000_000)),
            currency: settlementSymbol,
          },
          txSignature,
          chainId: `kirapay:${settlementChainId}`,
          confirmedAt: event.createdAt ?? new Date().toISOString(),
        },
      })
    } else if (event.event === 'transaction.refund') {
      const refundKind =
        event.data.status === 'RefundedByRelay' ? 'RefundedByRelay' : 'Refunded'
      await ctx.invoiceService.markRefunded({
        invoiceId: invoice.id,
        refundKind,
        refundedAt: event.createdAt ?? new Date().toISOString(),
      })
    }

    await ctx.webhookEvents.record({
      id: event.id,
      source: 'kirapay',
      type: event.event,
      payload: event,
      rawBody,
    })

    return c.json({ status: 'ok' }, 200)
  } catch (err) {
    console.error('[webhooks/kirapay] handler error', err)
    return c.json({ code: 'internal_error', message: 'failed to apply webhook' }, 500)
  }
})

webhooksRoute.post('/magicblock', (c) => c.json({ error: 'not_implemented' }, 501))
webhooksRoute.post('/torque', (c) => c.json({ error: 'not_implemented' }, 501))

function extractCustomOrderId(event: KirapayWebhookEvent): string | null {
  if (typeof event.data.customOrderId === 'string') return event.data.customOrderId
  const fromSummary = event.data.summary?.customOrderId
  if (typeof fromSummary === 'string') return fromSummary
  return null
}

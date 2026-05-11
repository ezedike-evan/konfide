/**
 * `/invoices` route — invoice CRUD + payer-facing lookup.
 *
 * Reader: anyone touching the API surface or the web app's data layer.
 * - `POST /invoices` is the issuer endpoint that opens a hosted KIRAPAY
 *   payment link. Validates with Zod, calls `InvoiceService.createInvoice`.
 *   The body now carries the **fiat** amount the issuer wants paid; KIRAPAY
 *   prices the link in SOL and returns both back to us.
 * - `GET /invoices/:publicId` returns the invoice for both seller and payer
 *   pages, including the SOL/fiat pair so the UI can show
 *   "settling X SOL ≈ $Y USD".
 */
import { Hono } from 'hono'
import { z } from 'zod'
import { InvoiceNotFoundError } from '@konfide/core'
import { getAppContext } from '../composition.js'

const CreateInvoiceBody = z
  .object({
    amount: z.number().positive(),
    currency: z.string().min(2).max(8).default('USD'),
    recipientHandle: z.string().min(2).max(64),
    description: z.string().max(1000).optional(),
    expiresInMinutes: z.number().int().positive().max(60 * 24 * 7).optional(),
  })
  .strict()

export const invoicesRoute = new Hono()

invoicesRoute.post('/', async (c) => {
  const raw = await c.req.json().catch(() => null)
  const parsed = CreateInvoiceBody.safeParse(raw)
  if (!parsed.success) {
    return c.json(
      {
        code: 'invalid_request',
        message: 'request body did not match schema',
        details: parsed.error.flatten(),
      },
      400,
    )
  }
  const ctx = getAppContext()
  try {
    const result = await ctx.invoiceService.createInvoice({
      issuerHandle: ctx.env.KONFIDE_ISSUER_HANDLE,
      amountMinorUnits: BigInt(Math.round(parsed.data.amount * 1_000_000)),
      currency: parsed.data.currency,
      recipientHandle: parsed.data.recipientHandle,
      description: parsed.data.description ?? null,
      expiresInMinutes: parsed.data.expiresInMinutes ?? 60,
    })
    return c.json(
      {
        invoiceId: result.invoice.id,
        publicId: result.invoice.id,
        checkoutUrl: result.checkoutUrl,
        expiresAt: result.checkoutExpiresAt,
        status: result.invoice.status,
        fiatAmount: result.fiatAmount,
        fiatCurrency: result.fiatCurrency,
        cryptoAmount: result.cryptoAmount,
        cryptoCurrency: result.cryptoCurrency,
      },
      201,
    )
  } catch (err) {
    if (err instanceof InvoiceNotFoundError) {
      return c.json({ code: err.code, message: err.message }, 404)
    }
    console.error('[invoices.post] unexpected error', err)
    return c.json({ code: 'internal_error', message: 'failed to create invoice' }, 500)
  }
})

invoicesRoute.get('/:publicId', async (c) => {
  const publicId = c.req.param('publicId')
  const ctx = getAppContext()
  const invoice = await ctx.invoices.findByPublicId(publicId)
  if (!invoice) {
    return c.json({ code: 'not_found', message: 'invoice not found' }, 404)
  }
  const settlements = await ctx.settlements.findByInvoiceId(invoice.id)
  const issuer = await ctx.counterparties.findById(invoice.issuerId)

  const checkout = await ctx.invoices.findCheckoutSession(invoice.id)

  return c.json({
    publicId: invoice.id,
    status: invoice.status,
    amount: Number(invoice.total.amount) / 1_000_000,
    amountMinorUnits: invoice.total.amount.toString(),
    currency: invoice.total.currency,
    description: invoice.memo,
    merchantDisplayName: issuer?.displayName ?? 'Konfide merchant',
    expiresAt: invoice.dueAt,
    createdAt: invoice.createdAt,
    settledAt: invoice.settledAt,
    checkoutUrl: checkout?.url ?? null,
    checkoutExpiresAt: checkout?.expiresAt ?? null,
    fiatAmount: checkout?.fiatAmount ?? null,
    fiatCurrency: checkout?.fiatCurrency ?? null,
    cryptoAmount: checkout?.cryptoAmount ?? null,
    cryptoCurrency: checkout?.cryptoCurrency ?? null,
    settlement:
      settlements[0]
        ? {
            txSignature: settlements[0].txSignature,
            chainId: settlements[0].chainId,
            confirmedAt: settlements[0].confirmedAt,
          }
        : null,
  })
})

/**
 * Thin typed API client for the Konfide API.
 *
 * Reader: any web component that needs to call the API. One function per
 * endpoint. Responses are validated with Zod so the front-end never works
 * against a guessed shape. No data-fetching libraries — plain fetch is enough
 * for the demo.
 */
import { z } from 'zod'

const InvoiceStatusSchema = z.enum([
  'draft',
  'issued',
  'awaiting_payment',
  'partially_paid',
  'settled',
  'refunded',
  'disputed',
  'voided',
  'expired',
])

export type InvoiceStatus = z.infer<typeof InvoiceStatusSchema>

const CreateInvoiceResponse = z.object({
  invoiceId: z.string(),
  publicId: z.string(),
  checkoutUrl: z.string(),
  expiresAt: z.string(),
  status: InvoiceStatusSchema,
  fiatAmount: z.number().nullable().optional(),
  fiatCurrency: z.string().nullable().optional(),
  cryptoAmount: z.number().nullable().optional(),
  cryptoCurrency: z.string().nullable().optional(),
})

export type CreateInvoiceResponse = z.infer<typeof CreateInvoiceResponse>

const InvoiceDetailResponse = z.object({
  publicId: z.string(),
  status: InvoiceStatusSchema,
  amount: z.number(),
  amountMinorUnits: z.string(),
  currency: z.string(),
  description: z.string().nullable(),
  merchantDisplayName: z.string(),
  expiresAt: z.string(),
  createdAt: z.string(),
  settledAt: z.string().nullable(),
  checkoutUrl: z.string().nullable(),
  checkoutExpiresAt: z.string().nullable(),
  fiatAmount: z.number().nullable().optional(),
  fiatCurrency: z.string().nullable().optional(),
  cryptoAmount: z.number().nullable().optional(),
  cryptoCurrency: z.string().nullable().optional(),
  settlement: z
    .object({
      txSignature: z.string(),
      chainId: z.string(),
      confirmedAt: z.string(),
    })
    .nullable(),
})

export type InvoiceDetailResponse = z.infer<typeof InvoiceDetailResponse>

const InvoiceListItem = z.object({
  publicId: z.string(),
  status: InvoiceStatusSchema,
  fiatAmount: z.number(),
  fiatCurrency: z.string(),
  cryptoAmount: z.number().nullable(),
  cryptoCurrency: z.string().nullable(),
  recipientHandle: z.string().nullable(),
  description: z.string().nullable(),
  createdAt: z.string(),
  expiresAt: z.string().nullable(),
})

const InvoiceListResponse = z.array(InvoiceListItem)

export type InvoiceListItem = z.infer<typeof InvoiceListItem>

export interface CreateInvoiceInput {
  amount: number
  currency: string
  recipientHandle: string
  description?: string
  expiresInMinutes?: number
}

const apiBase = (): string =>
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export async function createInvoice(
  input: CreateInvoiceInput,
): Promise<CreateInvoiceResponse> {
  const res = await fetch(`${apiBase()}/invoices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  const text = await res.text()
  if (!res.ok) {
    throw new ApiError(res.status, parseError(text))
  }
  return CreateInvoiceResponse.parse(JSON.parse(text))
}

export async function listInvoices(
  init?: RequestInit & { limit?: number },
): Promise<InvoiceListItem[]> {
  const url = new URL(`${apiBase()}/invoices`)
  if (init?.limit !== undefined) url.searchParams.set('limit', String(init.limit))
  const { limit: _unused, ...fetchInit } = init ?? {}
  const res = await fetch(url, fetchInit)
  const text = await res.text()
  if (!res.ok) {
    throw new ApiError(res.status, parseError(text))
  }
  return InvoiceListResponse.parse(JSON.parse(text))
}

export async function getInvoice(
  publicId: string,
  init?: RequestInit,
): Promise<InvoiceDetailResponse> {
  const res = await fetch(`${apiBase()}/invoices/${encodeURIComponent(publicId)}`, init)
  const text = await res.text()
  if (!res.ok) {
    throw new ApiError(res.status, parseError(text))
  }
  return InvoiceDetailResponse.parse(JSON.parse(text))
}

export class ApiError extends Error {
  readonly status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}

function parseError(text: string): string {
  try {
    const parsed = JSON.parse(text) as { message?: string; error?: string }
    return parsed.message ?? parsed.error ?? text
  } catch {
    return text
  }
}

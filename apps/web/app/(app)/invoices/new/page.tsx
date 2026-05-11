/**
 * Issuer dashboard: new invoice form.
 *
 * Reader: the seller. Submits the form, the API opens a KIRAPAY checkout
 * session, and we redirect to the seller's view of the invoice. The form is
 * deliberately minimal — amount, recipient handle, optional description,
 * expiry — so the demo path stays under one screen.
 */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ApiError, createInvoice } from '../../../../lib/api'

export default function NewInvoicePage(): React.ReactElement {
  const router = useRouter()
  const [amount, setAmount] = useState('10')
  const [recipientHandle, setRecipientHandle] = useState('wei-supplier')
  const [description, setDescription] = useState('Container 40HQ — pilot run')
  const [expiresInMinutes, setExpiresInMinutes] = useState(60)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const parsedAmount = Number.parseFloat(amount)
      if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
        throw new Error('amount must be a positive number')
      }
      const result = await createInvoice({
        amount: parsedAmount,
        currency: 'USD',
        recipientHandle: recipientHandle.trim(),
        description: description.trim() || undefined,
        expiresInMinutes,
      })
      router.push(`/invoices/${result.publicId}`)
    } catch (err) {
      const message =
        err instanceof ApiError ? `${err.status}: ${err.message}` : err instanceof Error ? err.message : String(err)
      setError(message)
      setSubmitting(false)
    }
  }

  return (
    <section className="mx-auto max-w-xl px-6 py-12">
      <h1 className="text-2xl font-semibold">New invoice</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Send this to a buyer; they pay in any chain, you receive USDC on Solana.
      </p>

      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-5">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">Amount (USDC)</span>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="number"
            step="0.01"
            min="0"
            required
            className="rounded-md border border-neutral-300 px-3 py-2 text-base"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">Recipient handle</span>
          <input
            value={recipientHandle}
            onChange={(e) => setRecipientHandle(e.target.value)}
            type="text"
            required
            minLength={2}
            maxLength={64}
            className="rounded-md border border-neutral-300 px-3 py-2 text-base"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">Description</span>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            type="text"
            maxLength={1000}
            className="rounded-md border border-neutral-300 px-3 py-2 text-base"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">Expires in (minutes)</span>
          <input
            value={expiresInMinutes}
            onChange={(e) => setExpiresInMinutes(Number.parseInt(e.target.value, 10) || 60)}
            type="number"
            min="5"
            max={60 * 24 * 7}
            className="rounded-md border border-neutral-300 px-3 py-2 text-base"
          />
        </label>

        {error ? (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-black px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {submitting ? 'Creating…' : 'Create invoice'}
        </button>
      </form>
    </section>
  )
}

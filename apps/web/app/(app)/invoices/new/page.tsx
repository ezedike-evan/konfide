'use client'
import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function NewInvoicePage() {
  const router = useRouter()
  const [amount, setAmount] = useState('10')
  const [recipient, setRecipient] = useState('wei-supplier')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(amount),
          currency: 'USD',
          recipientHandle: recipient,
          description: description || undefined,
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.message ?? `request failed (${res.status})`)
      }
      const data = await res.json()
      router.push(`/invoices/${data.publicId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'something went wrong')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-xl px-8 py-20">
        <p className="text-xs font-medium tracking-widest text-white/40 uppercase">
          New invoice
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Issue a payment request
        </h1>
        <p className="mt-3 text-sm text-white/60">
          Set the fiat amount you want to receive. We&apos;ll generate a hosted checkout
          link your buyer can pay from any supported chain.
        </p>

        <form onSubmit={handleSubmit} className="mt-12 space-y-6">
          <div>
            <label className="block text-xs font-medium tracking-widest text-white/40 uppercase">
              Amount (USD)
            </label>
            <input
              type="number"
              min="1"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-2 w-full rounded-md border border-white/20 bg-transparent px-4 py-3 text-white placeholder-white/30 focus:border-white focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium tracking-widest text-white/40 uppercase">
              Recipient handle
            </label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="mt-2 w-full rounded-md border border-white/20 bg-transparent px-4 py-3 text-white placeholder-white/30 focus:border-white focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium tracking-widest text-white/40 uppercase">
              Description (optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Phone case batch — Container 40HQ"
              className="mt-2 w-full rounded-md border border-white/20 bg-transparent px-4 py-3 text-white placeholder-white/30 focus:border-white focus:outline-none"
            />
          </div>

          {error && (
            <p className="text-sm text-white/80 border border-white/20 rounded-md px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating…' : 'Create invoice'}
          </button>
        </form>
      </div>
    </main>
  )
}
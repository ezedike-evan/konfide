'use client'
import { useState, type FormEvent, type ReactElement } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'

const MERCHANT_DISPLAY_NAME = 'Konfide Merchant'

export default function NewInvoicePage(): ReactElement {
  const router = useRouter()
  const [amount, setAmount] = useState('10')
  const [recipient, setRecipient] = useState('wei-supplier')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent): Promise<void> {
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
      router.refresh()
      router.push(`/invoices/${data.publicId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'something went wrong')
      setLoading(false)
    }
  }

  const parsedAmount = Number(amount)
  const previewAmount = Number.isFinite(parsedAmount) && parsedAmount > 0 ? parsedAmount : 0

  return (
    <main className="bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
            New invoice
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            Issue a payment request
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Set the fiat amount you want to receive. We&apos;ll generate a hosted checkout link
            your buyer can pay from any supported chain.
          </p>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_420px]">
          <form onSubmit={handleSubmit} className="space-y-8">
            <Field label="Amount (USD)">
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm text-muted-foreground">
                  $
                </span>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="block w-full rounded-md border border-input bg-background py-3 pl-8 pr-4 text-base text-foreground placeholder:text-muted-foreground/60 focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                  required
                />
              </div>
            </Field>

            <Field label="Buyer handle">
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="wei-supplier"
                className="block w-full rounded-md border border-input bg-background px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/60 focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                required
              />
            </Field>

            <Field label="Description (optional)">
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Phone case batch — Container 40HQ"
                className="block w-full rounded-md border border-input bg-background px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/60 focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </Field>

            {error ? (
              <div
                role="alert"
                className="rounded-md border border-border bg-muted px-4 py-3 text-sm text-foreground"
              >
                <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
                  Error
                </p>
                <p className="mt-1">{error}</p>
              </div>
            ) : null}

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
              <button
                type="submit"
                disabled={loading}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-md bg-foreground px-6 py-3 text-sm font-medium text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {loading ? 'Creating…' : 'Create invoice'}
                {!loading ? (
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    strokeWidth={1.75}
                  />
                ) : null}
              </button>
              <p className="text-xs text-muted-foreground">
                You can share the payer link once it&apos;s created.
              </p>
            </div>
          </form>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
              Preview
            </p>
            <div className="mt-3 rounded-lg border border-border bg-card p-6 text-card-foreground">
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
                {MERCHANT_DISPLAY_NAME}
              </p>
              <p className="mt-6 text-4xl font-semibold tracking-tight">
                ${previewAmount.toFixed(2)}{' '}
                <span className="text-base font-medium text-muted-foreground">USD</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                ≈ {(previewAmount / 24).toFixed(3)} SOL
              </p>

              <div className="mt-6 h-px bg-border" />

              <dl className="mt-6 space-y-3 text-sm">
                <Row label="Buyer" value={recipient || '—'} />
                <Row label="Description" value={description || '—'} />
                <Row label="Settles on" value="Solana" />
              </dl>

              <div className="mt-6 rounded-md border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
                A hosted KIRAPAY checkout link will appear after creation.
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: ReactElement
}): ReactElement {
  return (
    <label className="block">
      <span className="block text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </span>
      <span className="mt-2 block">{children}</span>
    </label>
  )
}

function Row({ label, value }: { label: string; value: string }): ReactElement {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</dt>
      <dd className="text-right text-sm text-foreground">{value}</dd>
    </div>
  )
}

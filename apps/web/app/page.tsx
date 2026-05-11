import Link from 'next/link'
import { ArrowUpRight, Clock, Globe2, Network } from 'lucide-react'
import type { ReactElement } from 'react'

export default function HomePage(): ReactElement {
  return (
    <main className="bg-background text-foreground">
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32 lg:py-40">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
            B2B payments · Solana settlement
          </p>
          <h1 className="mt-8 max-w-4xl text-balance text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            Cross-border B2B payments,
            <br className="hidden sm:block" />
            <span className="text-muted-foreground"> settled in seconds.</span>
          </h1>
          <p className="mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            A Lagos importer pays a Shenzhen supplier. The buyer pays in any token from any
            chain. The seller receives settlement on Solana in under 90 seconds — built for the
            trade corridors traditional banking serves badly.
          </p>

          <div className="mt-12 flex flex-wrap gap-3">
            <Link
              href="/invoices/new"
              className="group inline-flex items-center justify-center gap-2 rounded-md bg-foreground px-5 py-3 text-sm font-medium text-background transition hover:opacity-90"
            >
              Create an invoice
              <ArrowUpRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                strokeWidth={1.75}
              />
            </Link>
            <Link
              href="/invoices"
              className="inline-flex items-center justify-center rounded-md border border-border px-5 py-3 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              View invoices
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
            How it works
          </p>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Three steps from quote to settlement.
          </h2>

          <div className="mt-16 grid gap-12 md:grid-cols-3">
            <Step
              n="01"
              title="Issue an invoice"
              body="Set the amount in fiat. Konfide generates a hosted checkout link you can share with your buyer over any channel — email, WhatsApp, anything."
            />
            <Step
              n="02"
              title="Buyer pays from any chain"
              body="Polygon, Base, Ethereum, Arbitrum, Solana — any supported token. KIRAPAY routes the cross-chain settlement automatically."
            />
            <Step
              n="03"
              title="Funds arrive on Solana"
              body="Settlement lands in the seller's Solana wallet in under 90 seconds. On-chain receipt with selective-disclosure privacy."
            />
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
            Why Konfide
          </p>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Designed for the corridors banking forgets.
          </h2>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            <TrustSignal
              icon={<Clock className="h-5 w-5" strokeWidth={1.5} />}
              title="Settles in 90 seconds, not 5 days"
              body="Solana finality replaces the SWIFT correspondent chain. No intermediary banks, no FX desk delays."
            />
            <TrustSignal
              icon={<Network className="h-5 w-5" strokeWidth={1.5} />}
              title="Pay from any chain, settle on Solana"
              body="Buyers hold liquidity where they hold it. We abstract the routing — the seller sees a single settlement."
            />
            <TrustSignal
              icon={<Globe2 className="h-5 w-5" strokeWidth={1.5} />}
              title="Built for emerging-market trade"
              body="Lagos to Shenzhen, Nairobi to Istanbul, Karachi to Guangzhou. The corridors where 5% wire fees still rule."
            />
          </div>
        </div>
      </section>

      <footer>
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-6 py-10 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>Solana Frontier Hackathon · May 2026 · Built in Lagos</p>
          <a
            href="#"
            className="inline-flex items-center gap-1.5 text-muted-foreground transition hover:text-foreground"
          >
            View on GitHub
            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
          </a>
        </div>
      </footer>
    </main>
  )
}

function Step({ n, title, body }: { n: string; title: string; body: string }): ReactElement {
  return (
    <div className="flex flex-col gap-3 border-t border-border pt-6">
      <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
        {n}
      </p>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  )
}

function TrustSignal({
  icon,
  title,
  body,
}: {
  icon: ReactElement
  title: string
  body: string
}): ReactElement {
  return (
    <div className="flex flex-col gap-4">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-foreground">
        {icon}
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  )
}

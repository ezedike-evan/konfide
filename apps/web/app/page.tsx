import Link from 'next/link'
import type { ReactElement } from 'react'

export default function HomePage(): ReactElement {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-5xl px-8 py-32">
        {/* Hero */}
        <div className="border-b border-white/10 pb-20">
          <p className="text-sm font-medium tracking-widest text-white/40 uppercase">
            Konfide
          </p>
          <h1 className="mt-6 text-6xl font-semibold tracking-tight leading-[1.05]">
            Cross-border B2B payments,<br />
            settled in seconds.
          </h1>
          <p className="mt-8 max-w-2xl text-lg text-white/60 leading-relaxed">
            A Lagos importer pays a Shenzhen supplier. Buyer pays in any token from any chain.
            Seller receives settlement on Solana in under 90 seconds. Built for the
            corridors traditional banking serves badly.
          </p>

          <div className="mt-12 flex flex-wrap gap-4">
            <Link
              href="/invoices/new"
              className="inline-flex items-center justify-center rounded-md bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-white/90"
            >
              Create an invoice →
            </Link>
            <Link
              href="/invoices"
              className="inline-flex items-center justify-center rounded-md border border-white/20 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/5"
            >
              View invoices
            </Link>
          </div>
        </div>

        {/* How it works */}
        <div className="mt-20 grid gap-12 md:grid-cols-3">
          <div>
            <p className="text-xs font-medium tracking-widest text-white/40 uppercase">
              01 — Create
            </p>
            <h3 className="mt-3 text-xl font-medium">Issue an invoice</h3>
            <p className="mt-2 text-sm text-white/60 leading-relaxed">
              Set the amount in fiat. Share the payer link with your buyer over any channel.
            </p>
          </div>
          <div>
            <p className="text-xs font-medium tracking-widest text-white/40 uppercase">
              02 — Pay
            </p>
            <h3 className="mt-3 text-xl font-medium">Buyer pays from any chain</h3>
            <p className="mt-2 text-sm text-white/60 leading-relaxed">
              Polygon, Base, Ethereum, Arbitrum — any supported token. KIRAPAY routes the cross-chain settlement automatically.
            </p>
          </div>
          <div>
            <p className="text-xs font-medium tracking-widest text-white/40 uppercase">
              03 — Settle
            </p>
            <h3 className="mt-3 text-xl font-medium">Funds arrive on Solana</h3>
            <p className="mt-2 text-sm text-white/60 leading-relaxed">
              Settlement lands in your Solana wallet. On-chain receipt with selective-disclosure privacy.
            </p>
          </div>
        </div>

        {/* Status */}
        <div className="mt-20 border-t border-white/10 pt-8 flex flex-wrap items-center justify-between gap-4 text-xs text-white/40">
          <p>Solana Frontier Hackathon · May 2026</p>
          <p>Built in Lagos · Settling on devnet</p>
        </div>
      </div>
    </main>
  )
}
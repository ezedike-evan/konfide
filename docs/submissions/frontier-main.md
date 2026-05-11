# Konfide — Solana Frontier Hackathon (Main Track)

This document is the submission for the Frontier Hackathon main track. Its intended readers are Colosseum judges deciding which projects to interview for the accelerator. It is optimised for a 5-minute first read and a 20-minute deep read against the published judging criteria.

## Project name

Konfide.

## One-liner

Confidential B2B payment rails for cross-border trade in emerging markets, on Solana.

## Problem

Tunde runs a phone accessories import business in Lagos. He pays his Shenzhen supplier $12,000 every two weeks. The transfer takes five days through correspondent banking, costs him $400 in fees, and adds another 4–5% in FX spread at his Nigerian bank. Total cost: around 4–7% of the invoice, plus a working-capital hit from the five-day float. When his Wise account got flagged for compliance review last quarter, he switched to USDT on Tron. That solved the speed problem and most of the cost problem, but introduced a new one: every payment to his supplier is publicly observable on Tron's block explorer. His competitors can see what he pays and to whom; his supplier's competitors can see his pricing and customer list. For a mid-size B2B trade, that is commercially damaging.

The systemic version: emerging-market SMEs are the most underserved customers in global payments. Roughly $5T flows annually in cross-border B2B globally `[verify]`; the Lagos-Guangzhou corridor alone is approximately $8B `[verify]`. The current options are correspondent banking (slow, expensive, fragile), informal money changers (illegal or grey-market), or public USDT on Tron (cheap and fast but commercially exposed). None combine speed, cost, privacy, and a credible regulatory story. The result: SMEs in Lagos, Nairobi, Cairo, Mumbai, and Mexico City pay multiples more than OECD businesses for the same kind of transaction, with worse tools, and accept it because there is no alternative.

The industry has tried to fix this by treating it as either a payments problem (Wise, OFX) or a stablecoin problem (CEX-routed USDT, Yellow Card). Neither addresses what makes B2B different from retail remittance: invoice context, repeat counterparty relationships, and the commercial sensitivity of pricing and customer data. The stack is incomplete. Konfide completes it.

## Solution

A Konfide trade looks like this:

1. Tunde signs into the Konfide dashboard with his email. Privy provisions a Solana embedded wallet behind the scenes — Tunde never sees a seed phrase.
2. He creates an invoice in the dashboard for his supplier Wei: $12,000 USDC, due on shipment. He sends Wei the link.
3. Wei opens the link, accepts the invoice, and his trust score (computed from on-chain history via Covalent GoldRush) appears next to his name on Tunde's screen — silver tier, 600/1000.
4. Tunde clicks Pay. The hosted KIRAPAY checkout opens. He chooses to pay with USDT on Polygon because that is what is in his wallet. KIRAPAY's solver network routes funds across any supported source chain and settles as SOL on Solana. Konfide's roadmap includes a Jupiter swap layer for SOL → USDC conversion at receipt; for the hackathon demo, settlement lands as SOL.
5. The settlement runs through MagicBlock's Private Ephemeral Rollup. Wei is credited in 90 seconds. The Solana mainnet record shows that an invoice was settled — not the amount, not the parties.
6. Torque attributes a 50 bps rebate because this is Tunde and Wei's fifth trade. The rebate accrues to Tunde's next invoice automatically.

Total elapsed time: under two minutes. Total cost to Tunde: 25 bps settlement fee plus a 30–80 bps FX spread captured by KIRAPAY's solver. Total visible information leakage to competitors: zero.

## Why now

Three forces converged in 2024–2025 that did not exist when this product was first thinkable.

Stablecoin volume in emerging markets crossed an inflection. USDC and USDT volumes in Nigeria and Kenya doubled year-over-year `[verify]`, with B2B making up a meaningful share of that growth. The customer base now exists in numbers that did not three years ago.

Solana shipped Token-22, sub-second finality, and sub-cent fees. Konfide's product loop — settle in 90 seconds, charge 25 bps — is impossible on chains where finality is 12 seconds and fees are 50 bps. It is barely possible on Solana. The four properties intersect only here.

The Frontier sponsor lineup is convergent with this thesis. KIRAPAY (cross-chain), MagicBlock (privacy), Covalent (data), Torque (retention), Privy (onboarding) are exactly the building blocks Konfide needs. We did not assemble the stack and look for sponsors; the sponsors are the stack.

## Why Solana

Konfide needs four properties from its base layer: sub-second finality so a 90-second user experience is plausible, sub-cent fees so a 25 bps revenue model survives the gas cost, mature stablecoin float so settlement amounts are denominable in the currencies SMEs actually want, and a programmability story rich enough for confidential ephemeral execution (MagicBlock PER). The four intersect on Solana and nowhere else at the time of writing. Ethereum L2s have the programmability but lose on fees and stablecoin density per chain. Tron has the float but no programmability and no privacy story. Solana is the right base layer for this product because it is the only base layer for this product.

## Why us

The founder is in Lagos. The first 200 customers come through the founder's relationships. The next 2,000 come through those 200. SF-based competitors trying to penetrate the Computer Village importer community face an 18-month head start they cannot buy back with a larger Series A.

Concretely: the founder has direct access to the Computer Village wholesale district importers, walking-distance relationships with the trade associations that organise them, and personal credibility with the cohort that will be Konfide's pilot users. This is the kind of customer access that SF-based fintechs spend large amounts of capital and time trying to manufacture, and usually fail at. It is the most defensible part of the moat.

The team is research-heavy. The hexagonal architecture, the selective-disclosure privacy framing, and the trust-score design are not patterns picked up from a tutorial — they are deliberate technical choices that survive scrutiny. See [ARCHITECTURE.md](../ARCHITECTURE.md) for the full version.

`[TBD: team members and one-line credentials each — fill before submission]`.

## Demo

- **Video** — `[TBD: 3-minute video URL on YouTube unlisted]`.
- **Live demo** — `[TBD: stable URL on devnet]`.
- **GitHub** — `[TBD: public repo URL once made public]`.

## Architecture summary

Konfide is built on hexagonal (ports + adapters) architecture. The pure domain (`packages/core`) defines invoice, settlement, counterparty, and trust-score logic with zero external SDK dependencies. Each sponsor's SDK is wrapped in an adapter (`packages/adapters/<sponsor>`) implementing one of five port interfaces: `PaymentRouter` (KIRAPAY), `PrivacyLayer` (MagicBlock), `ChainData` (Covalent), `Loyalty` (Torque), `Identity` (Privy). The Anchor program in `packages/contracts` is deliberately minimal — three instructions, each under 30 lines — because on-chain logic is auditable per byte and we want to lock the upgrade authority quickly.

Privacy follows a three-layer model: amounts and counterparties are private (via MagicBlock PER), the fact-of-settlement is public (on Solana mainnet for regulatory auditability), and view keys allow selective disclosure to regulators on appropriate process. This is different from both the Tron USDT model (everything public) and a fully shielded model (no audit path).

Konfide is non-custodial. Each seller's invoice settles directly to the seller's Solana wallet, not to a Konfide-controlled treasury. For the hackathon demo, the platform runs as a single-merchant deployment; multi-tenant seller onboarding (with self-service wallet registration) is on the post-hackathon roadmap.

Full architectural detail in [ARCHITECTURE.md](../ARCHITECTURE.md).

## Sponsor integrations

| Sponsor    | Integration                                          | Status        | Code location                            |
| ---------- | ---------------------------------------------------- | ------------- | ---------------------------------------- |
| KIRAPAY    | Cross-chain checkout, the spine of payer settlement  | Live          | `packages/adapters/kirapay/`             |
| MagicBlock | Private Ephemeral Rollup for confidential settlement | Adapter built | `packages/adapters/magicblock/`          |
| Covalent   | Trust score from cross-chain transaction history     | Adapter built | `packages/adapters/covalent/`            |
| Torque     | Programmable rebates for repeat counterparty pairs   | Adapter built | `packages/adapters/torque/`              |
| Privy      | Embedded wallets and email-based onboarding          | Adapter built | `packages/adapters/privy/`               |

Status legend: `Adapter built` = port implementation scaffolded with method stubs; full integration shipping per [ROADMAP.md](../../ROADMAP.md). Live integration deltas at submission time:

- KIRAPAY: end-to-end devnet flow live. Create invoice → KIRAPAY hosted checkout → cross-chain payment → SOL settlement on Solana → webhook reconciliation. Verified manually on submission day.
- MagicBlock: `[TBD]`.
- Covalent: `[TBD]`.
- Torque: `[TBD]`.
- Privy: `[TBD]`.

Per-sponsor submissions (with deeper detail and judging-criteria alignment):

- [`docs/submissions/kirapay.md`](./kirapay.md)
- [`docs/submissions/magicblock.md`](./magicblock.md)
- [`docs/submissions/covalent.md`](./covalent.md)
- [`docs/submissions/torque.md`](./torque.md)

## Traction

`[TBD: any waitlist signups, pilot user pre-commitments, letters of intent from Computer Village importers, supplier-side conversations in Shenzhen]`.

The honest answer at submission time is likely: founder relationships and intent rather than signed pilots. Mark this section accurately — fabricated traction is worse than declared early-stage.

## Business model summary

Five revenue lines, total blended take rate at scale ~80 bps: settlement fee (25 bps, live at launch), FX spread share via KIRAPAY (30–80 bps, live at launch), float yield (5 bps annualised, post-launch), receivables financing (200–600 bps, Year 2), premium tiers ($99–499/month, Year 2). On Tunde's $12K invoice, Konfide collects approximately $80 versus the $480–840 he pays today through correspondent banking. Year 3 target: 1% of the Lagos-Guangzhou corridor at ~$27M annualised revenue.

Full version in [BUSINESS_MODEL.md](../BUSINESS_MODEL.md).

## Team

`[TBD: members with one-line credentials each — fill before submission]`.

Founder profile: Lagos-based, direct access to the Computer Village importer cohort, prior background in `[TBD]`. The founder market fit is the most important part of this submission and worth a paragraph — write it carefully.

## Funding ask

$20K via the Colosseum accelerator slot. Twelve-month use of funds:

- 60% engineering ($12K) — two full-time engineers and contractor support for the on-chain audit.
- 25% GTM and Lagos ground operations ($5K) — twenty paid pilot onboardings, Computer Village partnership fees, one Guangzhou trip for supplier-side outreach, customer-success operations.
- 15% legal and regulatory ($3K) — Lagos counsel for CBN classification work, UAE counsel for VARA preparatory work, security audit retainer.

Next-round target: $2.5M seed at month 12, contingent on hitting Year 1 milestones (200 active SME pairs, $30M annualised volume, $240K annualised revenue).

## Roadmap post-hackathon

3 months: pilot launch with 20 paid Computer Village importers; first labelled trust-score dataset; Lagos counsel engaged on CBN classification.

6 months: 200 active SME pairs across Lagos-Guangzhou; supplier-side network effect kicks in (suppliers refer their other Lagos buyers); Lagos-Istanbul corridor opens.

12 months: 2,000 active SME pairs; Lagos-Dubai corridor opens; security audit complete; mainnet deployment with $50K trade size cap; second-city Nigerian launches in Kano and Aba.

Full version in [ROADMAP.md Phase 8](../../ROADMAP.md#phase-8--post-hackathon).

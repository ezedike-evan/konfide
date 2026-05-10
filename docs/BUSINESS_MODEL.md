# Business model

This document is the business case for Konfide. Its intended readers are accelerator judges, prospective investors, and any team member who needs to defend a product decision against a "but how does this make money" question. It is the canonical answer to that question. For the technical architecture, see [ARCHITECTURE.md](./ARCHITECTURE.md). For implementation status, see [ROADMAP.md](../ROADMAP.md).

Numbers marked `[TBD]` or `[verify]` are placeholders awaiting research, customer interviews, or live data. They are intentionally visible rather than hidden behind plausible-sounding fabrications.

## Contents

- [The market](#the-market)
- [The wedge](#the-wedge)
- [Customer profile](#customer-profile)
- [Unit economics](#unit-economics)
- [Revenue model](#revenue-model)
- [Year 1 to 3 projections](#year-1-to-3-projections)
- [Go to market](#go-to-market)
- [Moat](#moat)
- [Competition](#competition)
- [Risks](#risks)
- [The ask](#the-ask)

## The market

Cross-border B2B payments is roughly a $5T annual flow globally `[verify: McKinsey or BIS recent figure]`. The fastest-growing slice is intra-emerging-market trade: African importers paying Asian manufacturers, Latin American buyers paying Middle East suppliers, Southeast Asian SMEs paying each other. This slice is the worst-served by traditional rails.

The West African corridor alone is a $30B annual outbound trade flow `[verify: Nigerian Bureau of Statistics + WTO trade data]`. Sub-corridors that matter for Konfide's first wedge:

- **Lagos to Guangzhou** — phone accessories, electronics, textiles. Estimated `[verify]` $8B annually with median invoice size $5K to $50K.
- **Lagos to Istanbul** — apparel, white goods, construction materials. Estimated `[verify]` $4B annually.
- **Lagos to Dubai** — re-exports, electronics, gold. Estimated `[verify]` $6B annually.

These are not the largest corridors in dollar terms — the largest are inside the OECD and inside Asia. They are the corridors where the failure modes of traditional rails are most acute: where SWIFT is slowest, correspondent fees highest, and crypto-rail privacy most needed. They are the corridors where Konfide's value proposition is tightest.

## The wedge

Konfide opens with one corridor — Lagos to Guangzhou — and one buyer profile — Nigerian phone accessories importers shipping in containers from the Computer Village wholesale district. The reasons:

**Frequency.** A Computer Village importer places orders every two to four weeks, not once per quarter. High frequency means a customer's tenth invoice comes within a year, which is the cohort point where the trust score and Torque rebates start meaningfully changing user behaviour.

**Repeatability of the counterparty pair.** A Lagos importer typically buys from the same two or three Guangzhou suppliers for years. That mapping is exactly the relationship Konfide's loyalty layer is designed to deepen.

**Invoice size in the right range.** $5K to $50K is large enough that the user is willing to learn a new product to save fees, small enough that the trust score's risk underwriting is meaningful (no single trade is bet-the-company), and within the range where current alternatives (correspondent banking, USDT on Tron) are most painful.

**Pain is concrete and quantifiable.** Tunde in Lagos pays approximately 4–7% all-in cost on a $12K wire transfer (4-5% FX spread + $400 fees + 5-day settlement = working-capital cost) `[verify: cross-check with three Lagos importers]`. Konfide compresses that to ~80 bps blended.

**Founder market fit.** The founder is based in Lagos and has direct access to the Computer Village importer community. No SF-based team can replicate this customer access without spending 12 months and significant capital. This is the durable wedge.

## Customer profile

### Tunde — Lagos importer

Tunde, 34, runs a small phone accessories import business in Computer Village, Ikeja. Annual import volume `[TBD: confirm with persona research]` ~$400K, split across roughly 20 orders to two Guangzhou suppliers. He has a Nigerian commercial bank account, a Wise account, and recently started using USDT on Tron because his Wise transfers were taking five days and getting flagged for compliance review.

What he does today: when a supplier confirms an order, he goes to a "money changer" in Computer Village to convert NGN to USDT on Tron, sends it to the supplier's wallet on a phone screenshot, the supplier confirms, the goods ship.

What this costs him: 2–4% FX spread at the money changer, ~$10 in Tron gas, no protection if the supplier disappears with the funds, no receipt that satisfies his Nigerian tax accountant.

What Konfide changes: Tunde signs in with his email, the platform provisions a Privy wallet, he creates an invoice for the supplier, the supplier accepts on their dashboard, Tunde pays from any chain (or fiat via on-ramp), settlement happens in 90 seconds with a confidential commitment on Solana, both sides have a tax-compliant receipt, and the trust score that builds up across counterparties becomes Tunde's portable credit history for the next supplier relationship.

### Wei — Shenzhen manufacturer

Wei, 41, runs a phone-case manufacturing operation in Bao'an, Shenzhen. Sells to importers across Africa and Latin America. Has a Chinese bank account, accepts USDT on Tron because that is what most of his African customers offer.

What he hates today: Tron USDT means every payment from every customer is publicly observable. A competitor who watches Tunde's wallet can infer Wei's pricing, his customer list, and his volume. For a mid-size manufacturer, that is competitively expensive information to be leaking.

What Konfide changes: amounts and counterparties are private by default, with selective disclosure available to a Chinese tax auditor on appropriate request. Wei's pricing and customer list are no longer public. He gets paid in USDC on Solana, which he can either hold, swap to RMB through a licensed off-ramp, or use to pay his own upstream suppliers.

## Unit economics

A representative trade: $12,000 invoice, Lagos importer paying Shenzhen supplier.

| Component                                        | Konfide take                                | Notes                                                                                                                  |
| ------------------------------------------------ | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Settlement fee                                   | 25 bps = $30                                | Charged to the buyer at checkout. Visible line item.                                                                   |
| FX spread (KIRAPAY-fulfilled FX)                 | 30–80 bps = $36–96                          | Captured as KIRAPAY rev share `[verify: actual rev share with KIRAPAY]`.                                               |
| Float yield on settled USDC during finality lag  | ~5 bps annualised on instantaneous balances | Negligible per trade; accrues at portfolio level.                                                                      |
| Receivables financing margin (optional)          | 200–600 bps when used                       | Only on trades where the buyer chooses 30/60/90-day terms; out-of-scope for hackathon, Phase 8 product.                |
| Premium tier (Konfide Plus)                      | $99–499/month per business                  | Bulk invoice issuance, API access, priority dispute resolution. Phase 8.                                               |

Per-trade Konfide gross take on the $12K invoice: $30 (settlement) + $50 (mid-range FX spread) = ~$80, blended ~67 bps. At scale the blended take rate is ~80 bps once a meaningful slice of trades use financing or premium tiers.

For comparison: Tunde's current cost on the same trade is approximately 4–7% all-in. Konfide compresses to ~80 bps. That is the wedge in one number.

## Revenue model

Five revenue lines, listed in order of when they go live:

1. **Settlement fee** (live at launch). 25 bps per settled invoice. Visible to the buyer at checkout. The price is salient because we want to be obviously cheaper than the 4–7% the buyer pays today; we do not want to be invisible.
2. **FX spread** (live at launch via KIRAPAY rev share). Konfide captures a share of the FX spread KIRAPAY's solver network charges on the cross-chain leg. Negotiated `[verify]`.
3. **Float yield** (live ~6 months post-launch). USDC balances during the brief finality lag earn yield on a money-market deployment. Phase 8 — requires a custody and treasury setup that is out of hackathon scope.
4. **Receivables financing** (Year 2). Buyers can choose 30/60/90-day net terms; Konfide underwrites using the trust score, charges a financing margin, and offloads the balance sheet to a partner credit fund.
5. **Premium tiers** (Year 2). Konfide Plus for businesses doing >50 invoices/month — bulk issuance, API access, white-label payer pages, priority dispute resolution.

## Year 1 to 3 projections

`[TBD: numbers to be filled in once five Lagos pilot users are interviewed and a defensible bottom-up model exists. Placeholders below, mark when refined.]`

| Metric                     | Year 1 (target) | Year 2 (target) | Year 3 (target) |
| -------------------------- | --------------- | --------------- | --------------- |
| Active SME pairs           | 200             | 2,000           | 15,000          |
| Monthly invoice volume     | $2.5M           | $40M            | $300M           |
| Annualised volume          | $30M            | $480M           | $3.6B           |
| Blended take rate          | 80 bps          | 80 bps          | 75 bps          |
| Annualised revenue         | $240K           | $3.8M           | $27M            |

The Year 3 target is a 1% slice of the Lagos-Guangzhou corridor. The targets assume the Computer Village pilot extends to Nairobi, Accra, Cairo, Istanbul, and Dubai by Year 2.

## Go to market

### Phase A — Pilot (months 0 to 3)

Twenty paid pilot onboardings recruited through the founder's network in the Computer Village importer community. Free first three months in exchange for weekly feedback calls. Goal: prove the 90-second settlement story works in production for real trades, and that the trust score visibly tracks behaviour. The pilots also produce the first labelled dataset for the trust-score weighting.

### Phase B — Lagos density (months 3 to 9)

Partnership with the Computer Village Traders' Association (or its functional equivalent — `[verify: actual association name]`) to onboard the next 200 importers. Supplier-side network effect: every Lagos importer brings 2–3 Guangzhou suppliers, each of whom now has an inbound reason to onboard. The supplier side has the strongest incentive to refer their other Lagos customers.

### Phase C — Corridor expansion (months 9 to 18)

In order: Lagos-Istanbul, Lagos-Dubai, then second-city Nigerian launches in Kano and Aba, then Nairobi, Accra, Cairo. Each new corridor follows the same pattern: identify the dense importer community, partner with an existing trade association, run a 20-business pilot, then open up.

### Phase D — Platform (Year 2+)

API access for fintech partners, white-label payer pages, receivables financing as a standalone product. Out of scope for this document beyond a one-line mention.

## Moat

Konfide's moat compounds across four mostly independent dimensions, which is what makes the moat durable rather than just deep.

**Trust-score data compounding.** Every settled invoice strengthens the score model and makes it harder for a new entrant to match underwriting accuracy. The first competitor to copy the architecture starts from zero data; Konfide is already six months ahead by the time they ship. The data advantage compounds quadratically because diversity of counterparty pairs, not just transaction count, matters.

**Corridor licensing burden.** Each new corridor requires regulatory work — Nigeria CBN registrations, China cross-border payment classification, UAE VARA equivalents. A competitor who tries to copy three corridors at once spreads their legal team thin. Konfide's one-corridor-at-a-time approach lets us do the legal work in series, which is cheaper per corridor and produces a moat per corridor.

**Network density per corridor.** Once a corridor reaches ~100 active SME pairs, switching costs (counterparty trust scores, repeat-trade rebates, supplier relationships) start working in favour of the incumbent. A new entrant's payer would not see their suppliers, and their suppliers would not see their payers. The empty-network problem is brutal in two-sided B2B.

**Privacy architecture expertise.** The selective-disclosure design — private by default, auditable by design — is genuinely hard to get right and trivially easy to get wrong (either too leaky or too compliance-blocked). Building the design once and getting it right is a multi-engineer-month investment that a 4-person team copying us would have to repeat from scratch.

**Founder market fit.** The founder is in Lagos. The first 200 customers come through the founder's relationships. The next 2,000 come through those 200. SF-based competitors trying to penetrate the Computer Village community face an 18-month head start they cannot buy back.

## Competition

| Competitor                   | Speed       | Cost      | Privacy | Trust layer | Regulatory clarity | Note                                                                |
| ---------------------------- | ----------- | --------- | ------- | ----------- | ------------------ | ------------------------------------------------------------------- |
| **Wise** (correspondent)     | 3–5 days    | 1–2%      | High    | None        | High               | Fast for retail, slow for B2B amounts; no programmability.          |
| **OFX** (correspondent)      | 2–4 days    | 0.5–1.5%  | High    | None        | High               | Better pricing than Wise at large volumes; same speed limits.       |
| **USDT on Tron**             | <1 minute   | 0.1–0.5%  | None    | None        | Grey               | Fastest informal rail; zero privacy; zero programmability.          |
| **Yellow Card** (CEX)        | <1 hour     | 1–3%      | Medium  | None        | Improving          | Strong African presence; CEX-shaped, not invoice-shaped.            |
| **Bitso** (CEX)              | <1 hour     | 1–3%      | Medium  | None        | Improving          | Strong LATAM presence; same shape limitation.                       |
| **Konfide**                  | ~90 seconds | ~80 bps   | High    | Yes         | In progress        | The only entry that combines all five.                              |

The right framing is not "Konfide is faster than Wise" or "Konfide is cheaper than Yellow Card." It is "Konfide is the only product that does all five of speed, cost, privacy, trust, and regulatory clarity at once for cross-border B2B." Removing any one of the five reduces it to an existing category that already has incumbents.

## Risks

**Regulatory — Nigeria CBN.** Cross-border payment activity in Nigeria operates under evolving Central Bank guidance. Konfide's settlement-and-FX activity may be classified as needing an IMTO or PSP licence `[verify with Nigerian counsel]`. Mitigation: engage Lagos fintech counsel during Phase B, structure as a payments-services partnership with a licensed entity if needed, treat compliance posture as a moat rather than a tax.

**Regulatory — UAE VARA.** When the Lagos-Dubai corridor opens, VARA registration is required for any virtual-asset service provider. Mitigation: treat VARA registration as a Phase C prerequisite, budget for it.

**KIRAPAY dependency.** KIRAPAY is the cross-chain spine. If KIRAPAY's solver network has an outage, every cross-chain Konfide payment is blocked. Mitigation: graceful degradation to Solana-only payers during outages; document the SLA expectations in our partner agreement; long-term, abstract `PaymentRouter` so a second router can be added without architectural change (the abstraction is already in place — `packages/core/src/ports/payment-router.ts`).

**Liquidity in corridor stablecoins.** USDC liquidity on Solana is deep enough to support Konfide's first three corridors. EURC, GBPC, and other regional stablecoins are thinner. Mitigation: route through USDC as the universal middle leg even when the user-facing currencies differ; revisit when regional stablecoins reach critical mass.

**Privacy versus compliance tension.** A regulator who does not understand the selective-disclosure model could mistake Konfide for an unmoderated mixer. Mitigation: pre-emptive engagement with the Lagos and Abuja CBN teams during Phase A; clear public documentation of the disclosure flow; no anonymity claims, ever — the framing is privacy with audit, not privacy without audit.

**Bridge risk.** Cross-chain transfers carry bridge risk. KIRAPAY's solver network mitigates the worst forms of bridge risk by avoiding lock-and-mint patterns, but no cross-chain operation is risk-free. Mitigation: cap individual settlement size at $50K during the first six months of mainnet operation; insurance partner `[TBD]`.

**Market timing.** If the broader stablecoin regulatory picture in Nigeria deteriorates, the corridor could narrow before Konfide reaches density. Mitigation: corridor optionality — the architecture is corridor-agnostic, so a regulatory clamp in Lagos accelerates Lagos-Istanbul or Nairobi-Guangzhou substitution rather than killing the company.

## The ask

Konfide is raising a $250K pre-seed via the Colosseum accelerator slot conferred on Frontier Hackathon winners.

Use of funds, 12 months:

- **60% engineering** ($150K). Two full-time engineers (founder + one hire) for 12 months at Lagos market compensation, plus contractor support for the on-chain audit.
- **25% GTM and Lagos ground operations** ($62.5K). Twenty paid pilot onboardings, Computer Village partnership fees, supplier-side outreach in Guangzhou (one trip), customer-success operations.
- **15% legal and regulatory** ($37.5K). Lagos counsel for CBN / IMTO classification, UAE counsel for VARA preparatory work, security audit retainer.

The next-round target is a $2.5M seed at month 12, contingent on hitting the Year 1 milestones above. Expected lead `[TBD]`.

The ask is small relative to the market because the wedge is small. We are not raising a $5M round to "expand to fifteen corridors and build the platform." We are raising what we need to dominate one corridor, then raising again from a position of revenue and density.

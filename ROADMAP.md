# Roadmap

This document is the founder's source of truth for what is built, what is in progress, what is planned, and what has been deliberately deferred. It is intended for the Konfide team and any contributor or judge who wants to know the precise state of the project at a glance. Update the check marks as items complete; do not delete completed items — they are the audit trail.

The intended reader is anyone who needs to answer the question "what's actually shipped right now?" without trusting a slide deck or a demo video.

## Legend

- `[ ]` Not started
- `[~]` In progress
- `[x]` Complete
- `[!]` Blocked
- `[-]` Deferred or cut from scope

## Hackathon timeline

| Date           | Milestone                                   |
| -------------- | ------------------------------------------- |
| 2026-05-10     | Documentation sprint complete (this doc)    |
| 2026-05-12     | Frontier main submission deadline           |
| 2026-05-20     | KIRAPAY sidetrack submission deadline       |
| 2026-05-26     | Covalent and Torque sidetrack deadlines     |
| 2026-05-27     | MagicBlock sidetrack deadline               |
| 2026-05-27     | All Frontier sidetracks closed              |

All deadlines are in the team's local timezone (WAT, UTC+1). Submissions are uploaded the evening before to leave room for upload failures.

---

## Phase 0 — Scaffolding

Goal: every package compiles, every workspace is wired, CI runs green on a fresh clone.

- [x] pnpm + Turborepo monorepo configured
- [x] TypeScript 5.6 strict-mode base configs in `packages/config/tsconfig`
- [x] Biome lint + format configured (no ESLint, no Prettier)
- [x] Zod schemas for invoice, counterparty, settlement, trust score, api, events in `packages/types`
- [x] Pure domain layer in `packages/core/src/domain` (Invoice, Counterparty, Settlement, Money, Corridor, value objects)
- [x] Port interfaces defined in `packages/core/src/ports` (PaymentRouter, PrivacyLayer, ChainData, Loyalty, Identity)
- [x] Adapter package skeletons for KIRAPAY, MagicBlock, Covalent, Torque, Privy, Solana
- [x] Anchor program skeleton in `packages/contracts/programs/konfide` with three instructions stubbed
- [x] Next.js 16 issuer dashboard shell in `apps/web`
- [x] Hono API shell in `apps/api` with Drizzle schema for the four tables
- [x] Background indexer skeleton in `apps/indexer`
- [x] Nextra docs site shell in `apps/docs`
- [x] CI workflow `ci.yml` (lint + typecheck + test on every PR)
- [x] CI workflow `contracts-test.yml` (Anchor build + test, currently allowed to fail)
- [x] CI workflow `deploy-docs.yml` (gated until secrets are set)
- [x] `.env.example` with every sponsor key required
- [x] `.gitignore` covering Node, Next.js, Turbo, Anchor target, Solana keypairs

---

## Phase 1 — Documentation sprint

Goal: any judge or contributor can land on the repo cold and reach the right answer in under three minutes. This phase produced the docs you are reading now.

- [~] `README.md` rewritten with hero, architecture diagram, sponsor matrix, quickstart
- [~] `ROADMAP.md` (this document)
- [~] `docs/ARCHITECTURE.md` with hexagonal explanation, data flow, privacy model
- [~] `docs/INTEGRATIONS.md` with one full section per sponsor
- [~] `docs/BUSINESS_MODEL.md` with market, wedge, unit economics, moat
- [~] `docs/CONTRIBUTING.md` adapted to the hexagonal constraints
- [~] `docs/SECURITY.md` with threat model and disclosure policy
- [~] `docs/submissions/frontier-main.md` ready for Colosseum upload
- [~] `docs/submissions/kirapay.md` tailored to KIRAPAY judging weights
- [~] `docs/submissions/magicblock.md` tailored to MagicBlock judging weights
- [~] `docs/submissions/covalent.md` tailored to GoldRush judging weights
- [~] `docs/submissions/torque.md` tailored to Torque judging weights
- [~] `apps/docs` Nextra site populated with the public version of every doc
- [~] `.github/PULL_REQUEST_TEMPLATE.md`
- [~] `.github/ISSUE_TEMPLATE/{bug_report,feature_request,sponsor_integration}.md`

Mark each `[x]` once the file lands on `main` with the `[TBD]` markers tracked in the Decision Log below.

---

## Phase 2 — KIRAPAY integration

Goal: a payer on any chain can settle an invoice, with funds landing as USDC on Solana, end-to-end on devnet. This is the integration that turns Konfide from a slide into a product.

Target: end-to-end devnet flow recorded by 2026-05-12 (for the Frontier main submission), polished demo by 2026-05-20 (for the KIRAPAY sidetrack).

- [ ] Reviewed KIRAPAY public docs and intent-spec (link in `docs/INTEGRATIONS.md`)
- [ ] `KIRAPAY_API_KEY` provisioned for devnet
- [ ] `KIRAPAY_WEBHOOK_SECRET` provisioned and stored in 1Password vault
- [ ] `KirapayClient` HTTP wrapper implemented in `packages/adapters/kirapay/src/client.ts`
- [ ] `KirapayPaymentRouter.quote()` implemented
- [ ] `KirapayPaymentRouter.createSession()` implemented
- [ ] `KirapayPaymentRouter.resolveSession()` implemented
- [ ] Webhook signature verification implemented (HMAC SHA-256)
- [ ] `POST /webhooks/kirapay` route handles `payment.confirmed`, `payment.failed`, `payment.partial`
- [ ] Invoice creation endpoint `POST /invoices` returns a payable URL
- [ ] Public payer page at `/pay/[invoiceId]` renders the KIRAPAY hosted checkout
- [ ] Settlement record persisted to `settlements` table on confirmed webhook
- [ ] On-chain `settle_invoice` instruction submitted on confirmed webhook
- [ ] End-to-end devnet test from Polygon USDC → Solana USDC settlement
- [ ] Demo recording (3 min, screen capture + voiceover, Lagos-Guangzhou narrative)

Risks: KIRAPAY API stability on devnet, rate limits during demo recording, cross-chain solver latency unpredictability.

---

## Phase 3 — Frontier main submission

Goal: a Colosseum judge reads the submission, opens the repo, watches a 3-minute video, and walks away thinking "these people can ship and the founder is in the right place at the right time."

Deadline: 2026-05-12.

- [ ] Pitch deck drafted (10 slides, problem → solution → traction → team)
- [ ] Demo video recorded (3 min, ≤200 MB, mp4)
- [ ] `docs/submissions/frontier-main.md` finalised with no `[TBD]` markers
- [ ] GitHub repo public with green CI badge
- [ ] Live demo deployed to a stable URL on devnet (Vercel for web, Fly for api)
- [ ] Colosseum submission form filled and submitted
- [ ] Internal practice run of the pitch with at least two outsiders giving feedback

---

## Phase 4 — Covalent trust scoring

Goal: every counterparty profile shows a non-trivial trust score derived from real on-chain history pulled via Covalent GoldRush. The score visibly changes when a new counterparty has settled multiple invoices.

Deadline: 2026-05-26.

- [ ] Covalent API key provisioned via the GoldRush dashboard
- [ ] `COVALENT_API_KEY` added to `.env.example` (already done) and to deployment secrets
- [ ] `CovalentClient.fetchTransfers` implemented, with pagination
- [ ] `CovalentChainData.fetchHistory` implemented and unit-tested
- [ ] Cross-chain normalisation tested for Solana, Ethereum, Polygon, Base
- [ ] Trust scoring algorithm specified in `docs/ARCHITECTURE.md` (features, weights, scaling)
- [ ] `ScoringService.refresh` implemented in `packages/core/src/services/scoring-service.ts`
- [ ] Indexer worker `apps/indexer/src/workers/trust-score-refresher.ts` runs on a schedule
- [ ] `TrustScoreBadge` UI component renders the tier and numeric score
- [ ] Counterparty profile page `/counterparties/[handle]` shows score + factor breakdown
- [ ] Sample data seeded so the demo shows non-zero scores
- [ ] Demo video recorded specifically for the Covalent submission
- [ ] `docs/submissions/covalent.md` finalised

Risks: cold-start counterparties have no history; document the cold-start handling clearly. Mixed activity (B2B + DeFi) requires filtering heuristics that may need tuning.

---

## Phase 5 — Torque loyalty layer

Goal: a repeat counterparty pair sees a measurable rebate on their second, fifth, and tenth invoices. The simulation script produces a realistic activity graph that Torque judges can scrub through.

Deadline: 2026-05-26.

- [ ] Torque API access requested via the sponsor Telegram group
- [ ] Torque project provisioned with a `konfide-` prefix
- [ ] `TORQUE_API_KEY` added to deployment secrets
- [ ] Custom event schema defined for `invoice_created`, `invoice_settled`, `dispute_opened`, `dispute_resolved`
- [ ] `TorqueClient.emit` implemented
- [ ] `TorqueLoyalty.record` implemented
- [ ] `TorqueLoyalty.campaignsFor` implemented
- [ ] Rebate logic implemented: `[TBD: confirm 1st = 0 bps, 2nd = 30, 5th = 50, 10th+ = 75]`
- [ ] Repeat-counterparty detector wired through `SettlementService`
- [ ] Simulation script `tooling/scripts/simulate-trade.ts` generates a 30-day activity graph
- [ ] Friction log started (Torque explicitly asks for one) — see `docs/submissions/torque.md`
- [ ] Demo video recorded
- [ ] `docs/submissions/torque.md` finalised

---

## Phase 6 — MagicBlock privacy layer

Goal: invoice settlement amounts and counterparty identities are committed inside a Private Ephemeral Rollup (PER), not to Solana mainnet. The L1 record contains only the fact-of-settlement plus a commitment hash.

Deadline: 2026-05-27.

- [ ] MagicBlock PER and Ephemeral Rollup documentation reviewed
- [ ] Decision logged: which fields live in PER vs L1 (record in Decision Log below)
- [ ] `MAGICBLOCK_API_KEY` and `MAGICBLOCK_RPC_URL` provisioned
- [ ] `MagicblockClient.openSession` implemented
- [ ] `MagicblockPrivacyLayer.beginSession` implemented
- [ ] `MagicblockPrivacyLayer.settle` implemented with shielded amount commitment
- [ ] Selective disclosure design documented (view keys, regulator scope)
- [ ] Settlement service wired so invoices route through the privacy layer by default
- [ ] On-chain commitment proof verified against the PER session
- [ ] Demo video specifically explaining the privacy model
- [ ] `docs/submissions/magicblock.md` finalised with the selective-disclosure framing

Risks: PER capabilities are early; document fallback to plain ER + client-side encryption if PER blocks the deadline.

---

## Phase 7 — Polish and submit

Goal: every submission is uploaded, every video is captioned, every link works. Nothing left to "just one more tweak" the night before.

Window: 2026-05-26 to 2026-05-27.

- [ ] Every submission doc reviewed against the corresponding sponsor's published judging criteria
- [ ] All five demo videos uploaded to YouTube unlisted with correct sponsor tags
- [ ] All submission forms filled and screenshotted as proof of submission
- [ ] GitHub release `v0.1.0-frontier` tagged
- [ ] README.md final pass (every link works, every code block runs)
- [ ] Live demo URL load-tested for the judging window

---

## Phase 8 — Post-hackathon

Goal: convert hackathon momentum into a fundable company.

- [ ] Investor outreach package: deck, one-pager, financial model, data room
- [ ] Colosseum accelerator interview prep (if Frontier-main shortlists us)
- [ ] First five Computer Village importer interviews booked
- [ ] First five Shenzhen supplier interviews booked
- [ ] Pilot user recruitment plan with 20 paid onboarding slots
- [ ] Regulatory consultation with the NeosLegal certificate winner (if won)
- [ ] Security audit scoping with at least three Solana auditors
- [ ] Legal entity formation decision (Delaware C-corp + Nigerian subsidiary)
- [ ] Bank-grade KYB partner shortlisted

---

## Out of scope for the hackathon

These are deliberately deferred. Documenting them here prevents scope creep during crunch and signals to judges that the team understands prioritisation.

- [-] Native iOS or Android apps (PWA only for now)
- [-] On-ramps beyond MoonPay (defer until corridor expansion)
- [-] Fiat off-ramp partner integrations (Wise, OFX) — defer to Phase 8
- [-] Multi-corridor expansion beyond Lagos-Guangzhou (one corridor at a time)
- [-] Receivables financing primitive (large surface, defer to seed-stage)
- [-] White-label SDK for other B2B fintechs (defer until product-market fit)
- [-] Secondary market for invoice receivables (defer indefinitely until base case proven)
- [-] Custom bridge or solver implementation (use KIRAPAY end-to-end)
- [-] Token launch or governance design

---

## Decision log

Every architectural and product decision that the team would otherwise have to re-litigate gets one row here. Newest at the top.

| Date       | Decision                                                                                  | Rationale                                                                                                                                                                                       |
| ---------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-05-10 | Hexagonal architecture with `packages/core` purity rule (no SDK imports in domain)        | Sponsor SDKs churn; the domain must not. Also makes integration depth legible to judges and to a future security auditor.                                                                       |
| 2026-05-10 | KIRAPAY is the cross-chain spine, not an optional rail                                    | Building our own cross-chain solver in three weeks is unrealistic. KIRAPAY's intent layer is the cheapest path to "any chain in, USDC on Solana out".                                           |
| 2026-05-10 | One corridor (Lagos-Guangzhou) for the hackathon demo                                     | Multi-corridor sounds bigger but spreads the demo too thin. One specific Tunde-Wei narrative beats five generic ones.                                                                           |
| 2026-05-10 | Anchor program kept deliberately minimal (three instructions)                             | On-chain logic is auditable per byte; off-chain logic is iterable per minute. Push everything we can into the API and keep the program small.                                                  |
| 2026-05-10 | `[TBD: trust score weighting]` left in the architecture doc rather than guessed           | Tuning weights without real wallet data produces fake confidence. Mark as TBD, ship the framework, fill the weights once Phase 4 has data.                                                     |
| 2026-05-10 | Documentation sprint precedes adapter implementation                                      | Sponsor judges read docs before they read code. A repo with green CI and excellent docs but stub adapters reads better than a half-implemented integration with no narrative.                  |

When you make a decision worth remembering — e.g. choosing PER over plain ER, or capping invoice size at $50K for the demo — add a row here with the date and a one-line rationale. Future-you will thank present-you.

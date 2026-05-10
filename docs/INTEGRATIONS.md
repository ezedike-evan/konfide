# Integrations

This document is the index of every external system Konfide relies on, with one full section per sponsor. Its intended readers are sponsor judges who want to verify integration depth quickly, and contributors deciding which adapter to extend. For the architectural context behind the ports-and-adapters pattern, see [ARCHITECTURE.md](./ARCHITECTURE.md). For implementation status, see [ROADMAP.md](../ROADMAP.md).

Each section follows the same template so a judge can compare across sponsors without re-orienting.

## Contents

- [KIRAPAY](#kirapay)
- [MagicBlock](#magicblock)
- [Covalent GoldRush](#covalent-goldrush)
- [Torque](#torque)
- [Privy](#privy)

---

## KIRAPAY

### What they do

KIRAPAY operates an intent-based cross-chain payment network. Users express what they want to receive (currency, amount, chain) and KIRAPAY's solver network competes to fulfil the intent at the best price. Settlement on Solana is the destination; the source can be any major chain the network supports.

### What we use them for in Konfide

KIRAPAY is the spine of Konfide's payer-side checkout. A buyer in Lagos paying with USDT on Polygon, or in Shenzhen paying with USDT on Tron, or in Dubai paying with USDC on Base, all reach the same Konfide invoice through KIRAPAY's intent layer. The seller is paid in USDC on Solana regardless of what the buyer paid. Without KIRAPAY we would have to either build our own cross-chain solver (unrealistic in the hackathon window) or limit Konfide to Solana-native payers (which is the wrong wedge).

### Port implemented

`PaymentRouter` — see `packages/core/src/ports/payment-router.ts`.

### Adapter location

`packages/adapters/kirapay/`. Specifically `src/client.ts` for the HTTP wrapper and `src/kirapay-adapter.ts` for the port implementation.

### Key SDK methods used

- `quote(invoice, fromChain)` — query the solver network for available routes from a given chain, returning amount, fees, and estimated finality time per route.
- `createSession(invoice, route)` — open a hosted-checkout session for the buyer; returns a URL the buyer is redirected to.
- `resolveSession(sessionId)` — read the final state of a session once funds have arrived; used as a backstop for when a webhook is missed.
- `verifyWebhook(payload, signature, secret)` — HMAC SHA-256 verification on inbound webhooks `payment.confirmed`, `payment.failed`, `payment.partial`.

`[verify against KIRAPAY docs]` — exact endpoint names and signature scheme to be confirmed once integration begins.

### Setup

Required env vars:

- `KIRAPAY_API_KEY` — server-side API key from the KIRAPAY dashboard.
- `KIRAPAY_WEBHOOK_SECRET` — HMAC secret used to verify inbound webhooks.

Provisioning: register a project in the KIRAPAY dashboard, generate a devnet key, configure webhook URL `https://<api-host>/webhooks/kirapay`, store secrets in deployment env.

### Integration depth

Currently `[~]` — adapter package scaffolded with `KirapayPaymentRouter` implementing `PaymentRouter`. All methods throw `NotImplementedError`. Real implementation is Phase 2 in the roadmap, targeting end-to-end devnet by 2026-05-12.

### Where it shows up in the demo

The public payer page at `/pay/[invoiceId]`. The buyer clicks a CTA that opens the KIRAPAY hosted checkout, signs on their source chain, and the page polls for a confirmed settlement.

### Edge cases handled

- Wallet detection: `[verify with KIRAPAY: chain auto-detection from connected wallet]`.
- Payment timeout retries: backoff to 5s, 15s, 60s.
- Partial settlements: `payment.partial` webhook event mapped to invoice status `partially_paid`.
- Multi-token routing: if the preferred token is unavailable on the source chain, fall back to USDC.
- Webhook replay: idempotency keyed on `(sessionId, eventType, eventTimestamp)`.

### Sponsor's judging criteria

KIRAPAY weights "Depth of Integration" at 40% of the score, with the remainder split across product, demo quality, and write-up. The dedicated submission emphasises that KIRAPAY is the spine, not an add-on.

### Submission

[`docs/submissions/kirapay.md`](./submissions/kirapay.md).

---

## MagicBlock

### What they do

MagicBlock provides ephemeral rollups (ER) and private ephemeral rollups (PER) that run as off-chain execution layers anchored to Solana. State lives in the rollup for the duration of a session; commitments to L1 are produced when the session closes.

### What we use them for in Konfide

MagicBlock's PER is the privacy substrate for confidential settlements. When an invoice is settled, the amount, counterparty mapping, and any sensitive metadata flow through the PER session. The Solana program receives only a commitment hash plus a status flag — public observers see "an invoice settled" but not "Tunde paid Wei $12,000 for phone accessories." See the [Privacy model](./ARCHITECTURE.md#privacy-model) section in ARCHITECTURE.md for the three-layer framing (private / public / selectively disclosable).

### Port implemented

`PrivacyLayer` — see `packages/core/src/ports/privacy-layer.ts`.

### Adapter location

`packages/adapters/magicblock/`. Specifically `src/client.ts` for the rollup endpoint wrapper and `src/magicblock-adapter.ts` for the port implementation.

### Key SDK methods used

- `openSession()` — open a PER session and obtain the rollup endpoint plus a session id.
- `commitSettlement(session, payload)` — write the shielded payload into the session.
- `closeSession(session)` — finalise the session and produce the commitment hash that lands on L1.

`[verify against MagicBlock docs: exact API surface for PER vs ER]`.

### Setup

Required env vars:

- `MAGICBLOCK_API_KEY` — API key from the MagicBlock dashboard.
- `MAGICBLOCK_RPC_URL` — RPC endpoint for the ephemeral rollup.

### Integration depth

Currently `[~]` — adapter package scaffolded with `MagicblockPrivacyLayer` implementing `PrivacyLayer`. All methods throw `NotImplementedError`. Real implementation is Phase 6 in the roadmap, targeting completion by 2026-05-27.

### Where it shows up in the demo

Implicit. The settlement flow on `/pay/[invoiceId]` routes through the privacy layer, producing a Solana transaction whose explorer view shows a commitment hash and a status flag — not an amount. The dashboard side renders the decrypted amount because the issuer holds the view key.

### Edge cases handled

- PER session expiry: sessions are short-lived; settlement service refreshes if a session ages out mid-flow.
- L1 commitment failure: retried with exponential backoff; surfaced as `disputed` only after exhausting retries.
- Selective disclosure: the protocol exposes a `view-key` flow for granting decryption access to a third party (e.g. a regulator). Documented in [ARCHITECTURE.md](./ARCHITECTURE.md#privacy-model). `[TBD: signature scheme for view-key issuance]`.

### Sponsor's judging criteria

MagicBlock weights "Technology" at 40%. The submission leads with the selective-disclosure framing because it directly addresses the technical challenge "how do you make on-chain B2B payments private without making them unauditable."

### Submission

[`docs/submissions/magicblock.md`](./submissions/magicblock.md).

---

## Covalent GoldRush

### What they do

Covalent's GoldRush API is a unified-data API across many chains. A single endpoint returns transfer history, balance history, and contract events normalised to a common schema, regardless of whether the underlying chain is Ethereum, Polygon, Solana, or any of the others Covalent supports.

### What we use them for in Konfide

Covalent powers the trust score. To rate a counterparty's reliability, we need their full on-chain history across every chain they have used — not just Solana. GoldRush gives us that in one call per chain, with consistent shape, so the scoring service does not need a per-chain implementation.

### Port implemented

`ChainData` — see `packages/core/src/ports/chain-data.ts`.

### Adapter location

`packages/adapters/covalent/`. Specifically `src/client.ts` for the HTTP wrapper and `src/covalent-adapter.ts` for the port implementation.

### Key SDK methods used

- Transfers endpoint — fetch ERC-20 / SPL transfer history for a wallet.
- Balances endpoint — current and historical balance snapshots, used for volume features.
- Wallet activity endpoint — first-seen and last-seen timestamps for the wallet-age feature.

`[verify against Covalent GoldRush docs: exact endpoint names and pagination scheme]`.

### Setup

Required env var:

- `COVALENT_API_KEY` — API key from the GoldRush dashboard.

### Integration depth

Currently `[~]` — adapter package scaffolded with `CovalentChainData` implementing `ChainData`. All methods throw `NotImplementedError`. Real implementation is Phase 4, targeting completion by 2026-05-26.

### Where it shows up in the demo

Counterparty profile pages at `/counterparties/[handle]` and the trust score badge that appears next to a counterparty's name on every invoice. The badge tier visibly improves as the simulated counterparty settles more invoices.

### Edge cases handled

- Cold start: a wallet with no history gets `unrated`. The UI explicitly labels this rather than rendering a low score.
- Mixed activity: B2B + DeFi noise is filtered by classifying counterparties (DEX router, AMM pool, CEX deposit address) and excluding them from the recurring-counterparty count.
- Rotated wallets: the trust score is wallet-scoped, not user-scoped. A user who rotates wallets restarts with `unrated`. Future work: cryptographic linkage between wallets a user controls.
- Pagination: Covalent's max page size and rate limits handled with token-bucket retry.

### Sponsor's judging criteria

Covalent invites "creative applications of GoldRush data." The trust-score use case fits that brief precisely: it turns transaction history into a forward-looking risk signal, which is the use case GoldRush was designed for but most submissions skip in favour of dashboards.

### Submission

[`docs/submissions/covalent.md`](./submissions/covalent.md).

---

## Torque

### What they do

Torque is a programmable retention engine. You define events that matter to your product (sign-up, repeat purchase, milestone), pass them in via the API, and Torque attributes rebates, rewards, and campaigns based on the rules you configure.

### What we use them for in Konfide

B2B retention is unusual: each trade is high-value and intermittent, repeat-counterparty pairs are valuable but underincentivised, and the relationship is between two parties on opposite sides of an invoice. Torque is well-suited to programmable rebates that escalate with relationship depth — first trade with a new counterparty: no rebate, second: 30 bps, fifth: 50 bps, tenth and beyond: 75 bps.

### Port implemented

`Loyalty` — see `packages/core/src/ports/loyalty.ts`.

### Adapter location

`packages/adapters/torque/`. Specifically `src/client.ts` for the HTTP wrapper and `src/torque-adapter.ts` for the port implementation.

### Key SDK methods used

- Custom events emit — `invoice_created`, `invoice_settled`, `dispute_opened`, `dispute_resolved`.
- Campaigns query — return active campaigns relevant to a given counterparty.
- Reward attribution — Torque attributes rebate amounts based on configured rules.

`[verify against Torque docs: exact API for custom events]`.

### Setup

Required env var:

- `TORQUE_API_KEY` — API key.

Access is provisioned through the sponsor's Telegram group, not a public dashboard. The team requests access early in Phase 5.

### Integration depth

Currently `[~]` — adapter package scaffolded with `TorqueLoyalty` implementing `Loyalty`. All methods throw `NotImplementedError`. Real implementation is Phase 5, targeting completion by 2026-05-26.

### Where it shows up in the demo

Two surfaces. First, the issuer dashboard shows a "Repeat counterparty rebate active" badge on the invoice creation screen when the chosen counterparty is a repeat. Second, the simulation script `tooling/scripts/simulate-trade.ts` produces a 30-day activity graph that judges can scrub through to see the cohort retention curve.

### Edge cases handled

- New counterparty pair: rebate is zero. `[TBD: confirm whether Torque expects an event with zero reward or no event at all]`.
- Disputed trade: dispute event reverses any pending rebate accrual.
- Cancelled invoice: no event emitted; cancellation is not a settlement.

### Sponsor's judging criteria

Torque judges "measurable use of incentives." The submission leads with simulated activity numbers because Torque scores live activity, not just code presence — a stub adapter that sits there does not earn the prize.

### Submission

[`docs/submissions/torque.md`](./submissions/torque.md).

---

## Privy

### What they do

Privy is an auth and embedded-wallet provider. They wrap email / SMS / social login with custodial-by-default, exportable-to-self-custody wallets across Ethereum and Solana. The product is aimed at consumer fintech onboarding flows where forcing a hardware wallet would lose 90% of users at the first step.

### What we use them for in Konfide

Tunde in Lagos has a phone, not a Phantom install. Wei in Shenzhen runs a manufacturing business, not a crypto portfolio. Privy gives us a sign-up flow that ends with a usable Solana wallet without either of them learning the words "seed phrase." The user can later export their key if they want self-custody, which we treat as a feature for the cohort that wants it rather than a default.

### Port implemented

`Identity` — see `packages/core/src/ports/identity.ts`.

### Adapter location

`packages/adapters/privy/`. Specifically `src/client.ts` for the server-side verification and `src/privy-adapter.ts` for the port implementation. The client-side React provider lives in `apps/web/components/privy-provider.tsx` (currently a stub shell).

### Key SDK methods used

- `verifyToken(token)` — server-side verification of a Privy session JWT.
- `ensureWallet(userId, chainId)` — provision a wallet for a user on a given chain if one does not exist.
- `<PrivyProvider>` from `@privy-io/react-auth` — client-side React provider in `apps/web`.

### Setup

Required env vars:

- `PRIVY_APP_ID` — public app id from the Privy dashboard.
- `PRIVY_APP_SECRET` — server-side secret.

### Integration depth

Currently `[~]` — adapter package scaffolded with `PrivyIdentity` implementing `Identity`. All methods throw `NotImplementedError`. Provider shell exists in `apps/web` but is unconfigured. Real implementation is Phase 2, gating the rest of the auth-required flows.

### Where it shows up in the demo

Sign-in and sign-up on `apps/web`, gating the `/invoices` and `/counterparties` routes. The public `/pay/[invoiceId]` page does not require auth — the payer experience is intentionally frictionless.

### Edge cases handled

- Email-only sign-up: we provision a Solana embedded wallet at first sign-in.
- User exports key: the exported address remains the `primary_wallet` on the counterparty record; self-custody from that point.
- Session expiry: the API returns 401, the web app prompts a re-auth without losing the user's invoice draft.

### Sponsor's judging criteria

Privy is not a Frontier sidetrack sponsor with a dedicated prize at the time of writing. It is included here because it is a critical part of the user-facing onboarding story — emerging-market users cannot install Phantom on the way to paying their first invoice. `[verify: confirm Privy's Frontier participation status before submission]`.

### Submission

No sponsor-specific submission. Privy is referenced in the Frontier main submission as the onboarding rail.

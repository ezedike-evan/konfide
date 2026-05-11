# Security

This document describes Konfide's threat model, the protections in place, and how to report a vulnerability. Its intended readers are security researchers, auditors, and any engineer touching code that handles funds, keys, or user data. For the architectural privacy framing (private vs public vs selectively disclosable), see [ARCHITECTURE.md](./ARCHITECTURE.md#privacy-model).

## Threat model

The threats Konfide takes seriously, in rough order of likelihood × impact:

- **Cross-chain bridge risk.** Funds in flight between chains are exposed to the routing partner's solver network. Konfide does not run its own bridge; we rely on KIRAPAY for cross-chain settlement and inherit its risk profile.
- **Smart contract vulnerabilities.** The Anchor program in `packages/contracts/programs/konfide` controls invoice state on Solana. A bug in the program's authority checks or PDA derivation could allow an attacker to forge settlements or void invoices.
- **Webhook spoofing.** Without HMAC verification, an attacker could POST a forged `payment.confirmed` to our webhook endpoints and induce our system to mark an unpaid invoice as settled. All webhook receivers verify HMAC SHA-256 against the sponsor's signing secret.
- **Key compromise.** A compromised `KIRAPAY_API_KEY`, `MAGICBLOCK_API_KEY`, or `SOLANA_PAYER_KEYPAIR_PATH` could be used to drain funds or impersonate the protocol. Keys are stored only in deployment env, never in code, never in `.env.example`.
- **MEV on settlement.** A searcher front-running a settlement transaction on Solana could in theory extract value. Solana's leader scheduling and sub-second finality reduce this attack's profitability significantly compared to Ethereum, but we do not assume zero MEV.
- **Regulatory data exposure.** The selective-disclosure flow (view keys to regulators) is a high-value target — a compromised view key reveals all invoices it covers. View keys are scoped per regulator-request, not per regulator.
- **Privacy regression.** A code change that accidentally writes a sensitive field to L1 in cleartext is a privacy regression. Reviewers explicitly check for this on any PR touching `packages/contracts`, `packages/adapters/magicblock`, or `apps/api/src/routes/webhooks.ts`.

## Protections in place

- **Webhook signature verification.** Every inbound webhook validates an HMAC SHA-256 signature against a per-sponsor secret. Unsigned or mis-signed webhooks are rejected with 401 before any application logic runs.
- **Schema validation at boundaries.** Every HTTP body that crosses into the API is validated against a Zod schema from `@konfide/types`. Adapters validate their sponsor's response shapes the same way before returning data to the domain.
- **Pure domain.** `packages/core` has no I/O. A logic bug in the domain cannot directly write to the database, the chain, or a sponsor API; it can only return wrong values to the calling adapter. This narrows the audit surface for the highest-value review hours.
- **PDA-bounded program authority.** The Konfide program derives invoice PDAs from `[b"invoice", invoice_id]`. Authority checks are enforced by Anchor's `Account<'info, Invoice>` constraint plus per-instruction `Signer` requirements.
- **No private keys in the repo.** `.gitignore` excludes `*-keypair.json`, `id.json`, and `*.private.key`. CI uses ephemeral keypairs generated per run.
- **No secrets in `.env.example`.** The example file lists keys with empty values and a comment describing the source. A leaked `.env.example` reveals nothing.
- **Minimal on-chain surface.** The Anchor program has three instructions, each under 30 lines of logic. Less code means less attack surface and cheaper audits.

## What we audit

- The Anchor program (`packages/contracts/programs/konfide`). Pre-mainnet audit by at least two independent firms before any non-pilot mainnet activity. Post-hackathon work.
- Webhook signature verification implementations across all adapters that receive webhooks.
- The privacy-layer commitment flow once Phase 6 lands. The MagicBlock PER integration is the most security-sensitive non-Solana code in the repo.
- The view-key issuance and selective-disclosure flow. The cryptographic primitive is `[TBD: signature scheme — likely Ed25519 envelopes]`; the operational flow is `[TBD: documented pre-mainnet]`.

## Bug disclosure

Email `[TBD: security@konfide.<tld>]` with a description of the vulnerability and reproduction steps. PGP key `[TBD: published once contact email exists]`.

We will:

- Acknowledge receipt within 48 hours.
- Triage and respond with severity assessment within 5 business days.
- Coordinate disclosure timing with the reporter; default 90-day window.
- Credit reporters in release notes unless they prefer anonymity.

We will not:

- Pursue legal action against good-faith researchers.
- Pay bounties at this stage. A bug bounty programme launches post-seed-round.

## Out of scope

- Vulnerabilities in third-party sponsor SDKs. Report those to the sponsor directly: KIRAPAY, MagicBlock, Covalent, Torque, Privy, Anchor. We will help coordinate if the issue is jointly exploitable.
- Vulnerabilities in upstream open-source dependencies (`react`, `next`, `hono`, `drizzle-orm`, `@solana/web3.js`, etc.). Report upstream first; if Konfide's usage compounds the issue, also report to us.
- Self-inflicted compromise on a user's own device (e.g. a user pasting their seed phrase into a phishing site). Not exploitable against the protocol.

## Known limitations during the hackathon

The hackathon build is explicitly pre-audit and devnet-only. The following limitations apply until the post-hackathon hardening sprint:

- **No audit yet.** The Anchor program has not been independently audited.
- **Devnet only.** No mainnet deployment until audit completion and the Phase 8 hardening checklist is green.
- **Trade size cap.** The demo enforces a maximum invoice size of $50K — both as a product-experience anchor for the wedge customer and as a security cap.
- **Single-region deployment.** No geo-redundancy yet; outage tolerance is best-effort.
- **No rate limiting on the public payer page.** Will be added before any pilot user touches it.
- **No DDoS protection beyond Cloudflare defaults.** Sufficient for a hackathon demo, not for production.

These limitations are tracked in [ROADMAP.md Phase 8](../main/  ROADMAP.md#phase-8--post-hackathon).

# @konfide/api

Hono API server for Konfide.

## Quickstart

```bash
# 1. Postgres (Docker is fine)
docker run -d --name konfide-pg -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:16
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/konfide_dev

# 2. Schema
pnpm --filter @konfide/api db:push        # apply current schema directly
# (or: pnpm --filter @konfide/api db:generate && db:migrate)

# 3. Seed demo counterparties
pnpm --filter @konfide/api db:seed

# 4. Run the API
cp .env.example .env                       # then fill in KIRAPAY + Solana keys
pnpm --filter @konfide/api dev
```

The API listens on `:3001` by default. Health check at `GET /health`.

## Required env

- `DATABASE_URL` — Postgres connection string
- `KIRAPAY_API_KEY` — KIRAPAY API key (devnet)
- `KIRAPAY_WEBHOOK_SECRET` — HMAC secret for verifying webhooks
- `KIRAPAY_BASE_URL` — optional override (defaults to `https://api.kirapay.dev`)
- `SOLANA_DESTINATION_WALLET` — Solana wallet that should receive USDC
- `SOLANA_RPC_URL` — optional, enables on-chain settlement recording
- `SOLANA_PAYER_KEYPAIR_PATH` — JSON keypair file used to pay fees on devnet
- `PUBLIC_APP_URL` — optional, used for KIRAPAY success/cancel URLs
- `KONFIDE_ISSUER_HANDLE` — defaults to `konfide-demo`

## Endpoints

- `POST /invoices` — create a new invoice (returns hosted checkout URL)
- `GET /invoices/:publicId` — invoice + settlement details
- `POST /webhooks/kirapay` — KIRAPAY webhook (signature-verified, idempotent)

## E2E

See `tooling/scripts/e2e-kirapay.ts` and the root-level `pnpm e2e:kirapay`
for the demo path that drives a full Polygon → Solana settlement.

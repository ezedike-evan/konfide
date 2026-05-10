# @konfide/adapter-kirapay

Implements the `PaymentRouter` port from `@konfide/core` against Kirapay's cross-border payment rails.

## Status

- [x] Port stubs in place (`KirapayPaymentRouter`).
- [ ] Quote API integration.
- [ ] Hosted-checkout session creation.
- [ ] Webhook signature verification (`KIRAPAY_WEBHOOK_SECRET`).
- [ ] Settlement resolution after on-chain confirmation.

## Env

- `KIRAPAY_API_KEY` — server-side API key.
- `KIRAPAY_WEBHOOK_SECRET` — HMAC secret for webhook verification.

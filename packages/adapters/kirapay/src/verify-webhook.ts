/**
 * KIRAPAY webhook signature verification.
 *
 * !! TBD — UNDOCUMENTED SCHEME !!
 *
 * As of this rewrite KIRAPAY's public API reference does not document its
 * webhook signature scheme. The implementation below is a defensible
 * best-guess and **must** be confirmed against KIRAPAY's true scheme before
 * production use:
 *
 *   - Header:      `x-kirapay-signature`
 *   - Algorithm:   HMAC-SHA-256 over the raw request body bytes
 *   - Encoding:    lowercase hex
 *   - Secret:      the value supplied when registering the webhook via
 *                  `POST /api/webhooks` (we generate and persist it)
 *   - No timestamp / replay tolerance — the docs do not surface one. If
 *     KIRAPAY adds one, switch to `t=<ts>,v1=<hex>` and reinstate the
 *     tolerance check using the `nowEpochSeconds` hook.
 *
 * Reader: the API webhook handler at `POST /webhooks/kirapay`. Hands raw
 * request bytes + the signature header here and dispatches based on the
 * discriminated result. The function NEVER throws — failures surface as
 * `{ valid: false, reason }` so the caller can log and return 401 without a
 * try/catch.
 */
import { createHmac, timingSafeEqual } from 'node:crypto'
import { KirapayWebhookEventSchema, type KirapayWebhookEvent } from './schemas.js'

/** Result of verifying a webhook — discriminated on `valid`. */
export type VerifyKirapayWebhookResult =
  | { readonly valid: true; readonly event: KirapayWebhookEvent }
  | { readonly valid: false; readonly reason: string }

/** Inputs to `verifyKirapayWebhook`. */
export interface VerifyKirapayWebhookInput {
  /** The raw request body — bytes preferred but UTF-8 string accepted. */
  readonly rawBody: string | Uint8Array
  /** Value of the `x-kirapay-signature` header. */
  readonly signatureHeader: string | null | undefined
  /** The webhook signing secret (the one we registered with KIRAPAY). */
  readonly secret: string
  /**
   * Optional clock override. Currently unused — kept for forward-compat
   * with a timestamped-signature scheme.
   */
  readonly nowEpochSeconds?: number
}

/**
 * Verify a KIRAPAY webhook signature and parse the event payload.
 *
 * @param input - Raw body, signature header, signing secret.
 * @returns A discriminated union: `{ valid: true, event }` on success, or
 *   `{ valid: false, reason }` on any failure.
 */
export function verifyKirapayWebhook(
  input: VerifyKirapayWebhookInput,
): VerifyKirapayWebhookResult {
  if (!input.signatureHeader) {
    return { valid: false, reason: 'missing_signature_header' }
  }
  if (!input.secret) {
    return { valid: false, reason: 'missing_secret' }
  }

  const providedHex = input.signatureHeader.trim().toLowerCase()
  if (!/^[0-9a-f]+$/.test(providedHex)) {
    return { valid: false, reason: 'malformed_signature_hex' }
  }

  const rawBytes =
    typeof input.rawBody === 'string'
      ? new TextEncoder().encode(input.rawBody)
      : input.rawBody

  const expected = createHmac('sha256', input.secret).update(rawBytes).digest()

  let provided: Buffer
  try {
    provided = Buffer.from(providedHex, 'hex')
  } catch {
    return { valid: false, reason: 'malformed_signature_hex' }
  }

  if (provided.length !== expected.length) {
    return { valid: false, reason: 'signature_mismatch' }
  }
  if (!timingSafeEqual(provided, expected)) {
    return { valid: false, reason: 'signature_mismatch' }
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(
      typeof input.rawBody === 'string'
        ? input.rawBody
        : new TextDecoder().decode(rawBytes),
    )
  } catch {
    return { valid: false, reason: 'invalid_json_body' }
  }

  const result = KirapayWebhookEventSchema.safeParse(parsed)
  if (!result.success) {
    return { valid: false, reason: `unexpected_event_shape: ${result.error.message}` }
  }
  return { valid: true, event: result.data }
}

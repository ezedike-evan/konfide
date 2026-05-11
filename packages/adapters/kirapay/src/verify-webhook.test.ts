/**
 * Unit tests for `verifyKirapayWebhook`.
 *
 * Covers: valid signature, invalid signature, tampered body, missing
 * signature header. NOTE: the signature scheme is unconfirmed against
 * KIRAPAY (see `verify-webhook.ts` JSDoc). These tests pin the current
 * best-guess (raw HMAC-SHA-256 over the body, lowercase hex in
 * `x-kirapay-signature`) so any future change is intentional.
 */
import { createHmac } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { verifyKirapayWebhook } from './verify-webhook.js'

const SECRET = 'whsec_test_secret_value'

const event = {
  id: 'evt_123',
  event: 'transaction.succeeded',
  createdAt: '2026-05-10T00:00:00.000Z',
  data: {
    _id: 'tx_99',
    status: 'Success',
    hash: '0xinputtxhash',
    price: 56,
    settlementAmount: 0.42,
    customOrderId: '11111111-1111-4111-8111-111111111111',
    summary: {
      customOrderId: '11111111-1111-4111-8111-111111111111',
      recipient: 'SoLanaDestinationWallet1111111111111111111111',
    },
  },
}

function sign(body: string, secret: string = SECRET): string {
  return createHmac('sha256', secret).update(body).digest('hex')
}

describe('verifyKirapayWebhook', () => {
  it('returns valid + parsed event for a correctly-signed body', () => {
    const body = JSON.stringify(event)
    const result = verifyKirapayWebhook({
      rawBody: body,
      signatureHeader: sign(body),
      secret: SECRET,
    })

    expect(result.valid).toBe(true)
    if (result.valid) {
      expect(result.event.id).toBe('evt_123')
      expect(result.event.event).toBe('transaction.succeeded')
      expect(result.event.data.customOrderId).toBe('11111111-1111-4111-8111-111111111111')
    }
  })

  it('rejects when the signature itself is wrong', () => {
    const body = JSON.stringify(event)
    const result = verifyKirapayWebhook({
      rawBody: body,
      signatureHeader: '00'.repeat(32),
      secret: SECRET,
    })
    expect(result.valid).toBe(false)
    if (!result.valid) expect(result.reason).toBe('signature_mismatch')
  })

  it('rejects when the body is tampered after signing', () => {
    const body = JSON.stringify(event)
    const header = sign(body)
    const tampered = body.replace('"price":56', '"price":999')
    expect(tampered).not.toEqual(body)
    const result = verifyKirapayWebhook({
      rawBody: tampered,
      signatureHeader: header,
      secret: SECRET,
    })
    expect(result.valid).toBe(false)
    if (!result.valid) expect(result.reason).toBe('signature_mismatch')
  })

  it('rejects when the signature header is missing', () => {
    const result = verifyKirapayWebhook({
      rawBody: JSON.stringify(event),
      signatureHeader: null,
      secret: SECRET,
    })
    expect(result.valid).toBe(false)
    if (!result.valid) expect(result.reason).toBe('missing_signature_header')
  })

  it('rejects a non-hex signature header', () => {
    const result = verifyKirapayWebhook({
      rawBody: JSON.stringify(event),
      signatureHeader: 'not-a-hex-string',
      secret: SECRET,
    })
    expect(result.valid).toBe(false)
    if (!result.valid) expect(result.reason).toBe('malformed_signature_hex')
  })

  it('rejects when the body is signed by a different secret', () => {
    const body = JSON.stringify(event)
    const result = verifyKirapayWebhook({
      rawBody: body,
      signatureHeader: sign(body, 'a_different_secret'),
      secret: SECRET,
    })
    expect(result.valid).toBe(false)
    if (!result.valid) expect(result.reason).toBe('signature_mismatch')
  })
})

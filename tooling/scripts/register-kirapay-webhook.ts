/**
 * Register (or update) the Konfide webhook endpoint with KIRAPAY.
 *
 * KIRAPAY supports a single webhook per API key — `POST /api/webhooks` is
 * idempotent on the API key, so re-running this script after rotating the
 * URL is the supported way to switch endpoints.
 *
 * Run: `pnpm kirapay:register-webhook <webhook-url>`
 *
 * Env required:
 *   KIRAPAY_API_KEY         — the merchant key
 *   KIRAPAY_WEBHOOK_SECRET  — secret KIRAPAY will sign payloads with (>=6 chars)
 *
 * Either pass the webhook URL as the first CLI arg or set
 * `KIRAPAY_WEBHOOK_URL` in the env.
 */
import { KirapayClient } from '@konfide/adapter-kirapay'

async function main(): Promise<void> {
  const apiKey = process.env.KIRAPAY_API_KEY
  const secret = process.env.KIRAPAY_WEBHOOK_SECRET
  const url = process.argv[2] ?? process.env.KIRAPAY_WEBHOOK_URL

  if (!apiKey) throw new Error('KIRAPAY_API_KEY is not set')
  if (!secret) throw new Error('KIRAPAY_WEBHOOK_SECRET is not set')
  if (!url) {
    throw new Error('pass webhook URL as arg or set KIRAPAY_WEBHOOK_URL')
  }
  if (secret.length < 6) {
    throw new Error('KIRAPAY_WEBHOOK_SECRET must be >= 6 chars (KIRAPAY enforces)')
  }

  const baseUrl = process.env.KIRAPAY_BASE_URL ?? 'https://api.kira-pay.com'
  const client = new KirapayClient({ apiKey, baseUrl })

  console.log('registering kirapay webhook…')
  console.log(`  base url : ${baseUrl}`)
  console.log(`  endpoint : ${url}`)
  console.log(`  secret   : ${'*'.repeat(Math.min(secret.length, 16))}`)

  const response = await client.registerWebhook({ url, secret })
  console.log()
  console.log('kirapay accepted webhook registration:')
  console.log(`  message   : ${response.message}`)
  console.log(`  code      : ${response.code}`)
  console.log(`  key       : ${response.data.key.slice(0, 8)}…`)
  console.log(`  endpointId: ${response.data.webhookEndpoint._id}`)
  console.log(`  url       : ${response.data.webhookEndpoint.url}`)
  console.log(`  isActive  : ${response.data.isActive}`)
  console.log(`  createdAt : ${response.data.webhookEndpoint.createdAt}`)
  console.log(`  updatedAt : ${response.data.webhookEndpoint.updatedAt}`)
}

main().catch((err) => {
  console.error('failed to register webhook', err)
  process.exit(1)
})

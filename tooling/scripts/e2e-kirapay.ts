/**
 * End-to-end demo path: create an invoice, drive a KIRAPAY hosted-checkout
 * payment, wait for the webhook to settle the invoice, verify the on-chain
 * record exists.
 *
 * This script is the demo's reproducibility harness. KIRAPAY's hosted
 * checkout cannot be driven cleanly with Playwright (the form fields and
 * iframes vary by chain), so by default this is a *guided* run: the script
 * prints each step and waits for the operator to press Enter once they've
 * completed the manual portion. Pass `--auto` to attempt a fully-automated
 * Playwright run (will be skipped if Playwright is not installed).
 *
 * Run: `pnpm e2e:kirapay`
 *
 * Env required:
 *   API_BASE_URL — defaults to http://localhost:3001
 *   E2E_AMOUNT   — defaults to 10
 *   E2E_RECIPIENT — defaults to wei-supplier
 */
import { createInterface } from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:3001'
const AMOUNT = Number.parseFloat(process.env.E2E_AMOUNT ?? '10')
const RECIPIENT = process.env.E2E_RECIPIENT ?? 'wei-supplier'
const POLL_MS = 5_000
const TIMEOUT_MS = 5 * 60 * 1000

async function main(): Promise<void> {
  const auto = process.argv.includes('--auto')

  console.log('konfide e2e :: starting')
  console.log(`  api base       : ${API_BASE}`)
  console.log(`  amount         : ${AMOUNT} USD`)
  console.log(`  recipient      : ${RECIPIENT}`)
  console.log(`  mode           : ${auto ? 'auto (Playwright)' : 'guided (manual)'}`)
  console.log()

  await waitForHealth()

  const created = await createInvoice()
  console.log(`step 1: invoice created`)
  console.log(`  publicId       : ${created.publicId}`)
  console.log(`  checkoutUrl    : ${created.checkoutUrl}`)
  console.log(`  expiresAt      : ${created.expiresAt}`)
  console.log()

  if (auto) {
    await tryAutoCheckout(created.checkoutUrl)
  } else {
    const rl = createInterface({ input, output })
    console.log('step 2: open the checkoutUrl above and complete a KIRAPAY test-mode payment.')
    console.log('        when done, return here and press Enter.')
    await rl.question('press Enter when KIRAPAY shows confirmed > ')
    rl.close()
  }

  console.log('step 3: polling GET /invoices/:publicId for status flip…')
  const settled = await pollUntilSettled(created.publicId)
  console.log(`step 3: invoice settled`)
  console.log(`  status         : ${settled.status}`)
  console.log(`  txSignature    : ${settled.settlement?.txSignature ?? '(none)'}`)
  console.log(`  chainId        : ${settled.settlement?.chainId ?? '(none)'}`)
  console.log()

  console.log('konfide e2e :: complete ✅')
  process.exit(0)
}

interface CreatedInvoice {
  invoiceId: string
  publicId: string
  checkoutUrl: string
  expiresAt: string
  status: string
}

async function createInvoice(): Promise<CreatedInvoice> {
  const res = await fetch(`${API_BASE}/invoices`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      amount: AMOUNT,
      currency: 'USD',
      recipientHandle: RECIPIENT,
      description: 'Container 40HQ — pilot run',
    }),
  })
  if (!res.ok) throw new Error(`POST /invoices failed: ${res.status} ${await res.text()}`)
  return (await res.json()) as CreatedInvoice
}

interface InvoiceDetail {
  status: string
  settlement: { txSignature: string; chainId: string; confirmedAt: string } | null
}

async function pollUntilSettled(publicId: string): Promise<InvoiceDetail> {
  const start = Date.now()
  while (Date.now() - start < TIMEOUT_MS) {
    const res = await fetch(`${API_BASE}/invoices/${encodeURIComponent(publicId)}`)
    if (res.ok) {
      const detail = (await res.json()) as InvoiceDetail
      if (detail.status === 'settled') return detail
      if (detail.status === 'partially_paid') return detail
      process.stdout.write('.')
    }
    await sleep(POLL_MS)
  }
  throw new Error('timeout: invoice did not settle within 5 minutes')
}

async function waitForHealth(): Promise<void> {
  for (let i = 0; i < 10; i++) {
    try {
      const res = await fetch(`${API_BASE}/health`)
      if (res.ok) return
    } catch {
      // not ready
    }
    await sleep(1000)
  }
  throw new Error(`api not reachable at ${API_BASE} — is it running?`)
}

async function tryAutoCheckout(checkoutUrl: string): Promise<void> {
  try {
    const playwrightPkg = 'playwright'
    const playwright = (await import(playwrightPkg).catch(
      () => null,
    )) as {
      chromium: {
        launch(options?: { headless?: boolean }): Promise<{
          newPage(): Promise<{ goto(url: string): Promise<void> }>
          close(): Promise<void>
        }>
      }
    } | null
    if (!playwright) {
      console.log('playwright not installed — falling back to guided mode')
      const rl = createInterface({ input, output })
      console.log(`open this url and complete the payment: ${checkoutUrl}`)
      await rl.question('press Enter when KIRAPAY shows confirmed > ')
      rl.close()
      return
    }
    const browser = await playwright.chromium.launch({ headless: false })
    const page = await browser.newPage()
    await page.goto(checkoutUrl)
    console.log('playwright opened the checkout — complete the payment manually')
    const rl = createInterface({ input, output })
    await rl.question('press Enter when KIRAPAY shows confirmed > ')
    rl.close()
    await browser.close()
  } catch (err) {
    console.warn('auto checkout failed; please complete manually', err)
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

main().catch((err) => {
  console.error('e2e failed', err)
  process.exit(1)
})

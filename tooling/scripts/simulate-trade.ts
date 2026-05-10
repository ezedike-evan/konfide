/**
 * Simulate an end-to-end Konfide trade flow:
 *   1. Issuer creates an invoice.
 *   2. Payer settles via the chosen route.
 *   3. Settlement is committed and the trust score refreshes.
 *
 * Stub.
 */
import { NotImplementedError } from '@konfide/core'

async function main(): Promise<void> {
  throw new NotImplementedError('simulateTrade')
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err)
  process.exit(1)
})

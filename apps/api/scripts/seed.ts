/**
 * Seed script for the demo flow. Inserts:
 *   - one issuer counterparty with handle `konfide-demo`
 *   - one payer counterparty with handle `wei-supplier`
 *
 * Idempotent: re-running is safe.
 *
 * Run with: `pnpm --filter @konfide/api db:seed`
 */
import { getDb } from '../src/db/index.js'
import * as schema from '../src/db/schema.js'

async function main(): Promise<void> {
  const db = getDb()
  await db
    .insert(schema.counterparties)
    .values({
      handle: 'konfide-demo',
      displayName: 'Konfide Demo Merchant',
      kind: 'issuer',
      primaryWallet: 'KonfideDemoWallet11111111111111111111111111',
      jurisdiction: 'NG',
      verified: 'true',
    })
    .onConflictDoNothing({ target: schema.counterparties.handle })

  await db
    .insert(schema.counterparties)
    .values({
      handle: 'wei-supplier',
      displayName: 'Wei Supplier (Shenzhen)',
      kind: 'payer',
      primaryWallet: 'WeiSupplierDemoWallet111111111111111111111',
      jurisdiction: 'CN',
      verified: 'false',
    })
    .onConflictDoNothing({ target: schema.counterparties.handle })

  console.log('seeded counterparties: konfide-demo, wei-supplier')
  process.exit(0)
}

main().catch((err) => {
  console.error('seed failed', err)
  process.exit(1)
})

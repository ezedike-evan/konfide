/**
 * Konfide API entrypoint.
 *
 * Mounts the route stubs under their prefixes and exposes a health check.
 * Real auth, observability, and adapter wiring lands once the integrations
 * mature past stubs.
 */
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { counterpartiesRoute } from './routes/counterparties.js'
import { invoicesRoute } from './routes/invoices.js'
import { settlementsRoute } from './routes/settlements.js'
import { webhooksRoute } from './routes/webhooks.js'

export const app = new Hono()

app.get('/health', (c) => c.json({ status: 'ok' }))

app.route('/invoices', invoicesRoute)
app.route('/counterparties', counterpartiesRoute)
app.route('/settlements', settlementsRoute)
app.route('/webhooks', webhooksRoute)

if (process.env.NODE_ENV !== 'test') {
  const port = Number(process.env.PORT ?? 3001)
  serve({ fetch: app.fetch, port })
  // eslint-disable-next-line no-console
  console.log(`konfide api listening on :${port}`)
}

/**
 * `/invoices` route — invoice CRUD + settlement orchestration.
 *
 * Stub: returns 501 until the InvoiceService is wired with adapters.
 */
import { Hono } from 'hono'

export const invoicesRoute = new Hono()

invoicesRoute.get('/', (c) => c.json({ error: 'not_implemented' }, 501))
invoicesRoute.post('/', (c) => c.json({ error: 'not_implemented' }, 501))
invoicesRoute.get('/:id', (c) => c.json({ error: 'not_implemented' }, 501))

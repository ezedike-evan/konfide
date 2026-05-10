/**
 * `/settlements` route — settlement history and resolution. Stub.
 */
import { Hono } from 'hono'

export const settlementsRoute = new Hono()

settlementsRoute.get('/:id', (c) => c.json({ error: 'not_implemented' }, 501))

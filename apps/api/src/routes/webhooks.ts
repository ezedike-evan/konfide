/**
 * `/webhooks` route — sponsor-side webhook receivers (Kirapay, Magicblock,
 * Torque). Stub.
 */
import { Hono } from 'hono'

export const webhooksRoute = new Hono()

webhooksRoute.post('/kirapay', (c) => c.json({ error: 'not_implemented' }, 501))
webhooksRoute.post('/magicblock', (c) => c.json({ error: 'not_implemented' }, 501))
webhooksRoute.post('/torque', (c) => c.json({ error: 'not_implemented' }, 501))

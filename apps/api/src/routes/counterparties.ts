/**
 * `/counterparties` route — counterparty profiles and trust score lookup.
 * Stub.
 */
import { Hono } from 'hono'

export const counterpartiesRoute = new Hono()

counterpartiesRoute.get('/:handle', (c) => c.json({ error: 'not_implemented' }, 501))

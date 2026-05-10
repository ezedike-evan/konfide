/**
 * Drizzle client setup.
 *
 * Lazily initialized so importers don't need a live `DATABASE_URL` to load
 * the module (handy for tests and CI).
 */
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema.js'

let cached: PostgresJsDatabase<typeof schema> | null = null

/**
 * Return a Drizzle client bound to `DATABASE_URL`. Cached per process.
 *
 * @returns The Drizzle client.
 */
export function getDb(): PostgresJsDatabase<typeof schema> {
  if (cached) {
    return cached
  }
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is not set')
  }
  const client = postgres(url, { prepare: false })
  cached = drizzle(client, { schema })
  return cached
}

export { schema }

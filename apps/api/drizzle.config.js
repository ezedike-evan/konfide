/**
 * Drizzle Kit configuration for the Konfide API.
 *
 * Targets the `DATABASE_URL` env var; migrations live under `./drizzle/`.
 */
import { defineConfig } from 'drizzle-kit';
export default defineConfig({
    schema: './src/db/schema.ts',
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL ?? 'postgres://localhost:5432/konfide',
    },
    strict: true,
    verbose: true,
});
//# sourceMappingURL=drizzle.config.js.map
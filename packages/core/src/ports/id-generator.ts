/**
 * Port: IdGenerator.
 *
 * Generates UUID v4 strings as an injected dependency. Keeps `@konfide/core`
 * free of any platform-specific crypto imports — the API composition root
 * supplies a Node-backed implementation, and tests can supply a deterministic
 * one.
 */

export interface IdGenerator {
  /** @returns A fresh UUID v4 string. */
  uuid(): string
}

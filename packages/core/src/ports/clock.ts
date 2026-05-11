/**
 * Port: Clock.
 *
 * Time as an injected dependency. Lets domain code produce ISO timestamps
 * without reading `Date.now()` directly, which keeps services fully
 * unit-testable with deterministic clocks.
 */

export interface Clock {
  /** @returns Current wall-clock time as an ISO-8601 datetime string. */
  nowIso(): string
}

/** Real wall-clock implementation. */
export const systemClock: Clock = {
  nowIso(): string {
    return new Date().toISOString()
  },
}

/**
 * Trade corridor value object.
 *
 * A corridor is a directional pair of jurisdictions (e.g. NG → US) plus an
 * optional preferred currency. Konfide uses corridors to choose payment
 * routes and to surface analytics.
 */

export class Corridor {
  readonly fromCountry: string
  readonly toCountry: string
  readonly preferredCurrency: string | null

  /**
   * @param fromCountry - ISO-3166 alpha-2 origin code.
   * @param toCountry - ISO-3166 alpha-2 destination code.
   * @param preferredCurrency - Optional currency the corridor prefers.
   */
  constructor(fromCountry: string, toCountry: string, preferredCurrency: string | null = null) {
    if (fromCountry.length !== 2 || toCountry.length !== 2) {
      throw new Error('Corridor: country codes must be 2 chars (ISO-3166)')
    }
    if (fromCountry === toCountry) {
      throw new Error('Corridor: must be cross-border (from ≠ to)')
    }
    this.fromCountry = fromCountry.toUpperCase()
    this.toCountry = toCountry.toUpperCase()
    this.preferredCurrency = preferredCurrency
  }

  /**
   * Render the corridor as a stable, sortable string key.
   *
   * @returns Key of the form `<from>-<to>[:<currency>]`.
   */
  toKey(): string {
    return this.preferredCurrency
      ? `${this.fromCountry}-${this.toCountry}:${this.preferredCurrency}`
      : `${this.fromCountry}-${this.toCountry}`
  }
}

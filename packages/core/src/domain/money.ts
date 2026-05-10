/**
 * Money value object.
 *
 * Money is represented as integer minor units (e.g. cents, lamports, satoshis)
 * plus a currency code. Arithmetic is currency-checked: adding USD to USDC
 * is a runtime error, not a silent rounding bug.
 */
import type { Money as MoneyShape } from '@konfide/types'

export class Money implements MoneyShape {
  readonly amount: bigint
  readonly currency: string

  /**
   * @param amount - Non-negative integer minor units.
   * @param currency - ISO-4217-like code or token symbol.
   */
  constructor(amount: bigint, currency: string) {
    if (amount < 0n) {
      throw new Error('Money: amount must be non-negative')
    }
    if (currency.length < 2 || currency.length > 8) {
      throw new Error('Money: currency length must be 2–8')
    }
    this.amount = amount
    this.currency = currency
  }

  /**
   * Construct a `Money` from a plain `MoneyShape` (e.g. parsed Zod output).
   *
   * @param shape - The plain object.
   * @returns A `Money` instance.
   */
  static from(shape: MoneyShape): Money {
    return new Money(shape.amount, shape.currency)
  }

  /**
   * Add another `Money` of the same currency.
   *
   * @param other - The right-hand operand.
   * @returns The sum as a new `Money`.
   */
  add(other: Money): Money {
    this.assertSameCurrency(other)
    return new Money(this.amount + other.amount, this.currency)
  }

  /**
   * Subtract another `Money` of the same currency. Throws on underflow.
   *
   * @param other - The right-hand operand.
   * @returns The difference as a new `Money`.
   */
  subtract(other: Money): Money {
    this.assertSameCurrency(other)
    if (other.amount > this.amount) {
      throw new Error('Money: subtraction would underflow')
    }
    return new Money(this.amount - other.amount, this.currency)
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency
  }

  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new Error(`Money: currency mismatch (${this.currency} vs ${other.currency})`)
    }
  }
}

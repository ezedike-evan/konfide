/**
 * Brand-typed value objects shared across the domain.
 *
 * Brand types make it impossible to confuse, e.g., a chain id with a token
 * address at compile time without paying any runtime cost. Constructors live
 * in this file; they only validate shape, not authenticity.
 */

declare const __brand: unique symbol

type Brand<TBase, TBrand extends string> = TBase & { readonly [__brand]: TBrand }

/** A wallet address on any supported chain. */
export type WalletAddress = Brand<string, 'WalletAddress'>

/** A chain identifier (e.g. `solana:mainnet`, `ethereum:1`). */
export type ChainId = Brand<string, 'ChainId'>

/** A token contract address or native token symbol. */
export type TokenAddress = Brand<string, 'TokenAddress'>

/** An invoice identifier (UUID v4). */
export type InvoiceId = Brand<string, 'InvoiceId'>

/** A counterparty identifier (UUID v4). */
export type CounterpartyId = Brand<string, 'CounterpartyId'>

/** A settlement identifier (UUID v4). */
export type SettlementId = Brand<string, 'SettlementId'>

/**
 * Construct a `WalletAddress` from a raw string. Performs only a length check;
 * authenticity is the caller's concern.
 *
 * @param raw - The candidate wallet address.
 * @returns The branded `WalletAddress`.
 */
export function walletAddress(raw: string): WalletAddress {
  if (raw.length < 32 || raw.length > 64) {
    throw new Error('walletAddress: expected length 32–64')
  }
  return raw as WalletAddress
}

/**
 * Construct a `ChainId` from a raw string.
 *
 * @param raw - The candidate chain id (e.g. `solana:mainnet`).
 * @returns The branded `ChainId`.
 */
export function chainId(raw: string): ChainId {
  if (!raw.includes(':')) {
    throw new Error('chainId: expected `<namespace>:<reference>`')
  }
  return raw as ChainId
}

/**
 * Construct a `TokenAddress` from a raw string.
 *
 * @param raw - The candidate token address or symbol.
 * @returns The branded `TokenAddress`.
 */
export function tokenAddress(raw: string): TokenAddress {
  if (raw.length === 0) {
    throw new Error('tokenAddress: expected non-empty')
  }
  return raw as TokenAddress
}

/**
 * Construct an `InvoiceId` from a UUID v4 string.
 *
 * @param raw - The candidate invoice id.
 * @returns The branded `InvoiceId`.
 */
export function invoiceId(raw: string): InvoiceId {
  return raw as InvoiceId
}

/**
 * Construct a `CounterpartyId` from a UUID v4 string.
 *
 * @param raw - The candidate counterparty id.
 * @returns The branded `CounterpartyId`.
 */
export function counterpartyId(raw: string): CounterpartyId {
  return raw as CounterpartyId
}

/**
 * Construct a `SettlementId` from a UUID v4 string.
 *
 * @param raw - The candidate settlement id.
 * @returns The branded `SettlementId`.
 */
export function settlementId(raw: string): SettlementId {
  return raw as SettlementId
}

/**
 * Port: Identity.
 *
 * Abstracts authentication and embedded-wallet provisioning. Implemented by
 * the Privy adapter; could be swapped for any auth provider that exposes the
 * same surface.
 */

export interface AuthenticatedUser {
  readonly id: string
  readonly email: string | null
  readonly walletAddresses: readonly string[]
}

export interface Identity {
  /**
   * Verify an opaque session token from the client and return the user, or
   * `null` if the token is invalid or expired.
   *
   * @param token - The session token to verify.
   * @returns The authenticated user, or `null`.
   */
  verifyToken(token: string): Promise<AuthenticatedUser | null>

  /**
   * Provision (or fetch) an embedded wallet for the given user on the given
   * chain.
   *
   * @param userId - The user to provision a wallet for.
   * @param chainId - The chain id (e.g. `solana:mainnet`).
   * @returns The wallet address.
   */
  ensureWallet(userId: string, chainId: string): Promise<string>
}

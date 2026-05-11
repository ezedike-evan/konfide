/**
 * Port: SettlementRecorder.
 *
 * Off-chain settlement is the source of truth in the database. After a
 * confirmed payment, the service ALSO records the settlement on Solana via
 * this port. The on-chain side is best-effort and idempotent — failures are
 * logged but do not roll back the database commit.
 */

export interface SettlementRecorderInput {
  /** Internal invoice UUID (used to derive the on-chain PDA). */
  readonly invoiceId: string
  /** Amount actually received, in token minor units. */
  readonly amountAtomic: bigint
  /** Solana wallet that received the funds. */
  readonly recipient: string
}

export interface SettlementRecorder {
  /**
   * Submit the on-chain settlement instruction.
   *
   * @param input - Invoice id, amount, recipient.
   * @returns The transaction signature on success.
   */
  submitSettlement(input: SettlementRecorderInput): Promise<string>
}

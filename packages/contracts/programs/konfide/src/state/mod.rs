//! On-chain account state for the Konfide program.

use anchor_lang::prelude::*;

/// On-chain invoice record. Fields here are intentionally minimal — anything
/// sensitive lives off-chain (or inside the privacy layer); on-chain we keep
/// only the commitments needed to drive disputes and trust scoring.
#[account]
#[derive(InitSpace)]
pub struct Invoice {
    /// 16-byte invoice id, mirrored from the off-chain UUID.
    pub invoice_id: [u8; 16],
    /// Wallet that issued the invoice.
    pub issuer: Pubkey,
    /// Wallet expected to settle the invoice.
    pub payer: Pubkey,
    /// Lifecycle status, encoded as a `u8` matching the off-chain enum.
    pub status: u8,
    /// Slot at which the invoice was created.
    pub created_at_slot: u64,
    /// Optional settlement signature hash, zeroed when unsettled.
    pub settlement_hash: [u8; 32],
}

//! Konfide on-chain program.
//!
//! Three instructions are exposed:
//!   * `create_invoice`  — record a new invoice commitment (stub for now).
//!   * `settle_invoice`  — mark an invoice as settled and emit a settlement
//!                         record. Idempotent on the settlement PDA.
//!   * `record_dispute`  — flag an invoice as disputed (stub for now).
//!
//! Only `settle_invoice` is needed for the Phase 2 demo path. The other two
//! return `Ok(())` so the client can interact with them without panicking.

use anchor_lang::prelude::*;

pub mod errors;
pub mod state;

use crate::errors::KonfideError;
use crate::state::{Invoice, Settlement};

declare_id!("Konfide11111111111111111111111111111111111");

#[program]
pub mod konfide {
    use super::*;

    /// Record a new invoice commitment on-chain.
    pub fn create_invoice(_ctx: Context<CreateInvoice>, _invoice_id: [u8; 16]) -> Result<()> {
        Ok(())
    }

    /// Mark an invoice as settled. Initializes a `Settlement` PDA seeded by
    /// the invoice id; if the PDA already has `recorded == true`, the call
    /// returns `AlreadySettled` so the off-chain webhook handler treats the
    /// duplicate as a no-op.
    pub fn settle_invoice(
        ctx: Context<SettleInvoice>,
        invoice_id: [u8; 16],
        amount_atomic: u64,
        recipient: Pubkey,
    ) -> Result<()> {
        let settlement = &mut ctx.accounts.settlement;
        if settlement.recorded {
            return Err(KonfideError::AlreadySettled.into());
        }
        settlement.invoice_id = invoice_id;
        settlement.amount_atomic = amount_atomic;
        settlement.recipient = recipient;
        settlement.timestamp = Clock::get()?.unix_timestamp;
        settlement.recorded = true;

        emit!(SettlementRecorded {
            invoice_id,
            amount_atomic,
            recipient,
            timestamp: settlement.timestamp,
        });
        Ok(())
    }

    /// Flag an existing invoice as disputed.
    pub fn record_dispute(_ctx: Context<RecordDispute>, _reason_hash: [u8; 32]) -> Result<()> {
        Ok(())
    }
}

#[event]
pub struct SettlementRecorded {
    pub invoice_id: [u8; 16],
    pub amount_atomic: u64,
    pub recipient: Pubkey,
    pub timestamp: i64,
}

#[derive(Accounts)]
#[instruction(invoice_id: [u8; 16])]
pub struct CreateInvoice<'info> {
    #[account(mut)]
    pub issuer: Signer<'info>,

    #[account(
        init,
        payer = issuer,
        space = 8 + Invoice::INIT_SPACE,
        seeds = [b"invoice", invoice_id.as_ref()],
        bump,
    )]
    pub invoice: Account<'info, Invoice>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(invoice_id: [u8; 16])]
pub struct SettleInvoice<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init_if_needed,
        payer = authority,
        space = 8 + Settlement::INIT_SPACE,
        seeds = [b"settlement", invoice_id.as_ref()],
        bump,
    )]
    pub settlement: Account<'info, Settlement>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RecordDispute<'info> {
    #[account(mut)]
    pub disputer: Signer<'info>,

    #[account(mut)]
    pub invoice: Account<'info, Invoice>,
}

//! Konfide on-chain program.
//!
//! Three instructions are exposed:
//!   * `create_invoice`  — record a new invoice commitment.
//!   * `settle_invoice`  — mark an invoice as settled and emit a settlement.
//!   * `record_dispute`  — flag an invoice as disputed.
//!
//! All instruction bodies are stubs returning `Ok(())`. Account validation
//! structs are filled in so the program compiles and the IDL emits a useful
//! shape for the TypeScript adapter.

use anchor_lang::prelude::*;

pub mod errors;
pub mod state;

use crate::state::Invoice;

declare_id!("Konfide11111111111111111111111111111111111");

#[program]
pub mod konfide {
    use super::*;

    /// Record a new invoice commitment on-chain.
    pub fn create_invoice(_ctx: Context<CreateInvoice>, _invoice_id: [u8; 16]) -> Result<()> {
        Ok(())
    }

    /// Mark an existing invoice as settled.
    pub fn settle_invoice(_ctx: Context<SettleInvoice>) -> Result<()> {
        Ok(())
    }

    /// Flag an existing invoice as disputed.
    pub fn record_dispute(_ctx: Context<RecordDispute>, _reason_hash: [u8; 32]) -> Result<()> {
        Ok(())
    }
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
pub struct SettleInvoice<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(mut)]
    pub invoice: Account<'info, Invoice>,
}

#[derive(Accounts)]
pub struct RecordDispute<'info> {
    #[account(mut)]
    pub disputer: Signer<'info>,

    #[account(mut)]
    pub invoice: Account<'info, Invoice>,
}

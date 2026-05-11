//! Program-level error codes.

use anchor_lang::prelude::*;

#[error_code]
pub enum KonfideError {
    #[msg("settlement for this invoice has already been recorded")]
    AlreadySettled,
}

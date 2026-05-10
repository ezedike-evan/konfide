# @konfide/contracts

Anchor workspace for the on-chain Konfide program.

## Layout

- `programs/konfide` — the Anchor program (Rust).
- `tests/konfide.ts` — integration tests (currently skipped).
- `Anchor.toml`, `Cargo.toml` — Anchor + Cargo workspace manifests.

## Build status

> **NOTE:** `anchor build` is **not** required to succeed for the initial scaffold commit. If the Rust + Anchor toolchain isn't installed locally, the rest of the workspace still installs and typechecks cleanly. Install with:
>
> ```sh
> sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"
> cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
> avm install 0.30.1 && avm use 0.30.1
> ```

## Instructions

| name              | accounts                            | status         |
| ----------------- | ----------------------------------- | -------------- |
| `create_invoice`  | `issuer`, `invoice` (PDA), `system` | stub `Ok(())`  |
| `settle_invoice`  | `payer`, `invoice`                  | stub `Ok(())`  |
| `record_dispute`  | `disputer`, `invoice`               | stub `Ok(())`  |

The TypeScript adapter (`packages/adapters/solana`) consumes the IDL emitted under `target/idl/konfide.json` once `anchor build` succeeds.

# @konfide/adapter-magicblock

Implements the `PrivacyLayer` port from `@konfide/core` using a Magicblock ephemeral rollup. Confidential settlements happen inside the rollup; only the final commitment lands on Solana mainnet.

## Status

- [x] Port stubs in place (`MagicblockPrivacyLayer`).
- [ ] Ephemeral session lifecycle.
- [ ] Settlement commitment proof.

## Env

- `MAGICBLOCK_API_KEY`
- `MAGICBLOCK_RPC_URL`

---
name: Sponsor integration proposal
about: Propose a new sponsor adapter or modify an existing one.
title: "[integration] "
labels: enhancement, integration
assignees: ''
---

## Sponsor / SDK

<!-- Name of the sponsor or SDK being integrated. Link to their docs. -->

## Capability being added

<!-- One paragraph: what capability does this add to Konfide? Which user-facing flow benefits? -->

## Port implemented

<!-- Tick the port the new (or modified) adapter implements. If you need a NEW port, see the section below. -->

- [ ] `PaymentRouter` (`packages/core/src/ports/payment-router.ts`)
- [ ] `PrivacyLayer` (`packages/core/src/ports/privacy-layer.ts`)
- [ ] `ChainData` (`packages/core/src/ports/chain-data.ts`)
- [ ] `Loyalty` (`packages/core/src/ports/loyalty.ts`)
- [ ] `Identity` (`packages/core/src/ports/identity.ts`)
- [ ] **A new port is required — justification below.**

### New port justification (only if ticked above)

<!--
The default position is "an existing port fits, you have not looked hard enough."
A new port is a domain-level surface change. Justify it specifically:

  - What capability does the existing port set fail to express?
  - What method signatures does the new port need?
  - What other adapters might implement this port in the future?

A maintainer must approve a new port before any adapter PR lands.
-->

## SDK methods to be wrapped

<!-- Bulleted list of the sponsor SDK methods or endpoints this adapter will call. -->

-
-
-

## Env vars required

<!-- List the env vars the adapter needs. They will be added to .env.example with comments. -->

- `<SPONSOR>_API_KEY` —
- `<SPONSOR>_...` —

## Integration scope

<!-- What's in scope for the first PR? What is explicit follow-up? -->

**In scope:**
-

**Follow-up (not this PR):**
-

## Demo / verification plan

<!-- How will we verify the adapter works end-to-end? Devnet flow, simulation script, manual test? -->

## Sponsor-specific submission required?

<!-- If this integration corresponds to a hackathon sidetrack, list the deadline and link to the submission doc that needs to be written or updated. -->

- [ ] Yes — link to `docs/submissions/<sponsor>.md`:
- [ ] No

## Risks

<!-- API stability, rate limits, doc gaps, regional availability, anything else worth flagging. -->

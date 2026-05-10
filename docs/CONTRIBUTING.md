# Contributing

This document is the contribution guide for Konfide. Its intended readers are external contributors, future hires, and team members who want a single canonical reference for how work flows into this repo. For the architectural rules contributions must respect, see [ARCHITECTURE.md](./ARCHITECTURE.md). For the project's planning state, see [ROADMAP.md](../ROADMAP.md).

## Code of conduct

Be the kind of reviewer and contributor you would want to work with. We follow the [Contributor Covenant](https://www.contributor-covenant.org/version/2/1/code_of_conduct/) at version 2.1. Disagreements are technical, not personal. Ad hominem arguments do not survive review.

## Proposing changes

Open an issue before opening a pull request for anything beyond a small typo or a focused bug fix. The issue does not need to be long — a paragraph of context plus a sketch of the proposed approach is enough. The point is to surface architectural questions early, not to add bureaucracy.

For sponsor adapter changes, the issue must specify which `Port` interface (from `packages/core/src/ports`) the adapter implements. If the adapter requires a new port, justify why the existing ports do not fit; new ports are a domain-level decision and need a maintainer signoff.

For domain changes (anything in `packages/core`), describe the invariant being added or modified. Domain changes ripple across every adapter and every app, so they get more scrutiny than peripheral changes.

## Branch naming

- `feature/<short-description>` — new functionality.
- `fix/<short-description>` — bug fixes.
- `docs/<short-description>` — documentation only.
- `chore/<short-description>` — dependency bumps, CI tweaks, formatting passes.

Keep the description short. `feature/kirapay-quote-endpoint` is good; `feature/add-the-kirapay-quote-endpoint-with-pagination-and-error-handling` is not.

## Commit messages

[Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/). The most common types in this repo:

- `feat:` — new user-visible functionality.
- `fix:` — bug fix.
- `docs:` — documentation only.
- `refactor:` — internal restructuring with no behavioural change.
- `test:` — tests only.
- `chore:` — tooling, deps, CI.

Scope (optional but useful) is the package or app the change touches: `feat(adapter-kirapay): implement quote()`. Body explains the why; the diff explains the what.

## Pull request requirements

Every PR must:

- Pass CI (`pnpm lint`, `pnpm typecheck`, `pnpm test`).
- Update [ARCHITECTURE.md](./ARCHITECTURE.md) if the change adds or removes a port, an adapter, an app, or a database table.
- Update [INTEGRATIONS.md](./INTEGRATIONS.md) if the change modifies what an adapter does or which sponsor SDK methods it calls.
- Update the corresponding phase entry in [ROADMAP.md](../ROADMAP.md) — flip checkboxes from `[ ]` or `[~]` to `[x]` for items the PR completes.
- Include screenshots or a screen recording for any UI change.

The PR template (`.github/PULL_REQUEST_TEMPLATE.md`) enforces the doc updates as a checklist.

## Setup and development

See the [Quickstart](../README.md#quickstart) section in the root README for the full setup. The short version:

```bash
# 1. Clone and install
git clone <repo-url> konfide
cd konfide
pnpm install

# 2. Configure environment
cp .env.example .env
# Fill in the keys — see comments in .env.example

# 3. Run typecheck and tests
pnpm typecheck
pnpm test

# 4. Run dev servers
pnpm dev
```

Node 22 is required (use `nvm use` to pick it up from `.nvmrc`). pnpm 9+ is required.

### Running individual tasks

```bash
pnpm lint                # Biome lint + format check
pnpm typecheck           # TypeScript across all packages
pnpm test                # Vitest across all packages
pnpm format              # Auto-format with Biome
pnpm check               # Lint + typecheck + test in sequence
```

To run a task in just one package, use Turbo's filter syntax:

```bash
pnpm turbo run typecheck --filter=@konfide/core
```

## Adapter contribution guidelines

Adding a new sponsor adapter:

1. Create the package directory under `packages/adapters/<sponsor>/`.
2. Copy the structure from an existing adapter (e.g. `packages/adapters/kirapay/`): `package.json`, `tsconfig.json`, `src/client.ts`, `src/<sponsor>-adapter.ts`, `src/index.ts`, `README.md`.
3. The package depends only on `@konfide/core`, `@konfide/types`, and the sponsor's SDK. Never on another adapter.
4. The adapter class implements one or more port interfaces from `@konfide/core/ports`. Do not invent new shapes when an existing port fits.
5. Document the adapter in [INTEGRATIONS.md](./INTEGRATIONS.md) using the standard template.
6. Add the env vars to `.env.example` with comments explaining provenance.
7. Add an entry to the sponsor matrix in the root [README.md](../README.md).

If your adapter requires a new port, open an issue first describing why existing ports do not fit. Ports are a domain-level surface; we add them carefully.

## Domain logic constraints

The single most important rule in this repo: **`packages/core` does not import from any sponsor SDK, from `@solana/*`, from `node:*`, or from any I/O primitive.** The package's only allowed dependency is `@konfide/types`. This is enforced by the absence of those packages from `packages/core/package.json` and by code review. Violating it is grounds for an immediate review block — the rule is what makes the rest of the architecture work.

If you find yourself wanting to add an SDK import to `packages/core`, the right move is almost always one of:

- Add a method to an existing port and implement it in the corresponding adapter.
- Define a new port (with a maintainer-approved issue) and implement it in a new or existing adapter.
- Move the I/O-shaped code to a service in `packages/core/src/services` that takes the port as a constructor dependency.

## Documentation expectations

Documentation is part of the contribution, not a follow-up. A PR that adds a feature without updating the relevant docs is incomplete and will be sent back. The docs are not optional polish — they are how judges, contributors, and future hires understand the system.

The minimum doc updates per change type:

- New port → ARCHITECTURE.md (Ports table) + ROADMAP.md (phase entry).
- New adapter → INTEGRATIONS.md (full section using template) + ARCHITECTURE.md (Adapters table) + README.md (sponsor matrix) + ROADMAP.md.
- New API endpoint → ARCHITECTURE.md if it changes the data flow; INTEGRATIONS.md if it consumes a sponsor adapter.
- New domain rule or invariant → ARCHITECTURE.md (Core domain model section).
- Bug fix → no doc change required unless the bug exposed a documented invariant that was wrong.

## Tests

Vitest across all TypeScript packages. Anchor tests live in `packages/contracts/tests/`. Tests are not currently required for stub-level adapter methods (they would test that `throw new NotImplementedError(...)` throws). Once a method is implemented, tests are required.

Test naming follows the file under test: `invoice.ts` is tested by `invoice.test.ts` colocated next to it. Integration tests that span packages live under `packages/<x>/test/integration/`.

## Releasing

`v0.1.0-frontier` is the planned hackathon release tag. After the hackathon, releases follow semver and are tagged on `main`. The team will decide on changelog tooling (changesets, release-please, or hand-written) before the seed round.

## Questions

Ask in the project Discord `[TBD: link once channel exists]` or open a GitHub Discussion. PR comments are reviewed within 48 hours during the hackathon and within a week thereafter.

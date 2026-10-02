# VibeGuard

**AI-generated application security hardening + stabilization** case study for a synthetic Next.js + Supabase image participation/voting service.

VibeGuard preserves both sides of the work:

`AI-generated baseline → audit → remediation → live DB verification → browser regression → release gate`

No client source code, credentials, or production data are used.

## V2 portfolio evidence reset

The original intentionally vulnerable baseline is now treated as legacy harness work, not as independent portfolio provenance. V2 uses an isolated generation branch and a separately frozen AI-generated application before any audit begins. See:

- `docs/11-case-study-reset-v2.md`
- `docs/12-client-brief-v2.md`
- `docs/13-independent-generation-protocol-v2.md`
- `docs/14-audit-plan-v2.md`

## Evidence-first repository

- **`baseline-ai-generated`** — legacy V1 harness; excluded from V2 provenance claims.
- **`baseline-v2-generated`** — reserved immutable tag for the independently generated V2 baseline after the functional-only generation gate.
- **`hardened-release`** — immutable completion marker created by CI only after the closure commit passes both application/browser and live local Supabase jobs.
- `docs/00-acceptance-criteria.md` — requirement → executable evidence map.
- `supabase/migrations/` — baseline, hardening, then final RPC-only write boundaries.
- `supabase/tests/` — RLS/AuthZ/Storage, analytics and integrity SQL.
- `evidence/` — source before/after, live Supabase and browser evidence notes.
- `.github/workflows/ci.yml` — tracked-lockfile release gate.

## What is actually hardened

- cross-user profile RLS and admin authorization
- self-role escalation protection
- no browser-visible service-role pattern
- owner-scoped Supabase Storage writes
- DB-level `UNIQUE (poll_id, user_id)`
- **RPC-only votes**: clients cannot bypass `submit_vote`; vote + aggregate + canonical event share one DB transaction
- **RPC-only events**: clients cannot write raw event rows or forge `vote_submitted`; `record_event` validates observational events
- stable event dedupe, ordered funnel/drop-off, authorized deterministic CSV export with spreadsheet-formula neutralization
- local synthetic images + `next/image`, no external content-page resource dependency
- health/readiness endpoints, route error boundary and explicit loading state
- production-build Playwright across Desktop Chromium, WebKit and Android-like Chromium

## Verification highlights

The pre-closure full run (#19) passed:

- typecheck / lint / Vitest / Next production build
- all three Playwright projects with zero core-flow browser errors
- disposable local Supabase migrations, RLS/AuthZ/Storage, analytics and 20-session duplicate concurrency
- runtime content-page evidence with external resources = 0 and CI-observed CLS = 0 across all configured browser projects

The closure workflow re-runs the suite with `npm ci` from committed `package-lock.json`. Only a successful closure run can create `hardened-release`.

## Local commands

```bash
npm ci
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
```

For real PostgreSQL/RLS/Storage evidence, use the Supabase CLI/Docker path documented by `scripts/run-supabase-db-tests.sh`.

## Claim boundary

This is a security-hardening portfolio, not a claimed professional penetration test. Local Supabase execution does not prove a hosted project's configuration, WebKit automation is not a physical iPhone claim, and Android emulation is not a physical-device claim. See `docs/10-production-gaps.md`.

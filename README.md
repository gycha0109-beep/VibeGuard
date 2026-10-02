# VibeGuard

AI-assisted MVP hardening portfolio for a synthetic Next.js + Supabase image participation/voting service.

VibeGuard demonstrates a verifiable remediation flow rather than a security checklist:

`AI-generated baseline → audit → RLS/Auth hardening → integrity remediation → analytics → browser stabilization → regression → release gate`

No client source code, credentials, or production data are used.

## Repository evidence

- `baseline-ai-generated`: intentionally vulnerable baseline ref preserved on GitHub.
- `main`: hardened work-in-progress.
- `docs/00-acceptance-criteria.md`: SEC / INT / EVT / PERF / BROWSER / REL acceptance map.
- `supabase/migrations/202610020002_hardening.sql`: RLS, privileged RPC, storage and DB-invariant remediation.
- `supabase/tests/`: live/staging RLS-negative and integrity suites.
- `evidence/`: before/after source-contract evidence.
- GitHub Actions: secret-free typecheck/lint/tests/build/Chromium/WebKit/mobile-emulation gate.

## Hardening highlights

- cross-user profile RLS replaced with `auth.uid()`/admin boundaries
- forgeable client admin header removed
- browser-visible service-role pattern removed
- `UNIQUE (poll_id, user_id)` protects vote integrity
- vote RPC derives the actor from `auth.uid()` and updates vote/aggregate/event within one DB call
- event dedupe keys, session funnel/drop-off RPC and authorized CSV export
- owner-scoped Storage write policies
- `next/image`, explicit sizing and reduced repeated client work
- Playwright projects for Desktop Chromium, WebKit engine and Android-like Chromium emulation

## Claim boundary

The source-contract security gate currently has hardened checks authored and passing in local static evidence. A real Supabase RLS/Storage PASS is only claimed after the disposable/staging SQL suites execute successfully. WebKit automation is not labeled as a physical iPhone Safari pass, and mobile Chromium emulation is not labeled as physical Android hardware verification.

See `docs/08-release-verification.md` and `docs/10-production-gaps.md` for the current gate state.

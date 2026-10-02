# Release Verification

## Completion rule

`hardened-release` is the immutable completion marker. The workflow creates that tag **only** on the closure commit after both jobs succeed:

1. `verify` — lockfile install, static before/after gates, TypeScript, ESLint, Vitest, production build, Chromium/WebKit/Android-emulation Playwright.
2. `supabase-policy` — fresh local Supabase migrations plus live RLS/AuthZ/Storage/event-RPC/analytics/concurrency verification.

If either job fails, the tag job is skipped.

## Verified evidence before closure

GitHub Actions run #19 (`36960443076`) was fully green after analytics/performance integration:

- TypeScript, ESLint, Vitest, production build: PASS
- Desktop Chromium / WebKit / Android Chromium emulation: PASS
- console/page errors in core flow: 0
- local Supabase RLS/AuthZ/Storage/analytics/20-session duplicate concurrency: PASS
- performance evidence artifact: PASS

The closure commit additionally removes direct client writes to canonical vote/event tables, adds live negative tests for those boundaries, switches CI to tracked-lockfile `npm ci`, and wires health/readiness plus actual UI funnel events. The `hardened-release` tag is therefore the authoritative final gate rather than run #19.

## Claim boundary

A successful tag certifies the repository's automated acceptance suite. It does **not** claim a hosted production Supabase audit, physical-device Safari/Android QA, or a professional penetration test.

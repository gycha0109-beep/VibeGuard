# Release Verification

## Current automated gate state

GitHub Actions run **#17** (`36955921182`) on commit `b6dd513dbb28fc9e6d89ec94c1297e75fe597c9a` established the first combined green security/integrity/browser gate.

| Gate | Status |
|---|---|
| static security source/migration contract | PASS (SEC-001/002/003/005/007/008/009 + INT-001 contract) |
| baseline → hardened source evidence | PASS (0/8 → 8/8) |
| disposable local Supabase migrations | PASS |
| live local RLS/AuthZ negative suite | PASS |
| live local Storage owner/cross-user boundary | PASS |
| sequential duplicate vote | PASS |
| 20-session concurrent duplicate vote | PASS: durable vote=1, aggregate=1, canonical event=1 |
| TypeScript | PASS |
| ESLint | PASS |
| Vitest security/integrity | PASS |
| Next.js production build | PASS |
| Playwright Desktop Chromium | PASS |
| Playwright WebKit engine | PASS |
| Playwright Android-like Chromium | PASS |
| browser console/page errors in core flow | PASS: 0 |
| hosted Supabase production/staging project | NOT CLAIMED |
| physical iPhone / Android devices | NOT CLAIMED |

Analytics live SQL and performance metrics are being promoted into the same release gate next; the repository must not use the term `production-ready` until the complete acceptance set is green.

## Baseline failure preservation

The intentionally failing baseline definitions are preserved under `evidence/before/test-definitions/` and the Git ref `baseline-ai-generated`. They are deliberately excluded from the hardened active suite.

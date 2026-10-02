# Release Verification

## Gates
| Gate | Current status |
|---|---|
| static security source/migration contract | PASS locally (7/7), CI re-check required |
| baseline before/after source evidence | PASS locally (0/7 -> 7/7), CI re-check required |
| live RLS negative suite | AUTHORED, NOT EXECUTED (`supabase/tests/rls_negative.sql`) |
| live duplicate/integrity SQL | AUTHORED, NOT EXECUTED (`supabase/tests/integrity.sql`) |
| TypeScript | CI execution required |
| ESLint | CI execution required |
| Vitest security/integrity | CI execution required |
| Next.js production build | CI execution required |
| Playwright Chromium | CI execution required |
| Playwright WebKit | CI execution required |
| Playwright Android-like Chromium | CI execution required |
| live Storage policy verification | PENDING environment |

`production-ready` must not be claimed while required gates remain pending.

## Baseline failure preservation
The intentionally failing baseline definitions are preserved under `evidence/before/test-definitions/` and the Git ref `baseline-ai-generated`. They are deliberately excluded from the hardened `tests/` tree so the final release suite remains meaningful.

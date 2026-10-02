# Production Gaps

Current main is a hardened work-in-progress, not yet declared production-ready.

## Environment verification gaps
- No real Supabase project has been connected in this execution track yet.
- Live RLS, privileged RPC, concurrency and Storage policy suites are authored but must execute against a disposable/local or staging Supabase environment before live-policy PASS is claimed.
- Playwright WebKit is an engine-level verification, not proof of a real iPhone Safari device pass.
- Chromium mobile emulation is not proof of a physical Android Chrome device pass.
- Physical-device QA remains a separate manual acceptance step.

## Toolchain compatibility gaps
- TypeScript 7.0.2 is used for `tsc`, while compiler-API consumers resolve through Microsoft's `@typescript/typescript6` compatibility package because TypeScript 7.0 intentionally does not ship the JS compiler API.
- ESLint is pinned to 9.39.5 even though the 9.x line reached EOL on 2026-08-06. The reason is an upstream compatibility gap: the current `eslint-config-next` React lint stack still contains an `eslint-plugin-react` version that calls APIs removed by ESLint 10. This is a development-tooling constraint, not a runtime dependency. Re-test and move back to ESLint 10 as soon as the Next/React lint dependency stack supports it.

## Claim boundary
- Source/migration contracts do not substitute for live Supabase policy execution.
- Synthetic mode proves deterministic application-level regression behavior but not hosted infrastructure behavior.
- No penetration-test claim or invented CVSS score is made.

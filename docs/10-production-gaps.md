# Production Gaps

Current main is a hardened work-in-progress. The disposable local Supabase stack has passed live policy/integrity verification, but hosted production verification has not been claimed.

## Remaining environment gaps
- No hosted Supabase staging/production project is connected to this portfolio track. Local Supabase verifies real PostgreSQL/RLS/Storage semantics, not hosted configuration drift.
- Playwright WebKit is an engine-level verification, not proof of a real iPhone Safari device pass.
- Chromium mobile emulation is not proof of a physical Android Chrome device pass.
- Physical-device QA remains a separate manual acceptance step.
- Runtime performance evidence is CI/browser-specific and must not be presented as a universal production latency benchmark.

## Toolchain compatibility gaps
- TypeScript 7.0.2 is used for `tsc`, while compiler-API consumers resolve through Microsoft's `@typescript/typescript6` compatibility package because TypeScript 7.0 intentionally does not ship the JS compiler API.
- ESLint is pinned to 9.39.5 even though the 9.x line reached EOL on 2026-08-06. The current `eslint-config-next` React lint stack still contains an `eslint-plugin-react` version that calls APIs removed by ESLint 10. This is development-tooling debt, not a runtime dependency, and should be re-tested after the upstream stack updates.

## Claim boundary
- Local Supabase PASS is evidence for the checked migrations/policies; it is not a hosted-environment security certification.
- Synthetic mode proves deterministic application-level regression behavior but not hosted infrastructure behavior.
- No professional penetration-test claim or invented CVSS score is made.

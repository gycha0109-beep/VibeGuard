# Production Gaps

The portfolio release can be complete while these production-environment gaps remain explicit.

## Environment gaps

- No hosted Supabase staging/production project is connected to this synthetic portfolio. Local Supabase verifies real PostgreSQL/RLS/Storage semantics for the checked migrations, not hosted configuration drift.
- Playwright WebKit is browser-engine evidence, not proof of a physical iPhone Safari pass.
- Pixel 7 Chromium emulation is not proof of physical Android Chrome hardware behavior.
- CI performance timings are environment-specific evidence, not a production SLA or universal benchmark.

## Toolchain compatibility debt

- TypeScript 7.0.2 provides the current `tsc` compiler; compiler-API consumers use Microsoft's `@typescript/typescript6` compatibility package.
- ESLint remains pinned to 9.39.5 because the current Next/React lint dependency stack used here is not compatible with ESLint 10's removed APIs. This is development-tooling debt, not a runtime dependency.

## Security claim boundary

- `hardened-release` means the documented automated hardening/verification gates passed.
- It does not mean an external penetration test, hosted-infrastructure certification, or physical-device certification was performed.

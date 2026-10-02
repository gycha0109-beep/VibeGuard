# Architecture

## Service shape
A synthetic image-participation and voting service intentionally starts as an AI-assisted MVP. The UI is deliberately small because the portfolio target is hardening rather than feature breadth.

## Runtime
- Next.js 16.3.8 App Router UI and route handlers.
- Supabase JS 2.117.1 / SSR 0.12.7.
- Supabase/PostgreSQL schema, RLS and RPC migration files.
- Vitest 5.0.3 for contract/security/integrity tests.
- Playwright 1.63.0 for Chromium/WebKit/mobile-emulation regression.
- GitHub Actions for a secret-free release gate; live Supabase verification is tracked separately.

## TypeScript 7 toolchain compatibility
TypeScript 7.0.2 is the current compiler, but TypeScript 7.0 does not expose the compiler API used by tools such as typescript-eslint. Following Microsoft's TypeScript 7.0 migration guidance, the project installs:

- `@typescript/native: npm:typescript@7.0.2` — provides the current `tsc` compiler.
- `typescript: npm:@typescript/typescript6@6.0.2` — compatibility API consumed by compiler-API tooling such as the Next.js ESLint stack.

This is an intentional compatibility bridge, not an accidental downgrade. It should be reevaluated after the TypeScript 7.1 API and dependent tooling support are stable.

## Hardening target
Browser -> Next.js server boundary -> authenticated Supabase context -> RLS/privileged RPC -> PostgreSQL invariants.

The final design must not depend on UI button disabling for integrity and must not place a service-role key in browser-visible environment variables.

# Architecture

## Service shape
A synthetic image-participation and voting service intentionally starts as an AI-assisted MVP. The UI is deliberately small because the portfolio target is hardening rather than feature breadth.

## Baseline runtime
- Next.js App Router UI and route handlers.
- Supabase/PostgreSQL schema, RLS and RPC migration files.
- Browser Supabase client for ordinary user paths.
- Synthetic admin route showing a common client-role trust bug.
- Vitest for contract/security/integrity tests.
- Playwright for Chromium/WebKit/mobile-emulation regression.
- GitHub Actions for a secret-free static gate; live Supabase verification remains separately declared.

## Hardening target
Browser -> Next.js server boundary -> authenticated Supabase context -> RLS/privileged RPC -> PostgreSQL invariants.

The final design must not depend on UI button disabling for integrity and must not place a service-role key in browser-visible environment variables.

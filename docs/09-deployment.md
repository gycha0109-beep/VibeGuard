# Deployment

## Required runtime configuration
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: public/publishable browser-safe key.
- `VIBEGUARD_SYNTHETIC_MODE`: must be unset/false in real deployment.

A service-role credential is intentionally not required by the normal web application runtime. Privileged reads are mediated by authenticated RLS/RPC boundaries.

## Database
Apply migrations in order from `supabase/migrations/`. A real Supabase deployment must separately verify Storage schema policies because the source-contract environment does not provide Supabase Storage.

## Pre-release
Run `npm run verify:release`; then run the live Supabase policy suite against a disposable/staging project before production deployment.

# FrameVote setup

Runs out of the box in **demo mode**: synthetic users/entries in `src/lib/store.ts`, persisted to browser localStorage. Sign in by picking a demo account (Demo Admin has admin access).

## Connecting a real backend
1. Enable Lovable Cloud (or connect a Supabase project).
2. Apply `db/schema.sql`.
3. Env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (browser); `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (server only, never `VITE_`).
4. Swap the `api` functions in `src/lib/store.ts` for Supabase calls (same shapes as the tables). Use `poll_result()` for counts; CSV export reads `user_events` (admin RLS).
5. Promote an admin: `insert into user_roles (user_id, role) values ('<uuid>','admin');`

Stack note: the app uses TanStack Start (React + TypeScript), the supported framework here, instead of Next.js.
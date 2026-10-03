# FrameVote setup

Runs out of the box in **demo mode**: synthetic users/entries in `src/lib/store.ts`, persisted to browser localStorage. Sign in by picking a demo account (Demo Admin has admin access).

## Connecting a real backend

1. Enable Lovable Cloud (or connect a Supabase project).
2. Apply `db/schema.sql`.
3. Env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (browser); `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (server only, never `VITE_`).
4. Swap the `api` functions in `src/lib/store.ts` for Supabase calls.
   - Submit votes only through `submit_vote(poll_id)`; direct inserts into `votes` are intentionally unavailable.
   - Record observational events only through `record_event(name, entry_id)`; `vote_submit` is canonical and can only be emitted by `submit_vote`.
   - Use `poll_result()` for counts.
   - CSV export reads `user_events` under the admin RLS policy.
5. Promote an admin: `insert into user_roles (user_id, role) values ('<uuid>','admin');`

The `entry-images` bucket is private. Published image objects are readable through Storage RLS when their `image_path` belongs to a published entry; owners can read their own unpublished objects.

Stack note: the app uses TanStack Start (React + TypeScript), the supported framework here, instead of Next.js.

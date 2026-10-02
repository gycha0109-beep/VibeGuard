# Live local Supabase verification

First combined green run: GitHub Actions **#17**, run id `36955921182`, commit `b6dd513dbb28fc9e6d89ec94c1297e75fe597c9a`.

Verified against a disposable Supabase local stack (CLI 2.119.0):
- baseline + hardening migrations apply cleanly,
- user A cannot read/update user B private profile,
- ordinary self-profile update works but self-role escalation is rejected,
- ordinary user cannot read raw events/admin notes or call privileged export,
- owner Storage path insert succeeds; cross-user Storage path insert is rejected,
- admin and anon boundaries behave as specified,
- duplicate vote retry yields one durable row and aggregate count 1,
- 20 concurrent duplicate vote sessions yield exactly one durable vote, aggregate count 1 and one canonical `vote_submitted` event.

This is real PostgreSQL/RLS/Storage execution evidence in a disposable local Supabase stack. It is not a claim that a hosted production project was tested.

# Security Remediation

## Closed at source/migration-contract level
- SEC-001/002: baseline global profile read/update policies are dropped; target policies bind self access to `auth.uid()` and permit admin via a server-controlled helper.
- SEC-003: admin route no longer consumes a client `x-role` header. It requires an authenticated user and checks the role through the server-side Supabase context.
- SEC-005: the public-prefixed service-role configuration pattern was removed. No real credential existed in the baseline.
- SEC-007: the baseline definer export is revoked; replacement admin RPCs perform an explicit admin check.
- SEC-008: storage writes are scoped to an authenticated user's first path segment, with admin override only in the hardened policy.
- INT-001: `UNIQUE (poll_id, user_id)` is introduced at the database layer.
- INT-003: the hardened vote RPC derives the actor from `auth.uid()`, performs insert/aggregate/event work in one database function invocation, and only increments the aggregate for a newly inserted vote.

## Evidence levels
1. `evidence/security/source-contract-before-after.json`: executable source/migration contract shows baseline 0/7 and hardened 7/7.
2. Vitest contract tests: authored and included in CI.
3. Live Supabase RLS negative tests: required before claiming Supabase production verification.

This project does not describe the work as penetration testing and does not assign invented CVSS scores.

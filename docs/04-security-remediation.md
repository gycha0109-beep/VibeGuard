# Security Remediation

## Closed boundaries

- **SEC-001/002** — global profile read/update policies are removed; access is self/admin-bound through `auth.uid()`.
- **SEC-003** — `x-role` trust is removed; admin privilege is derived from verified server auth + DB role.
- **SEC-005** — the public-prefixed service-role configuration pattern is removed; the normal runtime requires no service-role credential.
- **SEC-007** — baseline public definer export is revoked; replacement export/funnel RPCs perform explicit admin checks.
- **SEC-008** — Storage writes are scoped to the authenticated user's first path segment, with admin override only where intended.
- **SEC-009** — self-service profile updates cannot mutate privileged `role`/`email` fields.
- **SEC-010** — client-visible roles have direct `user_events` INSERT/UPDATE/DELETE revoked. Observational events go through an allowlisted, size-bounded `record_event` RPC; canonical `vote_submitted` can only be emitted by the vote transaction.
- **INT-001/002/003/004** — `(poll_id,user_id)` is unique, `submit_vote` is the privileged transaction boundary, direct vote-table writes are revoked, and live 20-session concurrency verification asserts exactly one durable vote / aggregate increment / canonical event.

## Evidence levels

1. Source/migration before→after gate: baseline fails the hardened contracts; current source passes them.
2. Vitest: security, integrity and CSV contracts.
3. Disposable Supabase local stack: real PostgreSQL RLS, Storage, RPC, analytics and concurrency execution.
4. Playwright production build: browser regression + forged admin header + HTTP duplicate behavior.

This portfolio is an application-hardening case study, not a claimed professional penetration test. No invented CVSS values are used.

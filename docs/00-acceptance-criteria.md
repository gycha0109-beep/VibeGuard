# VibeGuard Acceptance Criteria

The synthetic portfolio is derived from the external brief but uses no client code, credentials, or production data.

| ID | Gate | Acceptance criterion | Evidence |
|---|---|---|---|
| SEC-001 | RLS | user A cannot select user B private profile fields | live local negative DB test |
| SEC-002 | RLS | user A cannot update user B profile | live local negative DB test |
| SEC-003 | AuthZ | admin API derives privilege server-side; forgeable client role is ignored | API/E2E contract |
| SEC-004 | RLS | raw `user_events` are not generally readable | live local negative DB test |
| SEC-005 | Secrets | no browser-visible service-role configuration | static source gate |
| SEC-006 | RLS | `admin_notes` is admin-only | live local negative DB test |
| SEC-007 | RPC | export/funnel RPCs perform an admin check | live local negative RPC test |
| SEC-008 | Storage | image writes are owner-path scoped | live local Storage policy test |
| SEC-009 | AuthZ | user cannot self-promote `profiles.role` or mutate privileged identity fields | trigger + live negative test |
| SEC-010 | Event integrity | client roles cannot write `user_events` directly or forge canonical `vote_submitted`; allowlisted events use `record_event` | live negative/positive RPC test |
| INT-001 | Integrity | DB invariant prevents >1 vote per poll/user | unique constraint + DB test |
| INT-002 | Integrity | rapid/retry/concurrent duplicates produce one vote | HTTP regression + 20-session DB concurrency test |
| INT-003 | Integrity | vote insert + aggregate + canonical event share one transaction boundary | privileged `submit_vote` RPC test |
| INT-004 | Integrity | client roles cannot bypass the transaction RPC by inserting directly into `votes` | live negative DB test |
| EVT-001 | Analytics | event taxonomy/schema/writers are documented | event spec |
| EVT-002 | Analytics | sequential funnel/drop-off is reproducible | live SQL/RPC test |
| EVT-003 | Analytics | CSV export is authorized, stable-order and spreadsheet-formula safe | RPC + unit tests |
| EVT-004 | Analytics | event retry/deduplication is explicit | unique dedupe + live SQL test |
| PERF-001 | Performance | repeated baseline list/event work is removed or measured | before/after gate |
| PERF-002 | Performance | image sizing/loading avoids obvious CLS source | browser runtime evidence |
| BROWSER-001 | QA | Desktop Chromium core flow passes | Playwright |
| BROWSER-002 | QA | WebKit core flow passes; no physical iPhone claim | Playwright |
| BROWSER-003 | QA | Android-like Chromium passes; no physical-device claim | Playwright |
| REL-001 | Release | lockfile install, lint, typecheck, tests, build and E2E are green | GitHub Actions |
| REL-002 | Release | live local critical RLS/AuthZ/integrity failures = 0 | `supabase-policy` job |
| REL-003 | Release | hosted/physical-device gaps remain explicitly documented | production gaps doc |

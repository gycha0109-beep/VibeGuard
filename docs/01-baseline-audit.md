# Baseline Audit

Status: intentionally vulnerable synthetic baseline.

| Finding | Severity label | Concrete evidence | Intended remediation |
|---|---|---|---|
| SEC-001 cross-user profile read | High | `baseline_profiles_read_all using (true)` | self/admin policy; public profile projection separated from private fields |
| SEC-002 cross-user profile update | High | update policy `using/with check (true)` | `auth.uid() = id`, admin server boundary |
| SEC-003 forgeable admin header | High | `/api/admin/users` trusts `x-role` | derive user from verified server auth and DB role |
| SEC-005 service-role public env pattern | Critical configuration finding | `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` placeholder + baseline client | server-only env; automated grep gate |
| SEC-004/006 broad raw/admin reads | High | `user_events` and `admin_notes` select-all policies | deny raw user read; admin helper/policies |
| SEC-007 unauthenticated definer export | High | `baseline_export_events()` granted to public | revoke public; explicit admin check |
| INT-001 duplicate vote | High | no `(poll_id,user_id)` unique constraint | DB unique invariant |
| INT-003 partial write | Medium | insert + aggregate update in weak baseline RPC | transaction-safe authenticated RPC |
| PERF-001 repeated client work | Medium | effect refires and replaces list state | server-render/static seed or measured fetch cache |
| PERF-002 image loading | Medium | raw large `<img>` | `next/image`, responsive sizing |
| OBS-001 PII log | Medium | raw event payload logged | structured allowlisted log fields |

No CVSS numbers are assigned. This is application hardening evidence, not a claimed professional penetration test.

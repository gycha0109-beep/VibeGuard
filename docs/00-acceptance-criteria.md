# VibeGuard Acceptance Criteria

The synthetic portfolio is derived from the external brief but uses no client code or data.

| ID | Gate | Acceptance criterion | Evidence target |
|---|---|---|---|
| SEC-001 | RLS | user A cannot select user B private profile fields | automated negative DB test + SQL policy |
| SEC-002 | RLS | user A cannot update user B profile | automated negative DB test |
| SEC-003 | AuthZ | admin API derives privilege server-side; forgeable client role is ignored | API test |
| SEC-004 | RLS | raw user_events are not generally readable | automated negative DB test |
| SEC-005 | Secrets | service-role credential is server-only and no NEXT_PUBLIC service-role variable exists | secret scan + code review test |
| SEC-006 | RLS | admin_notes restricted to admin boundary | automated negative DB test |
| SEC-007 | RPC | privileged export/funnel RPC checks caller role | RPC test |
| SEC-008 | Storage | content image read/write/delete boundaries are explicit | policy test + production gap note |
| INT-001 | Integrity | DB invariant prevents >1 vote per poll/user | unique constraint + DB test |
| INT-002 | Integrity | rapid clicks/retries/two-tab duplicate requests result in one row | concurrency test |
| INT-003 | Integrity | vote insert + aggregate update have one transaction boundary | RPC/transaction test |
| EVT-001 | Analytics | event taxonomy and schema are documented | event spec |
| EVT-002 | Analytics | funnel/drop-off query is reproducible | SQL/RPC test |
| EVT-003 | Analytics | CSV export is authorized and deterministic | API/RPC test |
| EVT-004 | Analytics | event retry/deduplication rule is explicit | idempotency test |
| PERF-001 | Performance | repeated list fetch/render is removed or measured | before/after measurement |
| PERF-002 | Performance | image loading uses Next/Image/lazy sizing and avoids obvious CLS source | browser evidence |
| BROWSER-001 | QA | Chromium desktop core flow passes | Playwright |
| BROWSER-002 | QA | WebKit engine core flow passes; not claimed as real iPhone | Playwright |
| BROWSER-003 | QA | Android-like Chromium viewport passes; not claimed as real Android hardware | Playwright |
| REL-001 | Release | lint, typecheck, unit/security/integrity, build, core E2E all green | CI/release artifact |
| REL-002 | Release | critical RLS/cross-user failures = 0 after remediation | release gate |
| REL-003 | Release | production-only gaps are explicitly recorded | production gaps doc |

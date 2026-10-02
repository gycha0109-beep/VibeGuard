# V2 Audit Plan

This plan is intentionally stored on `main`, not on the isolated generation branch.

After `baseline-v2-generated` is frozen:

## Phase A — Intake

- inventory routes, API handlers, Supabase clients, migrations and environment variables;
- map authentication and authorization decisions;
- map database write paths;
- map event/analytics write paths.

## Phase B — Reproduction-first audit

Potential areas to inspect, without assuming a finding exists:

- cross-user profile/data access;
- admin authorization source;
- self-role modification;
- storage path ownership;
- direct vote writes;
- duplicate/retry/concurrency behavior;
- canonical event forgery;
- raw event access;
- CSV authorization/escaping;
- browser/runtime regressions.

Every finding requires evidence against the frozen baseline.

## Phase C — Remediation

For each confirmed finding:

- assign finding ID;
- record impact;
- preserve reproduction;
- make the minimum justified code/DB change;
- run the identical reproduction again.

## Phase D — Portfolio evidence

Porthub should show:

`intake → finding → reproduction → root cause → change → re-test`

It should not lead with self-created scores or generic PASS badges.

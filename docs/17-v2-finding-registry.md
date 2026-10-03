# V2 Finding Registry

Frozen independent baseline: `2bb435dc89543a487bf151720202fc97d68100d3`  
Generator source: Lovable `cc5b0f00b1ca1e23b12c9ec314612b594c0cd9a1`  
Baseline reproduction run: GitHub Actions `37082855046` — SUCCESS  
Final remediation re-test run: GitHub Actions `37083925427` — SUCCESS  
Final hardened V2 branch: `hardened-v2` @ `42a0023fd49372ec0e384b9c5317424081ea24d1`

| ID | Area | Finding | Baseline evidence | Remediation | Re-test | Status |
|---|---|---|---|---|---|---|
| EVT-01 | Analytics integrity | authenticated client could create canonical `vote_submit` without a durable vote | votes=0 / forged event=1 | revoke direct event insert; `record_event` allowlist excludes `vote_submit`; canonical vote event emitted only by `submit_vote` | direct insert denied; `record_event('vote_submit')` denied | CLOSED |
| INT-01 | Vote integrity | durable vote could commit without its canonical vote event | vote=1 / matching event=0 | revoke direct vote insert; transactional `submit_vote` creates vote + canonical event; duplicate call idempotent | two calls => durable vote=1 / canonical event=1 | CLOSED |
| STO-01 | Storage privacy | image path for an unpublished entry targeted a public bucket | unpublished entry=true / `entry-images.public=true` | make bucket private; SELECT policy permits published objects or owner-folder access | anon sees published object, not unpublished; owner retains unpublished access | CLOSED |
| QA-01 | Quality gate | generated repository failed its own lint command | `bun run lint`: 157 problems, 150 errors, 7 warnings | deterministic repository formatter applied by CI | strict `bun run lint` PASS | CLOSED |
| QA-02 | Test stability | generated routing smoke tests failed 2/2 | correct `bun run test`: both route smoke tests timed out with empty render container | load router before rendering in test harness | strict `bun run test` PASS | CLOSED |

## Confirmed baseline non-findings

These controls already existed in the independently generated application and are **not claimed as remediation work**:

- duplicate same-user/same-poll vote invariant via `PRIMARY KEY (poll_id, user_id)`;
- roles separated from the editable profile row;
- ordinary users not granted role mutation;
- entry writes owner-scoped through RLS;
- storage write/update/delete paths owner-folder scoped;
- production build already succeeded before QA cleanup.

## Evidence boundary

This case study uses a disposable local Supabase stack and automated repository checks. It does not claim:

- a professional penetration-test certification;
- verification of a hosted customer's production Supabase configuration;
- physical-device Safari/Android validation;
- that the synthetic application is an actual customer system.

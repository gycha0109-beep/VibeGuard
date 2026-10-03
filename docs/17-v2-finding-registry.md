# V2 Finding Registry

Frozen baseline: `2bb435dc89543a487bf151720202fc97d68100d3`  
Independent generator source: Lovable `cc5b0f00b1ca1e23b12c9ec314612b594c0cd9a1`  
Reproduction run: GitHub Actions `37082855046` — SUCCESS

| ID | Area | Finding | Reproduction | Root cause | Remediation | Re-test | Status |
|---|---|---|---|---|---|---|---|
| EVT-01 | Analytics integrity | authenticated client can create `vote_submit` without a durable vote | local Supabase: votes=0, forged canonical event=1 | direct INSERT grant/policy accepts `vote_submit` as a normal client event | pending | pending | CONFIRMED |
| INT-01 | Vote integrity | durable vote can commit with no canonical vote event | local Supabase: vote=1, matching `vote_submit`=0 | vote row and canonical event are independent client writes; no transactional RPC | pending | pending | CONFIRMED |
| STO-01 | Storage privacy | image path for an unpublished entry targets a public bucket | local Supabase: unpublished entry=true and `entry-images.public=true` | entire bucket is public; owner-path checks cover writes only | pending | pending | CONFIRMED |

## Reproduction evidence

The V2 audit branch `audit-v2` was created from the frozen baseline, with no application-source edits before reproduction.

Audit commit: `3596dba7eb55a568e0c03d572e91626278d69f43`

The disposable Supabase run applied the baseline's own `db/schema.sql` and printed:

- `EVT-01 CONFIRMED: vote_submit can be inserted without any vote`
- `INT-01 CONFIRMED: durable vote can exist with no vote_submit event`
- `STO-01 CONFIRMED: unpublished entry image path targets a public storage bucket`

## Non-findings observed during intake

- Duplicate same-user/same-poll votes already have a database primary-key invariant: `PRIMARY KEY (poll_id, user_id)`.
- Roles are separated from the editable profile row; ordinary users are not granted role mutation.
- Entry writes are owner-scoped through RLS.
- Storage write/update/delete paths are owner-folder scoped.

These are not presented as remediation achievements because they already existed in the independently generated baseline.

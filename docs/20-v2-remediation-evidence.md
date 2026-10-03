# V2 Audit & Remediation Evidence

## Case-study method

A fixed client-style product brief was sent to a separate AI coding agent (Lovable) with no VibeGuard findings, hardened source, audit checklist, workspace knowledge, or workspace skills. The generated application was frozen before audit:

- Lovable source commit: `cc5b0f00b1ca1e23b12c9ec314612b594c0cd9a1`
- GitHub baseline mirror: `2bb435dc89543a487bf151720202fc97d68100d3`
- 85 text source/config/SQL/test files mirrored unchanged;
- binary `public/favicon.ico` excluded because connector transport could not guarantee byte-exact preservation.

Audit and remediation occurred only after that freeze.

---

## EVT-01 — Canonical vote-event forgery

### Finding
The generated schema granted authenticated clients direct INSERT access to `user_events`. The RLS check only required `user_id = auth.uid()`, and `vote_submit` was accepted as an ordinary event name.

### Reproduction
Against the frozen baseline on disposable Supabase:

- durable votes: **0**
- inserted `vote_submit` events: **1**

Audit run `37082855046` printed:

`EVT-01 CONFIRMED: vote_submit can be inserted without any vote`

### Root cause
A business-truth event and an observational analytics event shared the same client-write path.

### Change
- removed direct authenticated INSERT on `user_events`;
- added SECURITY DEFINER `record_event` with an observational-event allowlist;
- excluded `vote_submit` from that allowlist;
- canonical `vote_submit` is written only inside `submit_vote`.

### Re-test
Final run `37083925427`:

`EVT-01 CLOSED: canonical vote event cannot be forged by the client`

---

## INT-01 — Vote/event non-atomicity

### Finding
The generated client flow treated the durable vote and canonical event as separate writes. A vote could exist even when no matching canonical event existed.

### Reproduction
Frozen baseline:

- durable vote: **1**
- matching canonical `vote_submit`: **0**

Audit run `37082855046` printed:

`INT-01 CONFIRMED: durable vote can exist with no vote_submit event`

### Root cause
No transactional server-owned operation bound the business write and canonical analytics event.

### Change
Added SECURITY DEFINER `submit_vote(poll_id)`:

1. resolves `auth.uid()`;
2. validates open/visible poll;
3. inserts vote with database uniqueness retained;
4. emits canonical event only when a new vote is inserted;
5. returns vote count;
6. performs all steps in one database transaction.

Direct authenticated vote INSERT was removed.

### Re-test
The same path was tested twice:

- first `submit_vote`: inserted=true
- duplicate `submit_vote`: inserted=false
- final durable votes: **1**
- final canonical events: **1**

Final run printed:

`INT-01 CLOSED: submit_vote keeps one durable vote and one canonical event`

---

## STO-01 — Unpublished image mapped to public storage

### Finding
The baseline could create an unpublished entry whose `image_path` lived in a Storage bucket configured as `public=true`.

### Reproduction
Disposable Supabase confirmed both conditions simultaneously:

- entry was unpublished;
- `entry-images` bucket was public.

Audit run `37082855046` printed:

`STO-01 CONFIRMED: unpublished entry image path targets a public storage bucket`

### Root cause
Write ownership was enforced, but read privacy depended on a public bucket.

### Change
- changed `entry-images` to private;
- added Storage SELECT policy:
  - anonymous/authenticated read when the object is referenced by a published entry;
  - owner read for their own folder, including unpublished objects;
- retained owner-folder write/update/delete policies.

### Re-test
Final disposable-Supabase test:

- anonymous actor can see published object;
- anonymous actor cannot see unpublished object;
- owner can still see own unpublished object.

Final run printed:

`STO-01 CLOSED: unpublished object is hidden from anon while owner retains access`

---

## QA-01 — Repository lint gate failed

### Finding
The generated repository's own `bun run lint` command failed with **157 problems: 150 errors and 7 warnings**. The 150 errors were formatter violations and reported as auto-fixable.

### Change
A deterministic CI formatting pass ran the repository's formatter and committed only the formatter output.

Formatting commit:

`24893efe7b36e3ea314da92dad5900f63bdbff0a`

### Re-test
Final strict pipeline ran `bun run lint` without `continue-on-error`: **PASS**.

---

## QA-02 — Routing smoke-test harness failed

### Finding
Using the repository's correct test command, `bun run test`, both generated routing smoke tests failed because the test rendered the router before its initial load completed, then asserted against an empty container.

Observed:

- tests: **0 pass / 2 fail**
- both failures: `expected null not to be null`

### Change
The smoke-test helper now waits for `router.load()` before rendering.

### Re-test
Final strict pipeline:

- `bun run test`: **PASS**
- `bun run build`: **PASS**

---

## Final verification

GitHub Actions run `37083925427`:

| Gate | Result |
|---|---|
| Disposable Supabase re-test | PASS |
| lint | PASS |
| routing tests | PASS |
| production build | PASS |

Final hardened V2 source:

`hardened-v2` @ `42a0023fd49372ec0e384b9c5317424081ea24d1`

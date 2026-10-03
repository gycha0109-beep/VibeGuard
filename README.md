# VibeGuard

VibeGuard V2 is an **AI-coded web-service audit and stabilization case study** built around a provenance-first workflow.

A fixed product brief was given to a separate Lovable AI coding agent. The generated application was frozen before any audit began, then inspected independently. Only defects reproduced against that frozen source were recorded as findings.

`fixed brief → independent AI generation → frozen baseline → audit → remediation → same-path re-test`

No customer source code, credentials, production system, or customer data are used.

## V2 source anchors

- Generator: Lovable AI Agent
- Lovable source: `cc5b0f00b1ca1e23b12c9ec314612b594c0cd9a1`
- Frozen baseline branch: `baseline-v2-generated`
- Frozen baseline commit: `2bb435dc89543a487bf151720202fc97d68100d3`
- Hardened branch: `hardened-v2`
- Hardened commit: `42a0023fd49372ec0e384b9c5317424081ea24d1`
- Final V2 re-test run: `37083925427` — DB / lint / test / build PASS

The `main` branch carries the case-study documentation and the older V1 harness history. Use the two V2 branches above when reviewing the generated-before / hardened-after application source.

## Confirmed V2 findings

| ID | Area | Frozen baseline | Hardened re-test |
|---|---|---|---|
| EVT-01 | Analytics integrity | vote 0 / forged canonical event 1 | direct canonical-event forgery denied |
| INT-01 | Vote integrity | vote 1 / matching canonical event 0 | duplicate submits converge to vote 1 / event 1 |
| STO-01 | Storage privacy | unpublished entry mapped to public bucket | anon hidden / owner access retained |
| QA-01 | Quality gate | lint: 150 errors | strict lint PASS |
| QA-02 | Test stability | routing tests: 0/2 | tests PASS / production build PASS |

Details:

- `docs/17-v2-finding-registry.md`
- `docs/20-v2-remediation-evidence.md`

## Provenance

V2 deliberately separates application generation from auditing.

- `docs/11-case-study-reset-v2.md`
- `docs/12-client-brief-v2.md`
- `docs/13-independent-generation-protocol-v2.md`
- `docs/15-generation-provider-record-v2.md`

The old `baseline-ai-generated` branch is a **legacy V1 intentionally vulnerable harness** and is excluded from V2 provenance claims.

## Public portfolio

The Porthub VibeGuard page was rewritten around V2 evidence rather than self-scoring or synthetic before/after claims.

- Porthub commit: `22b59d268ff0d6270d3e2411e47b0e0272d2cb3a`
- Porthub verification run: `37085387275` — PASS
- Publication verification: `docs/21-v2-porthub-publication.md`

## Claim boundary

This is a synthetic methodology case study, not a claimed customer engagement or professional penetration-test certification. Disposable local Supabase verifies the tested database/RLS/Storage behavior; it does not prove a hosted customer's production configuration. Physical-device validation is not claimed.

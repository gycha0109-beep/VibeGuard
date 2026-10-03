# V2 Case Study Status

| Phase | Status | Evidence |
|---|---|---|
| P0 Client brief | COMPLETE | `docs/12-client-brief-v2.md` |
| P0 Provenance reset | COMPLETE | `docs/11-case-study-reset-v2.md` |
| P0 Audit separation | COMPLETE | `docs/14-audit-plan-v2.md` |
| P1 Independent baseline generation | COMPLETE | Lovable source cc5b0f00... mirrored at GitHub 2bb435dc... |
| P2 Independent audit | COMPLETE — 3 confirmed findings | run 37082855046 SUCCESS |
| P3 Remediation | IN PROGRESS | EVT-01 / INT-01 / STO-01 only |
| P4 Re-test | NOT STARTED | waits for remediation |
| P5 Portfolio evidence | NOT STARTED | waits for real V2 evidence |

## Non-negotiable boundary

The old intentionally vulnerable V1 baseline cannot be substituted for P1.

The V2 audit may start only after an independently generated application is frozen and its provenance record is committed.

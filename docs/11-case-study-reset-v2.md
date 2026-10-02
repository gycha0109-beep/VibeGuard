# Case Study Reset — V2 Evidence Model

## Decision

The original `baseline-ai-generated` branch is retained only as historical implementation work.

It is **not** acceptable as provenance evidence for the V2 portfolio case study because the repository history explicitly describes that baseline as intentionally vulnerable. That makes the old before/after useful for test-harness development, but weak as evidence that an independently produced AI-coded application was audited.

## V2 claim

V2 will demonstrate this narrower, defensible claim:

> Given a fixed client-style product brief, a separate AI coding generation step produces an application without access to the audit criteria or hardened implementation. That frozen output is then audited, remediated, and re-tested as a separate phase.

## Evidence boundary

The V2 portfolio may only call something an "initial finding" when all of the following are true:

1. the condition exists in the frozen V2 generated baseline;
2. it was not requested or planted in the generation prompt;
3. a reproduction or source/DB trace demonstrates the condition;
4. the remediation is performed only after the baseline freeze;
5. the same scenario is re-run after remediation.

The existing hardened codebase and tests may be reused as audit tooling or remediation references, but their previous findings do **not** automatically carry into V2.

## Legacy baseline status

- Branch: `baseline-ai-generated`
- Status: **LEGACY — excluded from V2 portfolio provenance**
- Reason: intentionally vulnerable construction is visible in source and commit history.
- Allowed use: regression-test design, harness/reference implementation.
- Disallowed use: claiming an independent discovery against a naturally generated AI-coded application.

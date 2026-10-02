# V2 Generation Provider Record

## Current status

**Baseline generation is not complete. No `baseline-v2-generated` tag may be claimed yet.**

## Attempt 1 — GitHub Models inference API

- Workflow run: 36970406811
- Branch: `baseline-v2-generation`
- Result: failed before any generated source was accepted.
- Observed response: non-JSON placeholder `OK`.
- Baseline provenance impact: none; no candidate was frozen.

## Attempt 2 — official `gh-models` CLI

- Workflow run: 36970540924
- Branch: `baseline-v2-generation`
- Result: failed during model invocation.
- `gh-models` extension installation succeeded, but inference returned the same non-model placeholder response.
- Baseline provenance impact: none; no candidate was frozen.

## Root cause

GitHub Models was fully retired on 2026-07-30. The model catalog, playground, inference API and BYOK were removed for all customers.

This means the failed attempts are an obsolete-provider issue, not evidence about the application-generation prompt.

## Replacement requirement

The next provider must be independent from VibeGuard audit/remediation and must be able to generate a runnable codebase from the fixed client brief.

Preferred current route: an external AI app-building agent with source export. The generated source must be frozen before VibeGuard's audit criteria are applied.

## Integrity rule

Do not manually construct a replacement baseline inside VibeGuard. If an independent provider cannot produce/export the baseline, P1 remains blocked rather than manufacturing evidence.

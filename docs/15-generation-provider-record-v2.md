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


## Attempt 3 — Replit AI Agent

- Provider: Replit AI Agent
- Repl ID: `f22a72af-6fb7-4ee1-aed9-27eb8477bb0c`
- App URL: `https://replit.com/@gycha0109/HightechAcidicSoftwareengineer`
- Initial phase: `creating`
- Generation mode: brand-new app from a neutral product brief
- V1 findings supplied: **no**
- hardened VibeGuard source supplied: **no**
- audit criteria supplied: **no**
- intentional vulnerability instruction: **explicitly prohibited**

### Exact generation request

```text
Create a small image participation and voting web service as a normal fast MVP.

Users should be able to sign in, view published image entries, open an entry, vote or like an open poll, see the current result after voting, edit image entries they own, and view/update their profile.

Administrators should be able to view a simple user list and export user activity/event data as CSV.

The app should record basic product events so an operator can understand the funnel from viewing content to editing or voting and then seeing results.

Use Next.js with TypeScript and Supabase concepts for authentication, PostgreSQL data, and user-owned image storage. Include a responsive interface and everything needed for a normal runnable MVP. The project should include setup instructions and environment configuration examples. It should remain usable for preview/build even when real Supabase credentials are not present, using sensible local or synthetic fallback data if needed.

Implement this as a normal product MVP using the engineering choices you would naturally make. Do not intentionally add vulnerabilities, security demonstrations, audit fixtures, failing tests, before/after states, or code designed around a later security review.
```

### Freeze rule

The Replit result is not yet a V2 baseline merely because the app exists. It becomes the V2 baseline only after the generated source can be exported/frozen without manual source edits and the export is recorded immutably.

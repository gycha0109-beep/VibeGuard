# VibeGuard

Synthetic portfolio project for **AI-generated application security hardening + stabilization**.

> Current repository state: **baseline-ai-generated**. It is intentionally not production-ready.

VibeGuard models the handoff of a quickly AI-assisted Next.js + Supabase MVP and preserves evidence for the sequence:

`baseline → audit → RLS/auth hardening → integrity remediation → analytics → browser/performance stabilization → regression → re-audit → release gate`

## Why this exists
The project is based on generalized requirements from a real outsourcing brief for hardening an AI-coded image participation/voting service. No client source code, credentials or data are used.

## Baseline findings intentionally present
- permissive RLS with cross-user exposure
- client-supplied admin role trust
- public-prefixed synthetic service-role configuration smell (no real secret)
- missing database unique invariant for votes
- retry/concurrency duplication risk
- weak event authorization and PII-prone logging
- raw image loading and repeated client work

See `docs/00-acceptance-criteria.md`, `docs/01-baseline-audit.md`, and `docs/03-rls-access-matrix.md`.

## Evidence policy
A security or browser claim is only marked PASS when an executable check has produced evidence. Engine emulation is explicitly separated from physical-device verification. Live Supabase verification is separately tracked from local/synthetic checks.

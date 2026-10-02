# V2 Evidence Contract

Each portfolio-visible V2 finding must contain all six evidence blocks.

## 1. Intake state

What existed in the independently generated application before VibeGuard touched it.

Required:
- frozen baseline commit/tag;
- affected route/API/DB object;
- relevant generated implementation reference.

## 2. Reproduction

A repeatable scenario showing the defect.

Required:
- actor/precondition;
- action/request;
- expected behavior;
- actual baseline behavior;
- machine-readable or screenshot/log evidence when available.

## 3. Root cause

The exact authorization, data-integrity, storage, analytics, runtime, or browser boundary that caused the result.

## 4. Change

The smallest remediation that addresses the demonstrated cause.

Required:
- source or migration diff;
- reason the change addresses the finding;
- any compatibility impact.

## 5. Re-test

Run the same reproduction against the remediated state.

Required:
- original test identity preserved;
- post-fix result;
- no substitution with a weaker scenario.

## 6. Claim boundary

State what the evidence does and does not prove.

Examples:
- automated WebKit is not physical iPhone Safari;
- local Supabase does not prove hosted production configuration;
- a concurrency fixture proves the tested invariant, not universal load capacity.

## Portfolio rule

Porthub must render evidence in this order:

`Finding → Reproduction → Root cause → Change → Re-test`

Summary scores may appear only as derived secondary metadata, never as primary evidence.

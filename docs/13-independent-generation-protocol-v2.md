# Independent Baseline Generation Protocol V2

## Goal

Produce a baseline whose provenance is materially independent from the later VibeGuard audit.

## Isolation

Generation runs on `baseline-v2-generation`, which starts from the repository's initial bootstrap commit, not from `main`, `baseline-ai-generated`, or `hardened-release`.

The generation model receives:

1. `provenance/client-brief.md`
2. `provenance/generation-prompt.md`

It does **not** receive:

- V1 findings;
- hardened migrations;
- security contract tests;
- V2 audit checklist;
- remediation code;
- Porthub copy.

## Generator

The GitHub Actions workflow calls GitHub Models using its repository-scoped `GITHUB_TOKEN` and `models: read` permission.

The generated code is returned as a file bundle. The workflow:

1. validates the file paths;
2. writes the generated files;
3. records raw model output and generation metadata;
4. installs dependencies;
5. requires a successful production build;
6. commits the untouched generated application plus generated lockfile;
7. creates the immutable tag `baseline-v2-generated`.

No human code edits are permitted between model output and the frozen baseline tag.

## Acceptance gate

A candidate is accepted only if:

- model response is parseable;
- required Next.js/package/README/migration files exist;
- `npm install` succeeds;
- `npm run build` succeeds;
- provenance files record model, prompt hash, source commit, workflow run and generated file list.

This gate is **functional only**. It must not test RLS quality, authorization, duplicate voting, event integrity, or other future audit findings.

## Audit handoff

Only after `baseline-v2-generated` exists may V2 audit work begin.

Audit output must distinguish:

- observed finding;
- reproduction;
- root cause;
- remediation;
- re-test.

No finding may be copied from V1 without being independently reproduced against the V2 tag.

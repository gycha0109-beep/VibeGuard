# Baseline evidence

The canonical baseline is the Git ref `baseline-ai-generated`.

- `test-definitions/` contains snapshots of intentionally failing acceptance tests from that ref.
- `../security/source-contract-before-after.json` records baseline 0/7 -> hardened 7/7 at source/migration-contract level.
- Intentionally failing baseline tests are not executed from the hardened `tests/` tree.

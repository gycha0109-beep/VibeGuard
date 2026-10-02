# Performance Before / After

## Source-level changes already made
| Area | Baseline | Hardened |
|---|---|---|
| image loading | raw remote `<img>` | `next/image`, explicit dimensions, responsive `sizes` |
| list state | effect-driven seed copy and manual refresh work | immutable memoized seed for the synthetic path |
| repeated event work | list effect emitted event on refresh | event tracking moved to explicit interaction flow |
| vote interaction | unlimited repeat clicks | UI pending/done guard plus DB-level idempotency target |

## Measurement gate
No browser performance number is reported until measured from built artifacts/browser traces.

Required final measurements:
- production build route/bundle output,
- content-page navigation timing,
- image transfer/decoded size where obtainable,
- browser console error count,
- screenshot/trace artifacts for the supported Playwright projects.

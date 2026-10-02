# Performance Before / After

## Deterministic source-level evidence

The CI compares `baseline-ai-generated:app/contents/page.tsx` to current main using `scripts/performance-before-after.mjs`.

| Metric | Baseline | Hardened |
|---|---:|---:|
| raw `<img>` tags | 1 | 0 |
| direct Unsplash remote URLs in content page | 3 | 0 |
| `next/image` imports | 0 | 1 |
| content-page `useEffect` calls | 1 | 0 |
| content-page explicit `fetch()` calls | 1 | 0 |

These are source metrics, not invented latency numbers.

## Runtime browser evidence

`tests/e2e/performance.spec.ts` runs against the **production Next.js build** and attaches per-browser JSON containing:
- DOMContentLoaded/load timing as observed by that CI browser,
- resource count,
- browser-reported transfer bytes,
- image resource count,
- cross-origin resource count,
- CLS when the engine exposes Layout Shift entries.

The gate asserts zero external resource dependencies on the content route; Desktop Chromium also enforces CLS < 0.1 when the metric is available.

CI timings are environment-specific and are preserved as evidence rather than advertised as universal production performance.

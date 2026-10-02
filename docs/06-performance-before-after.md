# Performance Before / After

## Deterministic source evidence

`scripts/performance-before-after.mjs` compares the preserved `baseline-ai-generated` content page against current main.

| Metric | Baseline | Hardened |
|---|---:|---:|
| raw `<img>` tags | 1 | 0 |
| direct Unsplash URLs | 3 | 0 |
| `next/image` imports | 0 | 1 |
| content-page `useEffect` calls | 1 | 0 |
| content-page explicit `fetch()` calls | 2 | 1 |

The remaining content-page fetch is the user-triggered vote request; observational analytics moved to a small dedicated client module instead of a list-refresh effect.

## Runtime browser evidence

GitHub Actions run #19 measured the production build in CI:

| Browser project | DOMContentLoaded | Load event | Reported transfer | External resources | CLS |
|---|---:|---:|---:|---:|---:|
| Desktop Chromium | 80 ms | 229 ms | 231,807 B | 0 | 0 |
| WebKit engine | 232 ms | 233 ms | 147,917 B | 0 | 0 |
| Android Chromium emulation | 86 ms | 156 ms | 230,878 B | 0 | 0 |

These numbers are evidence from one GitHub-hosted CI run, not universal latency claims. The release gate enforces zero external resources on the content route and CLS < 0.1 on Desktop Chromium when Layout Shift entries are available.

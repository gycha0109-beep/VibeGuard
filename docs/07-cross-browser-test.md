# Cross-Browser Verification

Configured Playwright projects:
- `desktop-chromium`: Desktop Chrome profile.
- `webkit-engine`: Desktop Safari device profile on Playwright WebKit.
- `android-chromium-emulation`: Pixel 7 profile on Chromium.

Claim boundary:
- A WebKit automation pass is **not** labeled “real iPhone Safari PASS”.
- Pixel/Chromium emulation is **not** labeled “physical Android Chrome PASS”.
- Physical-device testing remains an explicit production gap unless separately performed and evidenced.

Current status: configuration is wired into GitHub Actions; CI execution evidence determines PASS/FAIL.

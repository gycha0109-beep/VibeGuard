import { test, expect } from "@playwright/test";

test("PERF production content route emits inspectable runtime metrics", async ({ page }, testInfo) => {
  await page.addInitScript(() => {
    const state = { cls: 0 };
    Object.defineProperty(window, "__vibeguardPerf", { value: state, configurable: true });
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const shift = entry as PerformanceEntry & { value?: number; hadRecentInput?: boolean };
          if (!shift.hadRecentInput && typeof shift.value === "number") state.cls += shift.value;
        }
      });
      observer.observe({ type: "layout-shift", buffered: true });
    } catch {
      // Layout Shift entries are not implemented consistently across all engines.
    }
  });

  await page.goto("/contents", { waitUntil: "networkidle" });
  await expect(page.locator("img")).toHaveCount(3);

  const metrics = await page.evaluate(() => {
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
    const origin = location.origin;
    const externalResources = resources.filter((entry) => {
      try { return new URL(entry.name).origin !== origin; } catch { return false; }
    });
    const imageResources = resources.filter((entry) => entry.initiatorType === "img");
    const state = (window as unknown as { __vibeguardPerf?: { cls: number } }).__vibeguardPerf;
    return {
      project: "runtime",
      domContentLoadedMs: nav ? Math.round(nav.domContentLoadedEventEnd) : null,
      loadEventMs: nav ? Math.round(nav.loadEventEnd) : null,
      resourceCount: resources.length,
      imageResourceCount: imageResources.length,
      externalResourceCount: externalResources.length,
      transferBytesReported: Math.round(resources.reduce((sum, entry) => sum + (entry.transferSize || 0), 0)),
      cls: state?.cls ?? null
    };
  });

  await testInfo.attach("performance-current.json", {
    body: Buffer.from(JSON.stringify({ browser_project: testInfo.project.name, ...metrics }, null, 2)),
    contentType: "application/json"
  });

  expect(metrics.externalResourceCount).toBe(0);
  if (testInfo.project.name === "desktop-chromium" && metrics.cls !== null) {
    expect(metrics.cls).toBeLessThan(0.1);
  }
});

import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  reporter: [["html", { open: "never" }], ["list"]],
  use: { baseURL: "http://127.0.0.1:3000", trace: "retain-on-failure", screenshot: "only-on-failure" },
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: true,
    env: { ...process.env, VIBEGUARD_SYNTHETIC_MODE: "true" }
  },
  projects: [
    { name: "desktop-chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "webkit-engine", use: { ...devices["Desktop Safari"] } },
    { name: "android-chromium-emulation", use: { ...devices["Pixel 7"] } }
  ]
});

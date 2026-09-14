import { defineConfig, devices } from "@playwright/test";

/*
 * End-to-end tests against a running bovas-api. Locally, start the API (composer serve) and the
 * web app (npm run dev), then run npm run test:e2e: the demo depot is reset first, so every run
 * starts from the same data. Against staging, set E2E_BASE_URL and reset staging's demo depot
 * there (see bovas-api/DEPLOY.md), with E2E_SKIP_RESET=1.
 */

const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  // Every test shares one demo database and moves real tickets along, so they run one at a time
  // and never retry: a second attempt would start from changed data.
  workers: 1,
  fullyParallel: false,
  retries: 0,
  forbidOnly: Boolean(process.env.CI),
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: "npm run start",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});

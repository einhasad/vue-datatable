import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright E2E Test Configuration
 *
 * Tests verify that examples work in real browsers.
 * This ensures Living Documentation is not just tested in unit tests,
 * but also works end-to-end for users.
 *
 * Reference: https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',

  // Maximum time one test can run
  timeout: 30 * 1000,

  // Default timeout for all expect() assertions and locators
  expect: {
    timeout: 1000, // 1 second default for all assertions
  },

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use
  reporter: process.env.CI ? 'github' : 'html',

  use: {
    // Base URL for navigation
    baseURL: 'http://localhost:3000/vue-datatable',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',
  },

  // Configure projects for major browsers
  // Note: Only Chromium is enabled due to environment restrictions
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Run servers before starting the tests
  // Array allows explicit control over each server
  webServer: [
    {
      // Mock API server - health check ensures it's running
      command: 'node mock-server/server.js',
      url: 'http://localhost:3001/api/github/health',
      reuseExistingServer: !process.env.CI,
      timeout: 60 * 1000,
      stdout: 'inherit',
      stderr: 'inherit',
    },
    {
      // Build library and start Nuxt dev server
      command: 'cd .. && npm run build && cd examples && npm run dev',
      url: 'http://localhost:3000/vue-datatable/',
      reuseExistingServer: !process.env.CI,
      timeout: 180 * 1000,
      stdout: 'inherit',
      stderr: 'inherit',
    },
  ],
})

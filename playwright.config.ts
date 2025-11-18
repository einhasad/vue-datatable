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

    // Disabled: Firefox and Webkit require browser downloads that may not be available
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  // Run servers before starting the tests
  // Array allows explicit control over each server
  webServer: [
    {
      // Mock GitHub API server
      command: 'node mock-server/server.js',
      port: 3001,
      reuseExistingServer: !process.env.CI,
      timeout: 30 * 1000,
      stdout: 'inherit',
      stderr: 'inherit',
    },
    {
      // Build library and start examples dev server
      command: 'npm run build && cd examples && npm run dev',
      url: 'http://localhost:3000/vue-datatable/',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
      stdout: 'inherit',
      stderr: 'inherit',
    },
  ],
})

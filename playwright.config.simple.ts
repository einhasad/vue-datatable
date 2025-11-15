import { defineConfig, devices } from '@playwright/test'

/**
 * Simplified Playwright config for manual dev server testing and CI
 * Optimized for speed: Chromium only, no retries, fail fast
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 30 * 1000,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: process.env.CI ? [['list'], ['github']] : 'list',

  use: {
    baseURL: 'http://localhost:3000/vue-datatable',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
    headless: true,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})

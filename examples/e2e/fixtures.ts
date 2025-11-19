/**
 * Playwright Test Fixtures
 *
 * Custom fixtures for debugging and enhanced logging
 */

import { test as base, Page } from '@playwright/test'

type CustomFixtures = {
  pageWithLogs: Page
}

/**
 * Extended test with custom fixtures
 */
export const test = base.extend<CustomFixtures>({
  pageWithLogs: async ({ page }, use) => {
    // Capture console logs from the browser
    page.on('console', msg => {
      const type = msg.type()
      const text = msg.text()

      // Only log our custom logs to avoid spam
      if (
        text.includes('[Mock GitHub API]') ||
        text.includes('[GitHub HTTP Client]') ||
        text.includes('[GitHub Provider]') ||
        text.includes('[App.vue]')
      ) {
        const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : '📝'
        console.log(`${prefix} [Browser Console ${type}] ${text}`)
      }
    })

    // Capture page errors
    page.on('pageerror', error => {
      console.error('❌ [Browser Page Error]', error.message)
      console.error(error.stack)
    })

    // Log network requests to localhost:3001
    page.on('request', request => {
      const url = request.url()
      if (url.includes('localhost:3001') || url.includes(':3001')) {
        console.log(`🌐 [Network Request] ${request.method()} ${url}`)
      }
    })

    // Log network responses from localhost:3001
    page.on('response', async response => {
      const url = response.url()
      if (url.includes('localhost:3001') || url.includes(':3001')) {
        const status = response.status()
        const statusEmoji = status >= 200 && status < 300 ? '✅' : '❌'
        console.log(`${statusEmoji} [Network Response] ${status} ${url}`)

        // Log response body for API calls
        if (url.includes('/api/github/')) {
          try {
            const body = await response.json()
            if (url.includes('/search/repositories')) {
              console.log(`   └─ Response: ${body.total_count} results, ${body.items?.length || 0} items`)
            } else {
              console.log(`   └─ Response:`, body)
            }
          } catch (e) {
            // Not JSON or already consumed
          }
        }
      }
    })

    // Log failed network requests
    page.on('requestfailed', request => {
      const url = request.url()
      if (url.includes('localhost:3001') || url.includes(':3001')) {
        console.error(`❌ [Network Request Failed] ${request.method()} ${url}`)
        console.error(`   └─ Failure: ${request.failure()?.errorText}`)
      }
    })

    await use(page)
  },
})

export { expect } from '@playwright/test'

/**
 * Smoke Test - Verify Mock API Integration
 *
 * This test checks that the mock API is working and the app can connect to it.
 * Run this first to diagnose connection issues.
 */

import { test, expect } from './fixtures'

test.describe('Smoke Test - Mock API', () => {
  test('should verify mock API is accessible from browser', async ({ pageWithLogs }) => {
    console.log('\n' + '='.repeat(80))
    console.log('[Smoke Test] Verifying mock API accessibility...')
    console.log('='.repeat(80))

    // Navigate to the app
    console.log('[Smoke Test] Navigating to app...')
    await pageWithLogs.goto('/')

    // Wait for app to load
    await pageWithLogs.waitForLoadState('networkidle')

    console.log('[Smoke Test] Checking if page loaded...')
    await expect(pageWithLogs.locator('h1')).toContainText('Grid Vue')

    // Try to fetch the mock API health endpoint from the browser
    console.log('[Smoke Test] Testing mock API health endpoint from browser context...')
    const healthResponse = await pageWithLogs.evaluate(async () => {
      try {
        const response = await fetch('http://localhost:3001/api/github/health')
        return {
          ok: response.ok,
          status: response.status,
          data: await response.json()
        }
      } catch (error: any) {
        return {
          ok: false,
          error: error.message
        }
      }
    })

    console.log('[Smoke Test] Health check result:', healthResponse)

    if (!healthResponse.ok) {
      console.error('❌ [Smoke Test] FAILED: Cannot reach mock API from browser!')
      console.error('   This means the browser cannot connect to localhost:3001')
      console.error('   Possible reasons:')
      console.error('   1. Mock server is not running')
      console.error('   2. CORS is blocking the request')
      console.error('   3. Browser security is blocking localhost connections')
    } else {
      console.log('✅ [Smoke Test] SUCCESS: Mock API is accessible from browser')
      console.log(`   └─ Status: ${healthResponse.status}`)
      console.log(`   └─ Data:`, healthResponse.data)
    }

    expect(healthResponse.ok).toBe(true)

    // Navigate to HTTP Provider example
    console.log('[Smoke Test] Navigating to HTTP Provider example...')
    await pageWithLogs.goto('/examples/http-provider')

    // Wait a bit for any network requests
    await pageWithLogs.waitForTimeout(3000)

    console.log('[Smoke Test] Environment variables are logged in browser console above')
    console.log('[Smoke Test] Look for "Environment variables:" in the logs')

    // Check if the HTTP provider section loaded
    const httpProviderSection = pageWithLogs.locator('#http-provider')
    await expect(httpProviderSection).toBeVisible()

    console.log('='.repeat(80))
    console.log('[Smoke Test] Complete!')
    console.log('='.repeat(80) + '\n')
  })

  test('should verify mock API can return search results', async ({ pageWithLogs }) => {
    console.log('\n' + '='.repeat(80))
    console.log('[Smoke Test] Testing search endpoint...')
    console.log('='.repeat(80))

    await pageWithLogs.goto('/')

    // Test the search endpoint from browser context
    console.log('[Smoke Test] Fetching search results from browser...')
    const searchResponse = await pageWithLogs.evaluate(async () => {
      try {
        const url = 'http://localhost:3001/api/github/search/repositories?q=vue&sort=stars&order=desc&page=1&per_page=5'
        console.log('[Browser] Fetching:', url)
        const response = await fetch(url)
        const data = await response.json()
        return {
          ok: response.ok,
          status: response.status,
          data: data
        }
      } catch (error: any) {
        console.error('[Browser] Fetch error:', error)
        return {
          ok: false,
          error: error.message
        }
      }
    })

    console.log('[Smoke Test] Search result:', {
      ok: searchResponse.ok,
      status: searchResponse.status,
      total_count: searchResponse.data?.total_count,
      items_count: searchResponse.data?.items?.length
    })

    expect(searchResponse.ok).toBe(true)
    expect(searchResponse.data.total_count).toBeGreaterThan(0)
    expect(searchResponse.data.items).toBeDefined()
    expect(searchResponse.data.items.length).toBeGreaterThan(0)

    console.log('✅ [Smoke Test] Search endpoint is working correctly')
    console.log('='.repeat(80) + '\n')
  })
})

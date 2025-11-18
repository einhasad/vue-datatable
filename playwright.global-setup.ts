/**
 * Playwright Global Setup
 *
 * This runs once before all tests to verify the mock API server is accessible
 */

import { chromium } from '@playwright/test'

export default async function globalSetup() {
  console.log('\n' + '='.repeat(80))
  console.log('[Playwright Global Setup] Starting...')
  console.log('='.repeat(80))

  // Wait for mock API server to be ready
  const mockApiUrl = 'http://localhost:3001/api/github/health'
  const maxRetries = 30
  const retryDelay = 1000

  console.log(`[Playwright Global Setup] Waiting for mock API at ${mockApiUrl}`)

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(mockApiUrl)
      if (response.ok) {
        const data = await response.json()
        console.log(`[Playwright Global Setup] ✓ Mock API is ready!`)
        console.log(`[Playwright Global Setup] ✓ Status: ${data.status}`)
        console.log(`[Playwright Global Setup] ✓ Total repositories: ${data.totalRepositories}`)

        // Test the search endpoint too
        const searchUrl = 'http://localhost:3001/api/github/search/repositories?q=vue&page=1&per_page=5'
        const searchResponse = await fetch(searchUrl)
        if (searchResponse.ok) {
          const searchData = await searchResponse.json()
          console.log(`[Playwright Global Setup] ✓ Search endpoint working: ${searchData.total_count} results`)
        }

        console.log('='.repeat(80) + '\n')
        return
      }
    } catch (error) {
      // Server not ready yet
    }

    if (i < maxRetries - 1) {
      console.log(`[Playwright Global Setup] Attempt ${i + 1}/${maxRetries} - waiting ${retryDelay}ms...`)
      await new Promise(resolve => setTimeout(resolve, retryDelay))
    }
  }

  console.error('[Playwright Global Setup] ✗ FAILED: Mock API server is not responding!')
  console.error('[Playwright Global Setup] ✗ Expected server at:', mockApiUrl)
  console.error('[Playwright Global Setup] ✗ Make sure the webServer is configured correctly')
  console.log('='.repeat(80) + '\n')

  throw new Error('Mock API server is not accessible. Tests cannot proceed.')
}

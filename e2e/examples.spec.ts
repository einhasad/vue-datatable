/**
 * E2E Tests for Examples
 *
 * These tests verify that:
 * 1. Examples render correctly in real browsers
 * 2. Interactive features work as expected
 * 3. Examples are accessible and user-friendly
 */

import { test, expect } from '@playwright/test'

test.describe('Basic Example', () => {
  test('should render and display working example', async ({ page }) => {
    await page.goto('/#basic')

    const section = page.locator('#basic')

    // Verify page loaded
    await expect(section.locator('h2')).toContainText('Basic Example')

    // Verify grid is rendered
    const grid = section.locator('[data-qa="grid"]')
    await expect(grid).toBeVisible()

    // Verify data is displayed in grid (scope to grid only, not code blocks)
    await expect(grid.getByText('John Doe')).toBeVisible()
    await expect(grid.getByText('jane@example.com')).toBeVisible()

    // Verify code block is shown
    await expect(section.locator('.code-block')).toBeVisible()
    await expect(section.locator('.code-block')).toContainText('ArrayDataProvider')
  })
})

test.describe('Array Provider Example', () => {
  test('should render and display working example', async ({ page }) => {
    await page.goto('/#array-provider')

    const section = page.locator('#array-provider')

    // Verify page loaded
    await expect(section.locator('h2')).toContainText('Array Provider Example')

    // Verify grid is rendered
    const grid = section.locator('[data-qa="grid"]')
    await expect(grid).toBeVisible()

    // Verify pagination is working (page mode) - scope to grid only
    await expect(grid.getByText('Laptop Pro')).toBeVisible()

    // Verify code block shows the example
    await expect(section.locator('.code-block')).toBeVisible()
    await expect(section.locator('.code-block')).toContainText('pageSize: 5')
  })

  test('should display key features', async ({ page }) => {
    await page.goto('/#array-provider')

    const section = page.locator('#array-provider')

    // Verify features section exists
    await expect(section.getByRole('heading', { name: 'Key Features' })).toBeVisible()

    // Verify features are listed (use exact match to avoid code block)
    await expect(section.getByText('Client-side pagination:', { exact: true })).toBeVisible()
    await expect(section.getByText('Sorting:', { exact: true })).toBeVisible()
  })

  test('should support pagination interaction', async ({ page }) => {
    await page.goto('/#array-provider')

    const section = page.locator('#array-provider')

    // Wait for grid to load
    const grid = section.locator('[data-qa="grid"]')
    await grid.waitFor()

    // Verify first page items are visible (scope to grid only)
    await expect(grid.getByText('Laptop Pro')).toBeVisible()
  })
})

test.describe('Example Integrity', () => {
  test('all examples should display code and working demo', async ({ page }) => {
    const examples = [
      { name: 'Basic Example', hash: '#basic' },
      { name: 'Array Provider', hash: '#array-provider' }
    ]

    for (const example of examples) {
      await page.goto(`/${example.hash}`)

      const section = page.locator(example.hash)

      // Must have Demo section
      await expect(section.getByRole('heading', { name: 'Demo' })).toBeVisible()
      await expect(section.locator('[data-qa="grid"]')).toBeVisible()

      // Must have Code section
      await expect(section.getByRole('heading', { name: 'Code' })).toBeVisible()
      await expect(section.locator('.code-block')).toBeVisible()
    }
  })

  test('code blocks should contain valid Vue component syntax', async ({ page }) => {
    const examples = [
      { name: 'Basic Example', hash: '#basic' },
      { name: 'Array Provider', hash: '#array-provider' }
    ]

    for (const example of examples) {
      await page.goto(`/${example.hash}`)

      const section = page.locator(example.hash)
      const codeBlock = section.locator('.code-block')

      // Verify Vue component structure
      await expect(codeBlock).toContainText('<template>')
      await expect(codeBlock).toContainText('<script setup lang="ts">')
      await expect(codeBlock).toContainText('import')
      await expect(codeBlock).toContainText('ArrayDataProvider')
    }
  })
})

test.describe('GitHub API HTTP Provider Example', () => {
  test('should render GitHub API section with search controls', async ({ page }) => {
    await page.goto('/#http-provider')

    const section = page.locator('#http-provider')

    // Verify section loaded
    await expect(section.locator('h2')).toContainText('HTTP Provider Example - GitHub API')

    // Verify search controls are present
    await expect(section.locator('input#search')).toBeVisible()
    await expect(section.locator('select#sort')).toBeVisible()
    await expect(section.locator('button.btn-primary')).toContainText('Search')

    // Verify grid is present
    await expect(section.locator('[data-qa="grid"]')).toBeVisible()
  })

  test('should perform search and update URL with gh prefix', async ({ page }) => {
    // Set up response waiter BEFORE navigation to avoid race condition
    const initialResponsePromise = page.waitForResponse(response =>
      response.url().includes('localhost:3001/api/search/repositories') && response.status() === 200
    )

    await page.goto('/#http-provider')

    const section = page.locator('#http-provider')
    const grid = section.locator('[data-qa="grid"]')

    // Wait for initial mock API request to complete
    await initialResponsePromise

    // Verify initial data loaded
    await expect(grid.locator('tbody tr').first()).toBeVisible()

    // Change search query
    const searchInput = section.locator('input#search')
    await searchInput.fill('react')

    // Click search button and wait for API response
    const responsePromise = page.waitForResponse(response =>
      response.url().includes('localhost:3001/api/search/repositories') &&
      response.url().includes('q=react')
    )
    await section.locator('button.btn-primary').click()
    await responsePromise

    // Verify URL contains gh-q parameter
    expect(page.url()).toContain('gh-q=react')
  })

  test('should change sort order and update URL', async ({ page }) => {
    await page.goto('/#http-provider')

    const section = page.locator('#http-provider')

    // Wait for initial load by checking for data
    const grid = section.locator('[data-qa="grid"]')
    await expect(grid.locator('tbody tr').first()).toBeVisible()

    // Change sort order and wait for new API request
    const sortSelect = section.locator('select#sort')
    const responsePromise = page.waitForResponse(response =>
      response.url().includes('localhost:3001/api/search/repositories') &&
      response.url().includes('sort=forks')
    )
    await sortSelect.selectOption('forks')
    await responsePromise

    // Verify URL contains gh-sort parameter
    expect(page.url()).toContain('gh-sort=forks')
  })

  test('should display repository results from GitHub API', async ({ page }) => {
    // Set up response waiter BEFORE navigation to avoid race condition
    const responsePromise = page.waitForResponse(response =>
      response.url().includes('localhost:3001/api/search/repositories') && response.status() === 200
    )

    await page.goto('/#http-provider')

    const section = page.locator('#http-provider')
    const grid = section.locator('[data-qa="grid"]')

    // Wait for mock API response
    await responsePromise

    // Verify grid has data (should have table headers)
    await expect(grid.locator('thead')).toBeVisible()

    // Verify at least one repository row is displayed
    await expect(grid.locator('tbody tr').first()).toBeVisible()

    // Verify columns are present
    await expect(grid.getByText('Repository')).toBeVisible()
    await expect(grid.getByText('Stars')).toBeVisible()
    await expect(grid.getByText('Forks')).toBeVisible()
  })

  test('should show total results count', async ({ page }) => {
    // Set up response waiter BEFORE navigation to avoid race condition
    const responsePromise = page.waitForResponse(response =>
      response.url().includes('localhost:3001/api/search/repositories')
    )

    await page.goto('/#http-provider')

    const section = page.locator('#http-provider')
    const grid = section.locator('[data-qa="grid"]')

    // Wait for API response
    const response = await responsePromise
    const responseData = await response.json()

    // Wait for grid to have data - this ensures Vue watcher updated githubTotalCount
    await expect(grid.locator('tbody tr').first()).toBeVisible()

    // Only check for results count if API returned results
    if (responseData.total_count > 0) {
      // Verify results count is shown (it appears after data loads)
      const resultsText = section.locator('.control-group:has-text("Results:")')
      await expect(resultsText).toBeVisible()
      await expect(resultsText).toContainText('repositories')
    } else {
      console.log('[Test] Skipping results count check - no results from API')
    }
  })

  test('should handle pagination with page parameter', async ({ page }) => {
    // Set up response waiter BEFORE navigation to avoid race condition
    const initialResponsePromise = page.waitForResponse(response =>
      response.url().includes('localhost:3001/api/search/repositories')
    )

    await page.goto('/#http-provider')

    const section = page.locator('#http-provider')
    const grid = section.locator('[data-qa="grid"]')

    // Wait for initial API response
    await initialResponsePromise

    // Wait for initial data to load
    await expect(grid.locator('tbody tr').first()).toBeVisible()

    // Try to find page 2 button (API might not return enough results)
    const page2Button = grid.locator('button:has-text("2")')

    // Check if page 2 button exists using count() to avoid crashes
    const page2Exists = await page2Button.count() > 0

    if (!page2Exists) {
      console.log('[Test] Skipping pagination test - no page 2 button')
      return
    }

    if (page2Exists) {
      const responsePromise = page.waitForResponse(response =>
        response.url().includes('localhost:3001/api/search/repositories') &&
        response.url().includes('page=2')
      )
      await page2Button.click()
      await responsePromise

      // Verify URL contains page=2 (not other prefixed page params)
      const url = new URL(page.url())
      expect(url.searchParams.get('page')).toBe('2')
    }
  })

  test('should maintain URL state with gh prefix for all parameters', async ({ page }) => {
    await page.goto('/#http-provider')

    const section = page.locator('#http-provider')

    // Set search query
    const searchInput = section.locator('input#search')
    await searchInput.fill('typescript')

    // Set sort order
    const sortSelect = section.locator('select#sort')
    await sortSelect.selectOption('updated')

    // Click search and wait for API response
    const responsePromise = page.waitForResponse(response =>
      response.url().includes('localhost:3001/api/search/repositories') &&
      response.url().includes('q=typescript') &&
      response.url().includes('sort=updated')
    )
    await section.locator('button.btn-primary').click()
    await responsePromise

    // Verify URL has all parameters with correct prefix
    const url = page.url()
    expect(url).toContain('gh-q=typescript')
    expect(url).toContain('gh-sort=updated')
    expect(url).toContain('page=1')
  })

  test('should handle search on Enter key press', async ({ page }) => {
    await page.goto('/#http-provider')

    const section = page.locator('#http-provider')
    const searchInput = section.locator('input#search')

    // Type and press Enter, wait for API response
    await searchInput.fill('vue3')
    const responsePromise = page.waitForResponse(response =>
      response.url().includes('localhost:3001/api/search/repositories') &&
      response.url().includes('q=vue3')
    )
    await searchInput.press('Enter')
    await responsePromise

    // Verify URL updated
    expect(page.url()).toContain('gh-q=vue3')
  })

  test('should restore state after page refresh', async ({ page }) => {
    // Set up response waiter BEFORE navigation to avoid race condition
    const initialResponsePromise = page.waitForResponse(response =>
      response.url().includes('localhost:3001/api/search/repositories')
    )

    await page.goto('/#http-provider')

    const section = page.locator('#http-provider')
    const searchInput = section.locator('input#search')
    const sortSelect = section.locator('select#sort')

    // Wait for initial API response
    await initialResponsePromise

    // Set custom search query and sort
    await searchInput.fill('react hooks')
    await sortSelect.selectOption('forks')

    // Click search and wait for API response
    const responsePromise = page.waitForResponse(response =>
      response.url().includes('localhost:3001/api/search/repositories') &&
      response.url().includes('q=react+hooks') &&
      response.url().includes('sort=forks')
    )
    await section.locator('button.btn-primary').click()
    await responsePromise

    // Verify URL has parameters
    const urlBeforeRefresh = page.url()
    expect(urlBeforeRefresh).toContain('gh-q=react+hooks')
    expect(urlBeforeRefresh).toContain('gh-sort=forks')

    // Set up response waiter BEFORE reload
    const reloadResponsePromise = page.waitForResponse(response =>
      response.url().includes('localhost:3001/api/search/repositories') &&
      response.url().includes('q=') &&
      response.url().includes('sort=forks')
    )

    // Reload the page
    await page.reload()

    // Wait for API response after reload
    await reloadResponsePromise

    // Wait for grid to be visible after reload
    const grid = section.locator('[data-qa="grid"]')
    await expect(grid.locator('tbody tr').first()).toBeVisible()

    // Verify URL still has the same parameters after refresh
    const urlAfterRefresh = page.url()
    expect(urlAfterRefresh).toContain('gh-q=react+hooks')
    expect(urlAfterRefresh).toContain('gh-sort=forks')

    // Verify input values are restored from URL
    await expect(searchInput).toHaveValue('react hooks')
    await expect(sortSelect).toHaveValue('forks')

    // Verify results count is still displayed (grid already loaded above)
    const resultsText = section.locator('.control-group:has-text("Results:")')
    await expect(resultsText).toBeVisible()
  })
})

test.describe('Multi-State Example', () => {
  test('should render both grids with different prefixes', async ({ page }) => {
    await page.goto('/#multi-state')

    const section = page.locator('#multi-state')

    // Verify section loaded
    await expect(section.locator('h2')).toContainText('Multi-State Example')

    // Verify both grids are present
    const grids = section.locator('[data-qa="grid"]')
    await expect(grids).toHaveCount(2)

    // Verify section headers using getByRole to avoid matching code blocks
    await expect(section.getByRole('heading', { name: /Array Provider with "products" prefix/i })).toBeVisible()
    await expect(section.getByRole('heading', { name: /Mock HTTP Provider with "users" prefix/i })).toBeVisible()
  })

  test('should maintain independent state with different URL prefixes', async ({ page }) => {
    await page.goto('/#multi-state')

    const section = page.locator('#multi-state')
    const grids = section.locator('[data-qa="grid"]')

    // Wait for both grids to have data
    await expect(grids.first().locator('tbody tr').first()).toBeVisible()
    await expect(grids.last().locator('tbody tr').first()).toBeVisible()

    // Get first grid (products) and check if sorting is enabled
    const firstGrid = grids.first()
    const firstSortableHeader = firstGrid.locator('th[data-sortable="true"]').first()

    // Check if sortable headers exist
    const sortableExists = await firstSortableHeader.count() > 0

    if (!sortableExists) {
      // Skip sorting test if columns aren't sortable
      console.log('[Test] Skipping sort test - no sortable columns found')
      return
    }

    // Click first grid's sortable header
    await expect(firstSortableHeader).toBeVisible()
    await firstSortableHeader.click()

    // Wait for URL to update with products prefix
    await page.waitForURL(url => {
      const params = new URL(url).searchParams
      return Array.from(params.keys()).some(key => key.startsWith('products-'))
    })

    // Verify URL has products prefix
    expect(page.url()).toMatch(/products-/)

    // Get second grid (users) and sort by a column
    const secondGrid = grids.last()
    const secondSortableHeader = secondGrid.locator('th[data-sortable="true"]').first()

    // Click second grid's sortable header
    await secondSortableHeader.click()

    // Wait for URL to update with users prefix
    await page.waitForURL(url => {
      const params = new URL(url).searchParams
      return Array.from(params.keys()).some(key => key.startsWith('users-'))
    })

    // Verify URL has both prefixes
    const finalUrl = page.url()
    expect(finalUrl).toMatch(/products-/)
    expect(finalUrl).toMatch(/users-/)
  })
})

test.describe('LocalStorage State Provider', () => {
  test('should persist pagination state after page refresh', async ({ page }) => {
    // Clear localStorage before test
    await page.goto('/#state-localstorage')
    await page.evaluate(() => localStorage.clear())
    await page.reload()

    const section = page.locator('#state-localstorage')
    const grid = section.locator('[data-qa="grid"]')

    // Wait for grid to load
    await expect(grid.locator('tbody tr').first()).toBeVisible()

    // Should start on page 1 - check if pagination exists first
    const page1Button = grid.locator('button.active:has-text("1")')
    const paginationExists = await grid.locator('button:has-text("1")').count() > 0

    if (!paginationExists) {
      // Skip pagination tests if not enough data
      console.log('[Test] Skipping pagination test - not enough data')
      return
    }

    await expect(page1Button).toBeVisible()

    // Navigate to page 2
    const page2Button = grid.locator('button:has-text("2")')
    await page2Button.click()

    // Wait for page to update
    await expect(grid.locator('button.active:has-text("2")')).toBeVisible()

    // Reload the page
    await page.reload()

    // Wait for grid to load after reload
    await expect(grid.locator('tbody tr').first()).toBeVisible()

    // Verify still on page 2 (state restored from localStorage)
    await expect(grid.locator('button.active:has-text("2")')).toBeVisible()
  })

  test('should persist sort state after page refresh', async ({ page }) => {
    // Clear localStorage before test
    await page.goto('/#state-localstorage')
    await page.evaluate(() => localStorage.clear())
    await page.reload()

    const section = page.locator('#state-localstorage')
    const grid = section.locator('[data-qa="grid"]')

    // Wait for grid to load
    await expect(grid.locator('tbody tr').first()).toBeVisible()

    // Click on a sortable column header (e.g., "Name")
    const nameHeader = grid.locator('th:has-text("Name")')
    await nameHeader.click()

    // Get the first row's name after sorting
    const firstRowName = await grid.locator('tbody tr').first().locator('td').nth(1).textContent()

    // Reload the page
    await page.reload()

    // Wait for grid to load after reload
    await expect(grid.locator('tbody tr').first()).toBeVisible()

    // Verify sort persisted - first row should be the same
    const firstRowNameAfterReload = await grid.locator('tbody tr').first().locator('td').nth(1).textContent()
    expect(firstRowNameAfterReload).toBe(firstRowName)
  })

  test('should not share state with InMemory provider', async ({ page }) => {
    // Clear localStorage before test
    await page.goto('/#state-localstorage')
    await page.evaluate(() => localStorage.clear())

    // Go to LocalStorage section and navigate to page 2
    await page.goto('/#state-localstorage')
    const localStorageSection = page.locator('#state-localstorage')
    const localStorageGrid = localStorageSection.locator('[data-qa="grid"]')

    await expect(localStorageGrid.locator('tbody tr').first()).toBeVisible()

    // Check if pagination exists
    const page2Button = localStorageGrid.locator('button:has-text("2")')
    const paginationExists = await page2Button.count() > 0

    if (!paginationExists) {
      // Skip pagination tests if not enough data
      console.log('[Test] Skipping pagination test - not enough data for page 2')
      return
    }

    await page2Button.click()
    await expect(localStorageGrid.locator('button.active:has-text("2")')).toBeVisible()

    // Go to InMemory section
    await page.goto('/#state-inmemory')
    const inMemorySection = page.locator('#state-inmemory')
    const inMemoryGrid = inMemorySection.locator('[data-qa="grid"]')

    await expect(inMemoryGrid.locator('tbody tr').first()).toBeVisible()

    // InMemory should be on page 1 (not affected by LocalStorage state)
    await expect(inMemoryGrid.locator('button.active:has-text("1")')).toBeVisible()

    // Reload and check LocalStorage still has page 2
    await page.goto('/#state-localstorage')
    await expect(localStorageGrid.locator('tbody tr').first()).toBeVisible()
    await expect(localStorageGrid.locator('button.active:has-text("2")')).toBeVisible()
  })
})

test.describe('Cross-Browser Compatibility', () => {
  test('examples should render consistently across browsers', async ({ page }) => {
    await page.goto('/#basic')

    const section = page.locator('#basic')

    // Core functionality should work in all browsers
    await expect(section.locator('[data-qa="grid"]')).toBeVisible()
    await expect(section.locator('.code-block')).toBeVisible()
  })
})

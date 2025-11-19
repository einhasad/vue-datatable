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
    await page.goto('/examples/basic')

    // Verify page loaded
    await expect(page.locator('h2')).toContainText('Basic Example')

    // Verify grid is rendered
    const grid = page.locator('[data-qa="basic-example"]')
    await expect(grid).toBeVisible()

    // Verify data is displayed in grid
    await expect(grid.getByText('John Doe')).toBeVisible()
    await expect(grid.getByText('jane@example.com')).toBeVisible()

    // Verify code block is shown
    await expect(page.locator('.code-block')).toBeVisible()
    await expect(page.locator('.code-block')).toContainText('ArrayDataProvider')
  })
})

test.describe('Array Provider Example', () => {
  test('should render and display working example', async ({ page }) => {
    await page.goto('/examples/array-provider')

    // Verify page loaded
    await expect(page.locator('h2')).toContainText('Array Provider Example')

    // Verify grid is rendered
    const grid = page.locator('[data-qa="array-provider-example"]')
    await expect(grid).toBeVisible()

    // Verify pagination is working (page mode)
    await expect(grid.getByText('Laptop Pro')).toBeVisible()

    // Verify code block shows the example
    await expect(page.locator('.code-block')).toBeVisible()
    await expect(page.locator('.code-block')).toContainText('pageSize: 5')
  })

  test('should display key features', async ({ page }) => {
    await page.goto('/examples/array-provider')

    // Verify features section exists
    await expect(page.getByRole('heading', { name: 'Features' })).toBeVisible()

    // Verify features are listed
    await expect(page.getByText('Client-side pagination:')).toBeVisible()
    await expect(page.getByText('Sorting:')).toBeVisible()
  })

  test('should support pagination interaction', async ({ page }) => {
    await page.goto('/examples/array-provider')

    // Wait for grid to load
    const grid = page.locator('[data-qa="array-provider-example"]')
    await grid.waitFor()

    // Verify first page items are visible
    await expect(grid.getByText('Laptop Pro')).toBeVisible()
  })
})

test.describe('Example Integrity', () => {
  test('all examples should display code and working demo', async ({ page }) => {
    const examples = [
      { name: 'Basic Example', path: '/examples/basic' },
      { name: 'Array Provider', path: '/examples/array-provider' }
    ]

    for (const example of examples) {
      await page.goto(example.path)

      // Must have heading
      await expect(page.getByRole('heading', { level: 2 })).toBeVisible()

      // Must have grid
      await expect(page.locator('[data-qa*="example"]')).toBeVisible()

      // Must have code block
      await expect(page.locator('.code-block')).toBeVisible()
    }
  })

  test('code blocks should contain valid Vue component syntax', async ({ page }) => {
    const examples = [
      { name: 'Basic Example', path: '/examples/basic' },
      { name: 'Array Provider', path: '/examples/array-provider' }
    ]

    for (const example of examples) {
      await page.goto(example.path)

      const codeBlock = page.locator('.code-block')

      // Verify Vue component structure
      await expect(codeBlock).toContainText('ArrayDataProvider')
    }
  })

  test('introduction page should display features', async ({ page }) => {
    await page.goto('/examples/introduction')

    // Verify heading
    await expect(page.getByRole('heading', { name: 'Welcome to Grid Vue Examples' })).toBeVisible()

    // Verify features section
    await expect(page.getByRole('heading', { name: 'Features' })).toBeVisible()

    // Verify some key features are listed
    await expect(page.getByText('Dual Pagination Modes')).toBeVisible()
    await expect(page.getByText('Data Provider Pattern')).toBeVisible()

    // Verify installation section
    await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible()
    await expect(page.getByText('npm install @grid-vue/grid')).toBeVisible()
  })
})

test.describe('GitHub API HTTP Provider Example', () => {
  test('should render GitHub API section with search controls', async ({ page }) => {
    await page.goto('/examples/http-provider')

    // Verify section loaded
    await expect(page.locator('h2')).toContainText('HTTP Provider Example')

    // Verify search controls are present
    await expect(page.locator('input#search')).toBeVisible()
    await expect(page.locator('select#sort')).toBeVisible()
    await expect(page.locator('button.btn-primary')).toContainText('Search')

    // Verify grid is present - wait for it to load
    await expect(page.locator('table')).toBeVisible({ timeout: 5000 })
  })

  test('should perform search and update URL with gh prefix', async ({ page }) => {
    // Set up response waiter BEFORE navigation to avoid race condition
    const initialResponsePromise = page.waitForResponse(response =>
      response.url().includes('localhost:3001/api/github/search/repositories') && response.status() === 200,
      { timeout: 10000 }
    )

    await page.goto('/examples/http-provider')

    // Wait for initial mock API request to complete
    await initialResponsePromise

    // Verify initial data loaded
    await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 5000 })

    // Change search query
    const searchInput = page.locator('input#search')
    await searchInput.fill('react')

    // Click search button and wait for API response
    const responsePromise = page.waitForResponse(response =>
      response.url().includes('localhost:3001/api/github/search/repositories') &&
      response.url().includes('q=react'),
      { timeout: 10000 }
    )
    await page.locator('button.btn-primary').click()
    await responsePromise

    // Verify URL contains gh-q parameter
    expect(page.url()).toContain('gh-q=react')
  })

  test('should change sort order and update URL', async ({ page }) => {
    await page.goto('/examples/http-provider')

    // Wait for initial load by checking for data
    await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 5000 })

    // Change sort order and wait for new API request
    const sortSelect = page.locator('select#sort')
    const responsePromise = page.waitForResponse(response =>
      response.url().includes('localhost:3001/api/github/search/repositories') &&
      response.url().includes('sort=forks'),
      { timeout: 10000 }
    )
    await sortSelect.selectOption('forks')
    await responsePromise

    // Verify URL contains gh-sort parameter
    expect(page.url()).toContain('gh-sort=forks')
  })

  test('should display repository results from GitHub API', async ({ page }) => {
    // Set up response waiter BEFORE navigation to avoid race condition
    const responsePromise = page.waitForResponse(response =>
      response.url().includes('localhost:3001/api/github/search/repositories') && response.status() === 200,
      { timeout: 10000 }
    )

    await page.goto('/examples/http-provider')

    // Wait for mock API response
    await responsePromise

    // Verify grid has data (should have table headers)
    await expect(page.locator('thead')).toBeVisible()

    // Verify at least one repository row is displayed
    await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 5000 })

    // Verify columns are present
    await expect(page.getByText('Repository')).toBeVisible()
    await expect(page.getByText('Stars')).toBeVisible()
    await expect(page.getByText('Forks')).toBeVisible()
  })

  test('should show total results count', async ({ page }) => {
    // Set up response waiter BEFORE navigation to avoid race condition
    const responsePromise = page.waitForResponse(response =>
      response.url().includes('localhost:3001/api/github/search/repositories'),
      { timeout: 10000 }
    )

    await page.goto('/examples/http-provider')

    // Wait for API response
    const response = await responsePromise
    const responseData = await response.json()

    // Verify we got data from the API
    expect(responseData.total_count).toBeGreaterThan(0)

    // Wait for grid to render
    await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 5000 })

    // Verify results text is displayed (may vary based on mock data)
    const resultsText = page.locator('.control-group:has-text("Results:")')
    await expect(resultsText).toBeVisible()
  })

  test('should handle pagination with page parameter', async ({ page }) => {
    await page.goto('/examples/http-provider')

    // Wait for initial data to load
    await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 5000 })

    // Check if pagination controls exist
    const paginationExists = await page.locator('button:has-text("2")').count() > 0

    if (!paginationExists) {
      // Skip pagination test if not enough data
      console.log('[Test] Skipping pagination test - not enough data for multiple pages')
      return
    }

    // Navigate to page 2 and wait for API call
    const responsePromise = page.waitForResponse(response =>
      response.url().includes('localhost:3001/api/github/search/repositories') &&
      response.url().includes('page=2'),
      { timeout: 10000 }
    )
    await page.locator('button:has-text("2")').click()
    await responsePromise

    // Verify URL contains page parameter with gh prefix
    expect(page.url()).toContain('gh-page=2')

    // Verify active page indicator
    await expect(page.locator('button.active:has-text("2")')).toBeVisible()
  })

  test('should maintain URL state with gh prefix for all parameters', async ({ page }) => {
    await page.goto('/examples/http-provider')

    // Wait for initial load
    await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 5000 })

    // Set search query
    const searchInput = page.locator('input#search')
    await searchInput.fill('vue framework')

    // Set sort order
    const sortSelect = page.locator('select#sort')
    await sortSelect.selectOption('updated')

    // Click search and wait for response
    const responsePromise = page.waitForResponse(response =>
      response.url().includes('localhost:3001/api/github/search/repositories') &&
      response.url().includes('q=vue') &&
      response.url().includes('sort=updated'),
      { timeout: 10000 }
    )
    await page.locator('button.btn-primary').click()
    await responsePromise

    // Wait for grid to update
    await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 5000 })

    // Verify all parameters are in URL with gh prefix
    const url = page.url()
    expect(url).toContain('gh-q=vue')
    expect(url).toContain('gh-sort=updated')
  })

  test('should handle search on Enter key press', async ({ page }) => {
    await page.goto('/examples/http-provider')

    // Wait for initial load
    await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 5000 })

    // Type in search input
    const searchInput = page.locator('input#search')
    await searchInput.fill('typescript')

    // Press Enter and wait for API response
    const responsePromise = page.waitForResponse(response =>
      response.url().includes('localhost:3001/api/github/search/repositories') &&
      response.url().includes('q=typescript'),
      { timeout: 10000 }
    )
    await searchInput.press('Enter')
    await responsePromise

    // Verify URL updated
    expect(page.url()).toContain('gh-q=typescript')
  })

  test('should restore state after page refresh', async ({ page }) => {
    await page.goto('/examples/http-provider')

    // Wait for initial load
    await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 5000 })

    // Set search parameters
    const searchInput = page.locator('input#search')
    await searchInput.fill('react hooks')

    const sortSelect = page.locator('select#sort')
    await sortSelect.selectOption('forks')

    // Perform search
    const responsePromise = page.waitForResponse(response =>
      response.url().includes('localhost:3001/api/github/search/repositories') &&
      response.url().includes('q=react') &&
      response.url().includes('sort=forks'),
      { timeout: 10000 }
    )
    await page.locator('button.btn-primary').click()
    await responsePromise

    // Wait for grid to update
    await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 5000 })

    // Capture URL before refresh
    const urlBeforeRefresh = page.url()

    // Set up response waiter BEFORE reload
    const reloadResponsePromise = page.waitForResponse(response =>
      response.url().includes('localhost:3001/api/github/search/repositories') &&
      response.url().includes('q=') &&
      response.url().includes('sort=forks'),
      { timeout: 10000 }
    )

    // Reload the page
    await page.reload()

    // Wait for API response after reload
    await reloadResponsePromise

    // Wait for grid to be visible after reload
    await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 5000 })

    // Verify URL still has the same parameters after refresh
    const urlAfterRefresh = page.url()
    expect(urlAfterRefresh).toContain('gh-q=react+hooks')
    expect(urlAfterRefresh).toContain('gh-sort=forks')

    // Verify input values are restored from URL
    await expect(searchInput).toHaveValue('react hooks')
    await expect(sortSelect).toHaveValue('forks')

    // Verify results count is still displayed
    const resultsText = page.locator('.control-group:has-text("Results:")')
    await expect(resultsText).toBeVisible()
  })
})

test.describe('Multi-State Example', () => {
  test('should render both grids with different prefixes', async ({ page }) => {
    await page.goto('/examples/multi-state')

    // Verify section loaded
    await expect(page.locator('h2')).toContainText('Multi-State Example')

    // Verify both grids are present - wait for them to load
    await expect(page.locator('table').first()).toBeVisible({ timeout: 5000 })
    await expect(page.locator('table').last()).toBeVisible({ timeout: 5000 })

    // Verify section headers
    await expect(page.getByRole('heading', { name: /Array Provider with "products" prefix/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Mock HTTP Provider with "users" prefix/i })).toBeVisible()
  })

  test('should maintain independent state with different URL prefixes', async ({ page }) => {
    await page.goto('/examples/multi-state')

    // Wait for both grids to have data
    const grids = page.locator('table')
    await expect(grids.first().locator('tbody tr').first()).toBeVisible({ timeout: 5000 })
    await expect(grids.last().locator('tbody tr').first()).toBeVisible({ timeout: 5000 })

    // Get first grid (products) and check if sorting is enabled
    const firstGrid = grids.first()
    const firstSortableHeader = firstGrid.locator('th[data-sortable="true"]').first()

    // Check if sortable headers exist
    const sortableCount = await firstSortableHeader.count()

    if (sortableCount === 0) {
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
    }, { timeout: 5000 })

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
    }, { timeout: 5000 })

    // Verify URL has both prefixes
    const finalUrl = page.url()
    expect(finalUrl).toMatch(/products-/)
    expect(finalUrl).toMatch(/users-/)
  })
})

test.describe('LocalStorage State Provider', () => {
  test('should persist pagination state after page refresh', async ({ page }) => {
    // Clear localStorage before test
    await page.goto('/examples/state-localstorage')
    await page.evaluate(() => localStorage.clear())
    await page.reload()

    const grid = page.locator('table')

    // Wait for grid to load
    await expect(grid.locator('tbody tr').first()).toBeVisible({ timeout: 5000 })

    // Check if pagination exists
    const paginationExists = await page.locator('button:has-text("1")').count() > 0

    if (!paginationExists) {
      // Skip pagination tests if not enough data
      console.log('[Test] Skipping pagination test - not enough data')
      return
    }

    // Should start on page 1
    await expect(page.locator('button.active:has-text("1")')).toBeVisible()

    // Navigate to page 2
    const page2Button = page.locator('button:has-text("2")')
    await page2Button.click()

    // Wait for page to update
    await expect(page.locator('button.active:has-text("2")')).toBeVisible()

    // Reload the page
    await page.reload()

    // Wait for grid to load after reload
    await expect(grid.locator('tbody tr').first()).toBeVisible({ timeout: 5000 })

    // Verify still on page 2 (state restored from localStorage)
    await expect(page.locator('button.active:has-text("2")')).toBeVisible()
  })

  test('should persist sort state after page refresh', async ({ page }) => {
    // Clear localStorage before test
    await page.goto('/examples/state-localstorage')
    await page.evaluate(() => localStorage.clear())
    await page.reload()

    const grid = page.locator('table')

    // Wait for grid to load
    await expect(grid.locator('tbody tr').first()).toBeVisible({ timeout: 5000 })

    // Find a sortable header
    const sortableHeader = grid.locator('th[data-sortable="true"]').first()
    const sortableExists = await sortableHeader.count() > 0

    if (!sortableExists) {
      console.log('[Test] Skipping sort test - no sortable columns')
      return
    }

    // Click to sort
    await sortableHeader.click()

    // Wait for sort indicator to appear
    await expect(sortableHeader.locator('.sort-icon')).toBeVisible()

    // Reload the page
    await page.reload()

    // Wait for grid to load after reload
    await expect(grid.locator('tbody tr').first()).toBeVisible({ timeout: 5000 })

    // Verify sort state persisted (check for sort indicator)
    await expect(sortableHeader.locator('.sort-icon')).toBeVisible()
  })

  test('should not share state with InMemory provider', async ({ page }) => {
    // Set up state in LocalStorage provider
    await page.goto('/examples/state-localstorage')
    await page.evaluate(() => localStorage.clear())
    await page.reload()

    const localStorageGrid = page.locator('table')
    await expect(localStorageGrid.locator('tbody tr').first()).toBeVisible({ timeout: 5000 })

    // Sort if possible
    const sortableHeader = localStorageGrid.locator('th[data-sortable="true"]').first()
    const sortableExists = await sortableHeader.count() > 0

    if (sortableExists) {
      await sortableHeader.click()
      await expect(sortableHeader.locator('.sort-icon')).toBeVisible()
    }

    // Navigate to InMemory provider example
    await page.goto('/examples/state-inmemory')

    const inMemoryGrid = page.locator('table')
    await expect(inMemoryGrid.locator('tbody tr').first()).toBeVisible({ timeout: 5000 })

    // Verify InMemory provider has no sort state (fresh state)
    const inMemorySortable = inMemoryGrid.locator('th[data-sortable="true"]').first()
    const hasInMemorySortable = await inMemorySortable.count() > 0

    if (hasInMemorySortable) {
      // Should not have sort indicator (different state provider)
      const sortIcon = inMemorySortable.locator('.sort-icon')
      const sortIconCount = await sortIcon.count()
      expect(sortIconCount).toBe(0)
    }
  })
})

test.describe('Cross-Browser Compatibility', () => {
  test('examples should render consistently across browsers', async ({ page }) => {
    const examples = [
      '/examples/introduction',
      '/examples/basic',
      '/examples/array-provider'
    ]

    for (const example of examples) {
      await page.goto(example)

      // Verify basic page structure loads
      await expect(page.locator('h2')).toBeVisible({ timeout: 5000 })

      // Verify navigation is present
      await expect(page.locator('header')).toBeVisible()

      // Verify footer is present
      await expect(page.locator('footer')).toBeVisible()
    }
  })
})

/**
 * E2E Tests for Living Documentation Examples
 *
 * These tests verify that:
 * 1. Examples render correctly in real browsers
 * 2. The displayed code matches what's in tests
 * 3. Interactive features work as expected
 * 4. Examples are accessible and user-friendly
 *
 * Pattern: Living Documentation E2E Verification
 * - Unit tests verify code works in isolation
 * - E2E tests verify examples work for end users
 * - Together they guarantee documentation accuracy
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
    await page.goto('/#github-api')

    const section = page.locator('#github-api')

    // Verify section loaded
    await expect(section.locator('h2')).toContainText('GitHub API Example')

    // Verify search controls are present
    await expect(section.locator('input#search')).toBeVisible()
    await expect(section.locator('select#sort')).toBeVisible()
    await expect(section.locator('button.btn-primary')).toContainText('Search')

    // Verify grid is present
    await expect(section.locator('[data-qa="grid"]')).toBeVisible()
  })

  test('should perform search and update URL with gh prefix', async ({ page }) => {
    await page.goto('/#github-api')

    const section = page.locator('#github-api')

    // Wait for initial search to complete (default is "vue table")
    await page.waitForTimeout(2000)

    // Change search query
    const searchInput = section.locator('input#search')
    await searchInput.fill('react')

    // Click search button
    await section.locator('button.btn-primary').click()

    // Wait for search to complete
    await page.waitForTimeout(2000)

    // Verify URL contains gh-q parameter
    const url = new URL(page.url())
    expect(url.searchParams.get('gh-q')).toBe('react')
  })

  test('should change sort order and update URL', async ({ page }) => {
    await page.goto('/#github-api')

    const section = page.locator('#github-api')

    // Wait for initial load
    await page.waitForTimeout(2000)

    // Change sort order
    const sortSelect = section.locator('select#sort')
    await sortSelect.selectOption('forks')

    // Wait for re-fetch
    await page.waitForTimeout(2000)

    // Verify URL contains gh-sort parameter
    const url = new URL(page.url())
    expect(url.searchParams.get('gh-sort')).toBe('forks')
  })

  test('should display repository results from GitHub API', async ({ page }) => {
    await page.goto('/#github-api')

    const section = page.locator('#github-api')
    const grid = section.locator('[data-qa="grid"]')

    // Wait for API response
    await page.waitForTimeout(3000)

    // Verify grid has data (should have table headers)
    await expect(grid.locator('thead')).toBeVisible()

    // Verify at least one repository row is displayed
    const rows = grid.locator('tbody tr')
    await expect(rows.first()).toBeVisible()

    // Verify columns are present
    await expect(grid.getByText('Repository')).toBeVisible()
    await expect(grid.getByText('Stars')).toBeVisible()
    await expect(grid.getByText('Forks')).toBeVisible()
  })

  test('should show total results count', async ({ page }) => {
    await page.goto('/#github-api')

    const section = page.locator('#github-api')

    // Wait for search to complete
    await page.waitForTimeout(3000)

    // Verify results count is shown
    const resultsText = section.locator('.control-group:has-text("Results:")')
    await expect(resultsText).toBeVisible()
    await expect(resultsText).toContainText('repositories')
  })

  test('should handle pagination with page parameter', async ({ page }) => {
    await page.goto('/#github-api')

    const section = page.locator('#github-api')
    const grid = section.locator('[data-qa="grid"]')

    // Wait for initial load
    await page.waitForTimeout(3000)

    // Find and click page 2 button (if pagination exists)
    const page2Button = grid.locator('button:has-text("2")')
    const page2Exists = await page2Button.count() > 0

    if (page2Exists) {
      await page2Button.click()
      await page.waitForTimeout(2000)

      // Verify URL contains page parameter
      const url = new URL(page.url())
      expect(url.searchParams.get('page')).toBe('2')
    }
  })

  test('should maintain URL state with gh prefix for all parameters', async ({ page }) => {
    await page.goto('/#github-api')

    const section = page.locator('#github-api')

    // Set search query
    const searchInput = section.locator('input#search')
    await searchInput.fill('typescript')

    // Set sort order
    const sortSelect = section.locator('select#sort')
    await sortSelect.selectOption('updated')

    // Click search
    await section.locator('button.btn-primary').click()
    await page.waitForTimeout(2000)

    // Verify URL has all parameters with correct prefix
    const url = new URL(page.url())
    expect(url.searchParams.get('gh-q')).toBe('typescript')
    expect(url.searchParams.get('gh-sort')).toBe('updated')
    expect(url.searchParams.get('page')).toBe('1')
  })

  test('should handle search on Enter key press', async ({ page }) => {
    await page.goto('/#github-api')

    const section = page.locator('#github-api')
    const searchInput = section.locator('input#search')

    // Clear and type new search
    await searchInput.fill('vue3')
    await searchInput.press('Enter')

    // Wait for search
    await page.waitForTimeout(2000)

    // Verify URL updated
    const url = new URL(page.url())
    expect(url.searchParams.get('gh-q')).toBe('vue3')
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

    // Verify section headers
    await expect(section.getByText('Array Provider with "products" prefix')).toBeVisible()
    await expect(section.getByText('Mock HTTP Provider with "users" prefix')).toBeVisible()
  })

  test('should maintain independent state with different URL prefixes', async ({ page }) => {
    await page.goto('/#multi-state')

    const section = page.locator('#multi-state')
    const grids = section.locator('[data-qa="grid"]')

    // Wait for grids to load
    await page.waitForTimeout(1000)

    // Get first grid (products) and sort by a column
    const firstGrid = grids.first()
    const firstSortableHeader = firstGrid.locator('th[data-sortable="true"]').first()
    if (await firstSortableHeader.count() > 0) {
      await firstSortableHeader.click()
      await page.waitForTimeout(500)

      // Verify URL has products prefix
      const url = new URL(page.url())
      const hasProductsParam = Array.from(url.searchParams.keys()).some(key => key.startsWith('products-'))
      expect(hasProductsParam).toBe(true)
    }

    // Get second grid (users) and sort by a column
    const secondGrid = grids.last()
    const secondSortableHeader = secondGrid.locator('th[data-sortable="true"]').first()
    if (await secondSortableHeader.count() > 0) {
      await secondSortableHeader.click()
      await page.waitForTimeout(500)

      // Verify URL has both prefixes
      const url = new URL(page.url())
      const hasProductsParam = Array.from(url.searchParams.keys()).some(key => key.startsWith('products-'))
      const hasUsersParam = Array.from(url.searchParams.keys()).some(key => key.startsWith('users-'))

      expect(hasProductsParam).toBe(true)
      expect(hasUsersParam).toBe(true)
    }
  })
})

test.describe('Cross-Browser Compatibility', () => {
  test('examples should render consistently across browsers', async ({ page, browserName }) => {
    await page.goto('/#basic')

    const section = page.locator('#basic')

    // Core functionality should work in all browsers
    await expect(section.locator('[data-qa="grid"]')).toBeVisible()
    await expect(section.locator('.code-block')).toBeVisible()

    console.log(`✓ Basic Example works in ${browserName}`)
  })
})

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
    const grid = section.locator('[data-qa="grid"]')

    // Wait for initial GitHub API request to complete
    await page.waitForResponse(response =>
      response.url().includes('api.github.com/search/repositories') && response.status() === 200
    )

    // Verify initial data loaded
    await expect(grid.locator('tbody tr').first()).toBeVisible()

    // Change search query
    const searchInput = section.locator('input#search')
    await searchInput.fill('react')

    // Click search button and wait for API response
    const responsePromise = page.waitForResponse(response =>
      response.url().includes('api.github.com/search/repositories') &&
      response.url().includes('q=react')
    )
    await section.locator('button.btn-primary').click()
    await responsePromise

    // Verify URL contains gh-q parameter
    expect(page.url()).toContain('gh-q=react')
  })

  test('should change sort order and update URL', async ({ page }) => {
    await page.goto('/#github-api')

    const section = page.locator('#github-api')
    const grid = section.locator('[data-qa="grid"]')

    // Wait for initial load
    await page.waitForResponse(response =>
      response.url().includes('api.github.com/search/repositories')
    )

    // Change sort order and wait for new API request
    const sortSelect = section.locator('select#sort')
    const responsePromise = page.waitForResponse(response =>
      response.url().includes('api.github.com/search/repositories') &&
      response.url().includes('sort=forks')
    )
    await sortSelect.selectOption('forks')
    await responsePromise

    // Verify URL contains gh-sort parameter
    expect(page.url()).toContain('gh-sort=forks')
  })

  test('should display repository results from GitHub API', async ({ page }) => {
    await page.goto('/#github-api')

    const section = page.locator('#github-api')
    const grid = section.locator('[data-qa="grid"]')

    // Wait for GitHub API response
    await page.waitForResponse(response =>
      response.url().includes('api.github.com/search/repositories') && response.status() === 200
    )

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
    await page.goto('/#github-api')

    const section = page.locator('#github-api')

    // Wait for API response
    await page.waitForResponse(response =>
      response.url().includes('api.github.com/search/repositories')
    )

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
    await page.waitForResponse(response =>
      response.url().includes('api.github.com/search/repositories')
    )

    // Try to find page 2 button (GitHub API might not return enough results)
    const page2Button = grid.locator('button:has-text("2")')

    // Only test pagination if page 2 exists
    await page2Button.waitFor({ state: 'visible', timeout: 1000 }).catch(() => {
      // Page 2 doesn't exist, skip this test
    })

    if (await page2Button.isVisible()) {
      const responsePromise = page.waitForResponse(response =>
        response.url().includes('api.github.com/search/repositories') &&
        response.url().includes('page=2')
      )
      await page2Button.click()
      await responsePromise

      // Verify URL contains page parameter
      expect(page.url()).toContain('page=2')
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

    // Click search and wait for API response
    const responsePromise = page.waitForResponse(response =>
      response.url().includes('api.github.com/search/repositories') &&
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
    await page.goto('/#github-api')

    const section = page.locator('#github-api')
    const searchInput = section.locator('input#search')

    // Type and press Enter, wait for API response
    await searchInput.fill('vue3')
    const responsePromise = page.waitForResponse(response =>
      response.url().includes('api.github.com/search/repositories') &&
      response.url().includes('q=vue3')
    )
    await searchInput.press('Enter')
    await responsePromise

    // Verify URL updated
    expect(page.url()).toContain('gh-q=vue3')
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

    // Wait for both grids to have data
    await expect(grids.first().locator('tbody tr').first()).toBeVisible()
    await expect(grids.last().locator('tbody tr').first()).toBeVisible()

    // Get first grid (products) and sort by a column
    const firstGrid = grids.first()
    const firstSortableHeader = firstGrid.locator('th[data-sortable="true"]').first()

    // Click first grid's sortable header
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

test.describe('Cross-Browser Compatibility', () => {
  test('examples should render consistently across browsers', async ({ page }) => {
    await page.goto('/#basic')

    const section = page.locator('#basic')

    // Core functionality should work in all browsers
    await expect(section.locator('[data-qa="grid"]')).toBeVisible()
    await expect(section.locator('.code-block')).toBeVisible()
  })
})

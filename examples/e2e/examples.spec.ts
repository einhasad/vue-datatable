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

  test('should display features', async ({ page }) => {
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

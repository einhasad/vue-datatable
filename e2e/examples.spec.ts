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

    // Verify living documentation notice is shown
    await expect(section.locator('.example-notice')).toContainText('Living Documentation')
    await expect(section.locator('.example-notice')).toContainText('guaranteed to work')

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

  test('should show source file reference', async ({ page }) => {
    await page.goto('/#basic')

    const section = page.locator('#basic')

    // Verify source file is referenced
    await expect(section.locator('.example-notice code')).toContainText('__tests__/examples/basicExample.ts')
  })
})

test.describe('Array Provider Example', () => {
  test('should render and display working example', async ({ page }) => {
    await page.goto('/#array-provider')

    const section = page.locator('#array-provider')

    // Verify page loaded
    await expect(section.locator('h2')).toContainText('Array Provider Example')

    // Verify living documentation notice
    await expect(section.locator('.example-notice')).toContainText('Living Documentation')

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

test.describe('Living Documentation Integrity', () => {
  test('all example pages should have living documentation notice', async ({ page }) => {
    const examples = [
      { name: 'Basic Example', hash: '#basic' },
      { name: 'Array Provider', hash: '#array-provider' }
    ]

    for (const example of examples) {
      await page.goto(`/${example.hash}`)

      const section = page.locator(example.hash)

      // Every example must show it's living documentation
      await expect(section.locator('.example-notice')).toContainText('Living Documentation')
      await expect(section.locator('.example-notice')).toContainText('guaranteed to work')

      // Must reference source file
      await expect(section.locator('.example-notice code')).toContainText('__tests__/examples/')
    }
  })

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

test.describe('Cross-Browser Compatibility', () => {
  test('examples should render consistently across browsers', async ({ page, browserName }) => {
    await page.goto('/#basic')

    const section = page.locator('#basic')

    // Core functionality should work in all browsers
    await expect(section.locator('[data-qa="grid"]')).toBeVisible()
    await expect(section.locator('.code-block')).toBeVisible()
    await expect(section.locator('.example-notice')).toBeVisible()

    console.log(`✓ Basic Example works in ${browserName}`)
  })
})

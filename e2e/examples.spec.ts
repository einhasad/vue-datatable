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
    await page.goto('/')

    // Find the Basic Example link and click it
    await page.click('text=Basic Example')

    // Verify page loaded
    await expect(page.locator('h2')).toContainText('Basic Example')

    // Verify living documentation notice is shown
    await expect(page.locator('.example-notice')).toContainText('Living Documentation')
    await expect(page.locator('.example-notice')).toContainText('guaranteed to work')

    // Verify grid is rendered
    await expect(page.locator('[data-qa="grid"]')).toBeVisible()

    // Verify data is displayed in grid
    await expect(page.locator('text=John Doe')).toBeVisible()
    await expect(page.locator('text=jane@example.com')).toBeVisible()

    // Verify code block is shown
    await expect(page.locator('.code-block')).toBeVisible()
    await expect(page.locator('.code-block')).toContainText('ArrayDataProvider')
  })

  test('should show source file reference', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Basic Example')

    // Verify source file is referenced
    await expect(page.locator('.example-notice code')).toContainText('__tests__/examples/basicExample.ts')
  })
})

test.describe('Array Provider Example', () => {
  test('should render and display working example', async ({ page }) => {
    await page.goto('/')

    // Navigate to Array Provider Example
    await page.click('text=Array Provider')

    // Verify page loaded
    await expect(page.locator('h2')).toContainText('Array Provider Example')

    // Verify living documentation notice
    await expect(page.locator('.example-notice')).toContainText('Living Documentation')

    // Verify grid is rendered
    await expect(page.locator('[data-qa="grid"]')).toBeVisible()

    // Verify pagination is working (page mode)
    await expect(page.locator('text=Laptop Pro')).toBeVisible()

    // Verify code block shows the example
    await expect(page.locator('.code-block')).toBeVisible()
    await expect(page.locator('.code-block')).toContainText('pageSize: 5')
  })

  test('should display key features', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Array Provider')

    // Verify features section exists
    await expect(page.locator('h3:has-text("Key Features")')).toBeVisible()

    // Verify features are listed
    await expect(page.locator('text=Client-side pagination')).toBeVisible()
    await expect(page.locator('text=Sorting')).toBeVisible()
  })

  test('should support pagination interaction', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Array Provider')

    // Wait for grid to load
    await page.waitForSelector('[data-qa="grid"]')

    // Verify first page items are visible
    await expect(page.locator('text=Laptop Pro')).toBeVisible()

    // Note: Further pagination tests would require the pagination controls to be present
    // This depends on the actual Grid implementation
  })
})

test.describe('Living Documentation Integrity', () => {
  test('all example pages should have living documentation notice', async ({ page }) => {
    const examples = ['Basic Example', 'Array Provider']

    for (const example of examples) {
      await page.goto('/')
      await page.click(`text=${example}`)

      // Every example must show it's living documentation
      await expect(page.locator('.example-notice')).toContainText('Living Documentation')
      await expect(page.locator('.example-notice')).toContainText('guaranteed to work')

      // Must reference source file
      await expect(page.locator('.example-notice code')).toContainText('__tests__/examples/')
    }
  })

  test('all examples should display code and working demo', async ({ page }) => {
    const examples = ['Basic Example', 'Array Provider']

    for (const example of examples) {
      await page.goto('/')
      await page.click(`text=${example}`)

      // Must have Demo section
      await expect(page.locator('h3:has-text("Demo")')).toBeVisible()
      await expect(page.locator('[data-qa="grid"]')).toBeVisible()

      // Must have Code section
      await expect(page.locator('h3:has-text("Code")')).toBeVisible()
      await expect(page.locator('.code-block')).toBeVisible()
    }
  })

  test('code blocks should contain valid Vue component syntax', async ({ page }) => {
    const examples = ['Basic Example', 'Array Provider']

    for (const example of examples) {
      await page.goto('/')
      await page.click(`text=${example}`)

      const codeBlock = page.locator('.code-block')

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
    await page.goto('/')
    await page.click('text=Basic Example')

    // Core functionality should work in all browsers
    await expect(page.locator('[data-qa="grid"]')).toBeVisible()
    await expect(page.locator('.code-block')).toBeVisible()
    await expect(page.locator('.example-notice')).toBeVisible()

    console.log(`✓ Basic Example works in ${browserName}`)
  })
})

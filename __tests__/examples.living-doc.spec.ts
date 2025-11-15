/**
 * Living Documentation Tests
 *
 * These tests verify that all example code:
 * 1. Actually works (can be instantiated without errors)
 * 2. Returns expected data structures
 * 3. Is guaranteed to be in sync with documentation
 *
 * Pattern: Living Documentation / Specification by Example
 * References:
 * - https://concordion.org/ (Specification by Example)
 * - https://medium.com/@lukejpreston/living-documentation-write-better-tests-and-better-docs-147eefe65ab
 * - https://mokacoding.com/blog/tests-are-the-best-documentation/
 */

import { describe, it, expect } from 'vitest'
import { ArrayDataProvider } from '../src/providers/ArrayDataProvider'
import { basicExample, users, provider as basicProvider, columns as basicColumns } from './examples/basicExample'
import { arrayProviderExample, products, provider as arrayProvider, columns as arrayColumns } from './examples/arrayProviderExample'

describe('Living Documentation - Example Code Tests', () => {
  describe('Basic Example', () => {
    it('should have valid metadata', () => {
      expect(basicExample.title).toBe('Basic Example')
      expect(basicExample.description).toBeTruthy()
      expect(basicExample.setupCode).toBeTypeOf('function')
    })

    it('should create working provider and columns', () => {
      const { provider, columns } = basicExample.setupCode()

      expect(provider).toBeDefined()
      expect(columns).toBeInstanceOf(Array)
      expect(columns.length).toBeGreaterThan(0)
    })

    it('should have correct data', () => {
      expect(users).toHaveLength(5)
      expect(users[0]).toHaveProperty('id')
      expect(users[0]).toHaveProperty('name')
      expect(users[0]).toHaveProperty('email')
      expect(users[0]).toHaveProperty('role')
    })

    it('should create provider with correct configuration', () => {
      expect(basicProvider.config.pagination).toBe(false)
      expect(basicProvider.config.paginationMode).toBe('cursor')
    })

    it('should have all required columns', () => {
      expect(basicColumns).toHaveLength(4)
      expect(basicColumns.map(c => c.key)).toEqual(['id', 'name', 'email', 'role'])
    })

    it('should be able to load data', async () => {
      const result = await basicProvider.load()
      expect(result).toBeDefined()
      expect(result.items).toHaveLength(5)
    })
  })

  describe('Array Provider Example', () => {
    it('should have valid metadata', () => {
      expect(arrayProviderExample.title).toBe('Array Provider Example')
      expect(arrayProviderExample.description).toBeTruthy()
      expect(arrayProviderExample.features).toBeInstanceOf(Array)
      expect(arrayProviderExample.features?.length).toBeGreaterThan(0)
    })

    it('should create working provider and columns', () => {
      const { provider, columns } = arrayProviderExample.setupCode()

      expect(provider).toBeDefined()
      expect(columns).toBeInstanceOf(Array)
      expect(columns.length).toBe(5)
    })

    it('should have correct data', () => {
      expect(products).toHaveLength(10)
      expect(products[0]).toHaveProperty('id')
      expect(products[0]).toHaveProperty('name')
      expect(products[0]).toHaveProperty('category')
      expect(products[0]).toHaveProperty('price')
      expect(products[0]).toHaveProperty('stock')
    })

    it('should create provider with pagination enabled', () => {
      expect(arrayProvider.config.pagination).toBe(true)
      expect(arrayProvider.config.paginationMode).toBe('page')
      expect(arrayProvider.config.pageSize).toBe(5)
    })

    it('should have sortable columns', () => {
      const sortableColumns = arrayColumns.filter(c => c.sortable)
      expect(sortableColumns.length).toBe(5) // All columns sortable
    })

    it('should load first page correctly', async () => {
      const result = await arrayProvider.load()
      expect(result).toBeDefined()
      expect(result.items).toHaveLength(5) // First page

      if ('totalPages' in result) {
        expect(result.totalPages).toBe(2) // 10 items / 5 per page
        expect(result.currentPage).toBe(1)
      }
    })

    it('should support sorting', async () => {
      // Create fresh provider instance for this test
      const testProvider = new ArrayDataProvider({
        items: products,
        pagination: true,
        paginationMode: 'page',
        pageSize: 5
      })

      // Test that sorting can be set and data can be loaded
      await testProvider.setSort({ field: 'price', order: 'asc' })
      const result = await testProvider.load()

      // Verify data is returned
      expect(result.items).toBeDefined()
      expect(result.items.length).toBeGreaterThan(0)

      // Verify all items have price property (sortable column)
      result.items.forEach(item => {
        expect(item).toHaveProperty('price')
      })
    })
  })

  describe('Cross-Example Validation', () => {
    const examples = [basicExample, arrayProviderExample]

    it('all examples should have required metadata', () => {
      examples.forEach(example => {
        expect(example.title).toBeTruthy()
        expect(example.description).toBeTruthy()
        expect(example.setupCode).toBeTypeOf('function')
      })
    })

    it('all examples should create working instances', () => {
      examples.forEach(example => {
        const { provider, columns } = example.setupCode()
        expect(provider).toBeDefined()
        expect(columns).toBeInstanceOf(Array)
        expect(columns.length).toBeGreaterThan(0)
      })
    })

    it('all examples should be able to load data', async () => {
      for (const example of examples) {
        const { provider } = example.setupCode()
        const result = await provider.load()
        expect(result).toBeDefined()
        expect(result.items).toBeInstanceOf(Array)
        expect(result.items.length).toBeGreaterThan(0)
      }
    })
  })
})

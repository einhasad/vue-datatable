/**
 * Tests for Mock GitHub API Server
 *
 * These tests ensure the mock API server works correctly with search,
 * sorting, and pagination functionality.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import type { Server } from 'http'
import { createApp } from '../examples/mock-server/index.js'
import type { Express } from 'express'

describe('Mock GitHub API Server', () => {
  let app: Express
  let server: Server

  beforeAll(() => {
    app = createApp()
    // Set port to 0 to let the OS assign a random available port
    server = app.listen(0)
  })

  afterAll((done) => {
    server.close(done)
  })

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/github/health')
        .expect(200)

      expect(response.body).toMatchObject({
        status: 'ok',
        message: 'Mock GitHub API is running',
        totalRepositories: expect.any(Number)
      })
      expect(response.body.totalRepositories).toBeGreaterThan(0)
    })
  })

  describe('Search Repositories', () => {
    it('should return all repositories when no query provided', async () => {
      const response = await request(app)
        .get('/api/github/search/repositories')
        .expect(200)

      expect(response.body).toHaveProperty('total_count')
      expect(response.body).toHaveProperty('incomplete_results')
      expect(response.body).toHaveProperty('items')
      expect(Array.isArray(response.body.items)).toBe(true)
      expect(response.body.items.length).toBeGreaterThan(0)
    })

    it('should search repositories by query', async () => {
      const response = await request(app)
        .get('/api/github/search/repositories')
        .query({ q: 'vue' })
        .expect(200)

      expect(response.body.items.length).toBeGreaterThan(0)

      // Check that results contain 'vue' in searchable fields
      const firstItem = response.body.items[0]
      const searchableText = [
        firstItem.name,
        firstItem.owner.login,
        firstItem.full_name,
        firstItem.description || '',
        firstItem.language || ''
      ].join(' ').toLowerCase()

      expect(searchableText).toContain('vue')
    })

    it('should return empty results for non-matching query', async () => {
      const response = await request(app)
        .get('/api/github/search/repositories')
        .query({ q: 'xyz123nonexistent456' })
        .expect(200)

      expect(response.body.total_count).toBe(0)
      expect(response.body.items).toHaveLength(0)
    })

    it('should search with multiple terms', async () => {
      const response = await request(app)
        .get('/api/github/search/repositories')
        .query({ q: 'vue table' })
        .expect(200)

      // Should find repositories matching both 'vue' and 'table'
      const firstItem = response.body.items[0]
      const searchableText = [
        firstItem.name,
        firstItem.owner.login,
        firstItem.full_name,
        firstItem.description || '',
        firstItem.language || ''
      ].join(' ').toLowerCase()

      expect(searchableText).toContain('vue')
      expect(searchableText).toContain('table')
    })
  })

  describe('Sorting', () => {
    it('should sort by stars in descending order by default', async () => {
      const response = await request(app)
        .get('/api/github/search/repositories')
        .query({ sort: 'stars', per_page: 10 })
        .expect(200)

      const items = response.body.items
      expect(items.length).toBeGreaterThan(1)

      // Verify descending order
      for (let i = 0; i < items.length - 1; i++) {
        expect(items[i].stargazers_count).toBeGreaterThanOrEqual(items[i + 1].stargazers_count)
      }
    })

    it('should sort by stars in ascending order', async () => {
      const response = await request(app)
        .get('/api/github/search/repositories')
        .query({ sort: 'stars', order: 'asc', per_page: 10 })
        .expect(200)

      const items = response.body.items
      expect(items.length).toBeGreaterThan(1)

      // Verify ascending order
      for (let i = 0; i < items.length - 1; i++) {
        expect(items[i].stargazers_count).toBeLessThanOrEqual(items[i + 1].stargazers_count)
      }
    })

    it('should sort by forks', async () => {
      const response = await request(app)
        .get('/api/github/search/repositories')
        .query({ sort: 'forks', order: 'desc', per_page: 10 })
        .expect(200)

      const items = response.body.items
      expect(items.length).toBeGreaterThan(1)

      // Verify descending order by forks
      for (let i = 0; i < items.length - 1; i++) {
        expect(items[i].forks_count).toBeGreaterThanOrEqual(items[i + 1].forks_count)
      }
    })

    it('should sort by updated date', async () => {
      const response = await request(app)
        .get('/api/github/search/repositories')
        .query({ sort: 'updated', order: 'desc', per_page: 10 })
        .expect(200)

      const items = response.body.items
      expect(items.length).toBeGreaterThan(1)

      // Verify descending order by updated_at
      for (let i = 0; i < items.length - 1; i++) {
        const date1 = new Date(items[i].updated_at).getTime()
        const date2 = new Date(items[i + 1].updated_at).getTime()
        expect(date1).toBeGreaterThanOrEqual(date2)
      }
    })

    it('should sort by help-wanted-issues', async () => {
      const response = await request(app)
        .get('/api/github/search/repositories')
        .query({ sort: 'help-wanted-issues', order: 'desc', per_page: 10 })
        .expect(200)

      const items = response.body.items
      expect(items.length).toBeGreaterThan(1)

      // Verify descending order by open_issues_count
      for (let i = 0; i < items.length - 1; i++) {
        expect(items[i].open_issues_count).toBeGreaterThanOrEqual(items[i + 1].open_issues_count)
      }
    })
  })

  describe('Pagination', () => {
    it('should paginate results with default page size', async () => {
      const response = await request(app)
        .get('/api/github/search/repositories')
        .expect(200)

      expect(response.body.items.length).toBeLessThanOrEqual(30) // Default per_page is 30
    })

    it('should respect per_page parameter', async () => {
      const perPage = 5
      const response = await request(app)
        .get('/api/github/search/repositories')
        .query({ per_page: perPage })
        .expect(200)

      expect(response.body.items.length).toBeLessThanOrEqual(perPage)
    })

    it('should paginate to second page', async () => {
      const perPage = 10

      // Get first page
      const page1Response = await request(app)
        .get('/api/github/search/repositories')
        .query({ per_page: perPage, page: 1 })
        .expect(200)

      // Get second page
      const page2Response = await request(app)
        .get('/api/github/search/repositories')
        .query({ per_page: perPage, page: 2 })
        .expect(200)

      // Items should be different
      const page1Ids = page1Response.body.items.map((item: any) => item.id)
      const page2Ids = page2Response.body.items.map((item: any) => item.id)

      // No overlap between pages
      const overlap = page1Ids.filter((id: number) => page2Ids.includes(id))
      expect(overlap).toHaveLength(0)
    })

    it('should limit per_page to 100', async () => {
      const response = await request(app)
        .get('/api/github/search/repositories')
        .query({ per_page: 200 })
        .expect(200)

      expect(response.body.items.length).toBeLessThanOrEqual(100)
    })

    it('should handle page beyond available results', async () => {
      const response = await request(app)
        .get('/api/github/search/repositories')
        .query({ page: 9999, per_page: 10 })
        .expect(200)

      expect(response.body.items).toHaveLength(0)
    })
  })

  describe('Combined Operations', () => {
    it('should search, sort, and paginate together', async () => {
      const response = await request(app)
        .get('/api/github/search/repositories')
        .query({
          q: 'vue',
          sort: 'stars',
          order: 'desc',
          page: 1,
          per_page: 5
        })
        .expect(200)

      expect(response.body.items.length).toBeGreaterThan(0)
      expect(response.body.items.length).toBeLessThanOrEqual(5)

      // Verify sorting
      const items = response.body.items
      if (items.length > 1) {
        for (let i = 0; i < items.length - 1; i++) {
          expect(items[i].stargazers_count).toBeGreaterThanOrEqual(items[i + 1].stargazers_count)
        }
      }

      // Verify search
      const firstItem = items[0]
      const searchableText = [
        firstItem.name,
        firstItem.owner.login,
        firstItem.full_name,
        firstItem.description || '',
        firstItem.language || ''
      ].join(' ').toLowerCase()

      expect(searchableText).toContain('vue')
    })
  })

  describe('Response Format', () => {
    it('should return GitHub API compatible format', async () => {
      const response = await request(app)
        .get('/api/github/search/repositories')
        .query({ per_page: 1 })
        .expect(200)

      const { body } = response

      // Top-level structure
      expect(body).toHaveProperty('total_count')
      expect(body).toHaveProperty('incomplete_results')
      expect(body).toHaveProperty('items')

      // Repository structure
      const repo = body.items[0]
      expect(repo).toHaveProperty('id')
      expect(repo).toHaveProperty('name')
      expect(repo).toHaveProperty('full_name')
      expect(repo).toHaveProperty('owner')
      expect(repo).toHaveProperty('html_url')
      expect(repo).toHaveProperty('description')
      expect(repo).toHaveProperty('stargazers_count')
      expect(repo).toHaveProperty('forks_count')
      expect(repo).toHaveProperty('language')
      expect(repo).toHaveProperty('updated_at')

      // Owner structure
      expect(repo.owner).toHaveProperty('login')
      expect(repo.owner).toHaveProperty('avatar_url')
      expect(repo.owner).toHaveProperty('html_url')
    })
  })

  describe('Error Handling', () => {
    it('should return 404 for unknown endpoints', async () => {
      const response = await request(app)
        .get('/api/github/unknown')
        .expect(404)

      expect(response.body).toHaveProperty('message')
    })
  })
})

describe('Mock GitHub API Data Generation', () => {
  let app: Express

  beforeAll(() => {
    app = createApp()
  })

  it('should generate repositories with valid structure', async () => {
    const response = await request(app)
      .get('/api/github/search/repositories')
      .query({ per_page: 1 })
      .expect(200)

    const repo = response.body.items[0]

    // Verify all required fields are present and valid
    expect(repo.id).toBeTypeOf('number')
    expect(repo.name).toBeTypeOf('string')
    expect(repo.full_name).toBeTypeOf('string')
    expect(repo.full_name).toMatch(/^[^/]+\/[^/]+$/) // owner/repo format
    expect(repo.stargazers_count).toBeTypeOf('number')
    expect(repo.stargazers_count).toBeGreaterThanOrEqual(0)
    expect(repo.forks_count).toBeTypeOf('number')
    expect(repo.forks_count).toBeGreaterThanOrEqual(0)
  })

  it('should generate repositories with diverse languages', async () => {
    const response = await request(app)
      .get('/api/github/search/repositories')
      .query({ per_page: 50 })
      .expect(200)

    const languages = new Set(
      response.body.items
        .map((repo: any) => repo.language)
        .filter(Boolean)
    )

    // Should have multiple different languages
    expect(languages.size).toBeGreaterThan(1)
  })

  it('should generate repositories with realistic star counts', async () => {
    const response = await request(app)
      .get('/api/github/search/repositories')
      .query({ per_page: 20 })
      .expect(200)

    const starCounts = response.body.items.map((repo: any) => repo.stargazers_count)

    // Should have variation in star counts
    const uniqueStarCounts = new Set(starCounts)
    expect(uniqueStarCounts.size).toBeGreaterThan(1)

    // All star counts should be non-negative
    starCounts.forEach((count: number) => {
      expect(count).toBeGreaterThanOrEqual(0)
    })
  })
})

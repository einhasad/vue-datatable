/**
 * Integration Tests for Mock GitHub API
 *
 * These tests verify that the mock API can be used as a drop-in replacement
 * for the real GitHub API in HttpDataProvider.
 */

import { describe, it, expect, beforeAll } from 'vitest'
import { HttpDataProvider } from '../src/providers/HttpDataProvider'
import { InMemoryStateProvider } from '../src/state/InMemoryStateProvider'

describe('Mock GitHub API Integration', () => {
  const MOCK_API_URL = 'http://localhost:3001/api/search/repositories'

  // Custom adapter for GitHub API response format
  class GitHubSearchAdapter {
    private currentPage = 1

    setCurrentPage(page: number) {
      this.currentPage = page
    }

    extractItems(response: any): any[] {
      return response.items || []
    }

    extractPagination(response: any) {
      const totalCount = response.total_count || 0
      const perPage = 10
      return {
        currentPage: this.currentPage,
        perPage,
        pageCount: Math.min(Math.ceil(totalCount / perPage), 100),
        totalCount: Math.min(totalCount, 1000)
      }
    }

    isSuccess(response: any): boolean {
      return !response.message
    }

    getErrorMessage(response: any): string {
      return response.message || 'API request failed'
    }
  }

  const adapter = new GitHubSearchAdapter()

  async function mockHttpClient(fullUrl: string): Promise<any> {
    const urlObj = new URL(fullUrl)
    const q = urlObj.searchParams.get('q') || 'vue'
    const sort = urlObj.searchParams.get('sort')?.replace('-', '') || 'stars'
    const page = urlObj.searchParams.get('page') || '1'

    adapter.setCurrentPage(parseInt(page))

    const params = new URLSearchParams({
      q,
      sort,
      order: 'desc',
      per_page: '10',
      page
    })

    const url = `${MOCK_API_URL}?${params.toString()}`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  it('should fetch repositories from mock API', async () => {
    const provider = new HttpDataProvider({
      url: MOCK_API_URL,
      pagination: true,
      paginationMode: 'page',
      pageSize: 10,
      responseAdapter: adapter,
      httpClient: mockHttpClient,
      stateProvider: new InMemoryStateProvider()
    })

    const result = await provider.load()

    expect(result.items).toBeInstanceOf(Array)
    expect(result.items.length).toBeGreaterThan(0)
    expect(result.items.length).toBeLessThanOrEqual(10)

    // Verify repository structure
    const repo = result.items[0]
    expect(repo).toHaveProperty('id')
    expect(repo).toHaveProperty('name')
    expect(repo).toHaveProperty('full_name')
    expect(repo).toHaveProperty('stargazers_count')
  })

  it('should search repositories with query', async () => {
    const stateProvider = new InMemoryStateProvider()
    stateProvider.setFilter('q', 'vue table')

    const provider = new HttpDataProvider({
      url: MOCK_API_URL,
      pagination: true,
      paginationMode: 'page',
      pageSize: 10,
      responseAdapter: adapter,
      httpClient: mockHttpClient,
      stateProvider
    })

    const result = await provider.load()

    expect(result.items.length).toBeGreaterThan(0)

    // Verify results match the query
    const repo = result.items[0]
    const searchableText = [
      repo.name,
      repo.owner.login,
      repo.full_name,
      repo.description || '',
      repo.language || ''
    ].join(' ').toLowerCase()

    expect(searchableText).toContain('vue')
    expect(searchableText).toContain('table')
  })

  it('should sort repositories by stars', async () => {
    const stateProvider = new InMemoryStateProvider()
    stateProvider.setFilter('sort', 'stars')

    const provider = new HttpDataProvider({
      url: MOCK_API_URL,
      pagination: true,
      paginationMode: 'page',
      pageSize: 10,
      responseAdapter: adapter,
      httpClient: mockHttpClient,
      stateProvider
    })

    const result = await provider.load()

    // Verify sorting
    for (let i = 0; i < result.items.length - 1; i++) {
      expect(result.items[i].stargazers_count).toBeGreaterThanOrEqual(
        result.items[i + 1].stargazers_count
      )
    }
  })

  it('should paginate results', async () => {
    const stateProvider = new InMemoryStateProvider()

    const provider = new HttpDataProvider({
      url: MOCK_API_URL,
      pagination: true,
      paginationMode: 'page',
      pageSize: 10,
      responseAdapter: adapter,
      httpClient: mockHttpClient,
      stateProvider
    })

    // Get page 1
    await provider.setPage(1)
    const page1 = await provider.load()

    // Get page 2
    await provider.setPage(2)
    const page2 = await provider.load()

    // Pages should have different items
    const page1Ids = page1.items.map((item: any) => item.id)
    const page2Ids = page2.items.map((item: any) => item.id)

    const overlap = page1Ids.filter((id: number) => page2Ids.includes(id))
    expect(overlap).toHaveLength(0)
  })

  it('should return pagination metadata', async () => {
    const provider = new HttpDataProvider({
      url: MOCK_API_URL,
      pagination: true,
      paginationMode: 'page',
      pageSize: 10,
      responseAdapter: adapter,
      httpClient: mockHttpClient,
      stateProvider: new InMemoryStateProvider()
    })

    const result = await provider.load()

    expect(result.pagination).toBeDefined()
    expect(result.pagination).toHaveProperty('currentPage')
    expect(result.pagination).toHaveProperty('pageCount')
    expect(result.pagination).toHaveProperty('totalCount')
  })
})

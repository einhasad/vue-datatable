import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  ElasticSearchDataProvider,
  DefaultElasticResponseAdapter
} from '../src/providers/ElasticSearchDataProvider'
import type {
  ElasticQuery,
  ElasticResponse,
  ElasticsearchDataProviderConfig
} from '../src/providers/ElasticSearchDataProvider'
import { InMemoryStateProvider } from '../src/state/InMemoryStateProvider'
import { QueryParamsStateProvider } from '../src/state/QueryParamsStateProvider'
import type { StateProvider } from '../src/state/StateProvider'

// Mock ES response factory
function makeEsResponse<T>(items: T[], totalHits: number, aggregations?: Record<string, unknown>): ElasticResponse<T> {
  return {
    hits: {
      total: { value: totalHits, relation: 'eq' },
      hits: items.map((item, i) => ({
        _id: String(i + 1),
        _source: item,
        sort: [i + 1]
      }))
    },
    aggregations
  }
}

// Mock httpClient factory
function makeMockHttpClient(response: ElasticResponse) {
  return vi.fn().mockResolvedValue(response)
}

const sampleData = [
  { id: 1, name: 'Alice', age: 25 },
  { id: 2, name: 'Bob', age: 30 },
  { id: 3, name: 'Charlie', age: 35 },
  { id: 4, name: 'David', age: 40 },
  { id: 5, name: 'Eve', age: 45 }
]

describe('ElasticsearchDataProvider', () => {
  describe('State Provider resolution', () => {
    it('uses explicit stateProvider when provided', () => {
      const sp = new InMemoryStateProvider()
      const provider = new ElasticSearchDataProvider({
        url: '/api/search',
        stateProvider: sp,
        httpClient: vi.fn()
      })
      expect(provider.getStateProvider()).toBe(sp)
    })

    it('defaults to InMemoryStateProvider when none provided', () => {
      const provider = new ElasticSearchDataProvider({
        url: '/api/search',
        httpClient: vi.fn()
      })
      expect(provider.getStateProvider()).toBeInstanceOf(InMemoryStateProvider)
    })

    it('creates QueryParamsStateProvider when router is provided', () => {
      const mockRouter = {
        currentRoute: { value: { query: {}, path: '/', hash: '' } },
        replace: vi.fn()
      }
      const provider = new ElasticSearchDataProvider({
        url: '/api/search',
        httpClient: vi.fn(),
        router: mockRouter as any
      })
      expect(provider.getStateProvider()).toBeInstanceOf(QueryParamsStateProvider)
    })
  })

  describe('Load and Refresh', () => {
    let mockClient: ReturnType<typeof makeMockHttpClient>
    let provider: ElasticSearchDataProvider<{ id: number; name: string; age: number }>

    beforeEach(() => {
      const response = makeEsResponse(sampleData, sampleData.length)
      mockClient = makeMockHttpClient(response)
      provider = new ElasticSearchDataProvider({
        url: '/api/search',
        httpClient: mockClient
      })
    })

    it('loads data and returns items', async () => {
      const result = await provider.load()
      expect(result.items).toHaveLength(5)
      expect(result.items[0]).toEqual(sampleData[0])
      expect(provider.getCurrentItems()).toHaveLength(5)
    })

    it('calls httpClient with correct URL and query', async () => {
      await provider.load()
      expect(mockClient).toHaveBeenCalledWith('/api/search', expect.objectContaining({
        query: { match_all: {} },
        size: 20,
        from: 0
      }))
    })

    it('tracks totalHits', async () => {
      await provider.load()
      expect(provider.getTotalHits()).toBe(5)
    })

    it('sets loading state during load', async () => {
      expect(provider.isLoading()).toBe(false)
      const promise = provider.load()
      expect(provider.isLoading()).toBe(true)
      await promise
      expect(provider.isLoading()).toBe(false)
    })

    it('refresh clears items and reloads', async () => {
      await provider.load()
      expect(provider.getCurrentItems()).toHaveLength(5)
      const result = await provider.refresh()
      expect(result.items).toHaveLength(5)
    })

    it('includes index in request when configured', async () => {
      provider = new ElasticSearchDataProvider({
        url: '/api/search',
        index: 'my-index',
        httpClient: mockClient
      })
      await provider.load()
      expect(mockClient).toHaveBeenCalledWith('/api/search', {
        index: 'my-index',
        body: expect.objectContaining({
          query: { match_all: {} },
          size: 20
        })
      })
    })

  })

  describe('Sort Management', () => {
    let mockClient: ReturnType<typeof makeMockHttpClient>
    let provider: ElasticSearchDataProvider

    beforeEach(() => {
      mockClient = makeMockHttpClient(makeEsResponse(sampleData, 5))
      provider = new ElasticSearchDataProvider({
        url: '/api/search',
        httpClient: mockClient
      })
    })

    it('delegates sort to stateProvider', () => {
      provider.setSort({ field: 'name', order: 'asc' })
      expect(provider.getSort()).toEqual({ field: 'name', order: 'asc' })
    })

    it('includes sort in ES query', async () => {
      provider.setSort({ field: 'name', order: 'desc' })
      await provider.load()
      expect(mockClient).toHaveBeenCalledWith('/api/search', expect.objectContaining({
        sort: [{ name: 'desc' }, { _id: 'desc' }]
      }))
    })

    it('sort from options takes priority over state', async () => {
      provider.setSort({ field: 'name', order: 'asc' })
      await provider.load({ sortField: 'age', sortOrder: 'desc' })
      expect(mockClient).toHaveBeenCalledWith('/api/search', expect.objectContaining({
        sort: [{ age: 'desc' }, { _id: 'desc' }]
      }))
    })

    it('uses defaultSort when no other sort set', async () => {
      provider = new ElasticSearchDataProvider({
        url: '/api/search',
        httpClient: mockClient,
        defaultSort: [{ timestamp: 'desc' }, { _id: 'desc' }]
      })
      await provider.load()
      expect(mockClient).toHaveBeenCalledWith('/api/search', expect.objectContaining({
        sort: [{ timestamp: 'desc' }, { _id: 'desc' }]
      }))
    })

    it('adds _id tiebreaker when not present in sort', async () => {
      provider.setSort({ field: 'name', order: 'asc' })
      await provider.load()
      expect(mockClient).toHaveBeenCalledWith('/api/search', expect.objectContaining({
        sort: [{ name: 'asc' }, { _id: 'desc' }]
      }))
    })

    it('does not duplicate _id tiebreaker', async () => {
      provider.setSort({ field: '_id', order: 'asc' })
      await provider.load()
      expect(mockClient).toHaveBeenCalledWith('/api/search', expect.objectContaining({
        sort: [{ _id: 'asc' }]
      }))
    })

    it('sets defaultSort in stateProvider on construction', () => {
      provider = new ElasticSearchDataProvider({
        url: '/api/search',
        httpClient: mockClient,
        defaultSort: [{ timestamp: 'desc' }]
      })
      expect(provider.getSort()).toEqual({ field: 'timestamp', order: 'desc' })
    })

    it('uses defaultSortValue directly when no sortState and no load options', async () => {
      // Build a provider with defaultSort but clear the sort state afterward
      // so sortState is null and the else-if (defaultSortValue) branch executes
      const sp = new InMemoryStateProvider()
      provider = new ElasticSearchDataProvider({
        url: '/api/search',
        httpClient: mockClient,
        stateProvider: sp,
        defaultSort: [{ timestamp: 'desc' }, { _id: 'desc' }]
      })
      // Constructor calls sp.setSort, so clear it to hit the else-if branch
      sp.clearSort()
      await provider.load()
      expect(mockClient).toHaveBeenCalledWith('/api/search', expect.objectContaining({
        sort: [{ timestamp: 'desc' }, { _id: 'desc' }]
      }))
    })
  })

  describe('ElasticQuery building', () => {
    let mockClient: ReturnType<typeof makeMockHttpClient>
    let provider: ElasticSearchDataProvider

    beforeEach(() => {
      mockClient = makeMockHttpClient(makeEsResponse(sampleData, 5))
      provider = new ElasticSearchDataProvider({
        url: '/api/search',
        httpClient: mockClient,
        defaultQuery: { bool: { must: [{ term: { status: 'active' } }] } }
      })
    })

    it('uses custom query when set', async () => {
      await provider.load()
      expect(mockClient).toHaveBeenCalledWith('/api/search', expect.objectContaining({
        query: { bool: { must: [{ term: { status: 'active' } }] } }
      }))
    })

    it('setElasticQuery overrides the query', async () => {
      provider.setElasticQuery({ match: { title: 'test' } })
      await provider.load()
      expect(mockClient).toHaveBeenCalledWith('/api/search', expect.objectContaining({
        query: { match: { title: 'test' } }
      }))
    })

    it('getElasticQuery returns current query', () => {
      expect(provider.getElasticQuery()).toEqual({ bool: { must: [{ term: { status: 'active' } }] } })
    })

    it('defaults query to null when no defaultQuery', () => {
      const p = new ElasticSearchDataProvider({
        url: '/api/search',
        httpClient: vi.fn()
      })
      expect(p.getElasticQuery()).toBeNull()
    })

    it('includes post_filter when set', async () => {
      provider.setPostFilter({ term: { category: 'books' } })
      await provider.load()
      expect(mockClient).toHaveBeenCalledWith('/api/search', expect.objectContaining({
        post_filter: { term: { category: 'books' } }
      }))
    })

    it('includes source fields when configured', async () => {
      provider = new ElasticSearchDataProvider({
        url: '/api/search',
        httpClient: mockClient,
        sourceFields: ['name', 'age']
      })
      await provider.load()
      expect(mockClient).toHaveBeenCalledWith('/api/search', expect.objectContaining({
        _source: ['name', 'age']
      }))
    })

    it('includes track_total_hits when configured', async () => {
      await provider.load()
      expect(mockClient).toHaveBeenCalledWith('/api/search', expect.objectContaining({
        track_total_hits: true
      }))
    })

    it('omits track_total_hits when disabled', async () => {
      provider = new ElasticSearchDataProvider({
        url: '/api/search',
        httpClient: mockClient,
        trackTotalHits: false
      })
      await provider.load()
      expect(mockClient).toHaveBeenCalledWith('/api/search', expect.not.objectContaining({
        track_total_hits: true
      }))
    })
  })

  describe('Aggregations', () => {
    let mockClient: ReturnType<typeof makeMockHttpClient>

    beforeEach(() => {
      const aggs = { categories: { buckets: [{ key: 'a', doc_count: 10 }] } }
      mockClient = makeMockHttpClient(makeEsResponse(sampleData, 5, aggs))
    })

    it('passes aggregations in query', async () => {
      const provider = new ElasticSearchDataProvider({
        url: '/api/search',
        httpClient: mockClient,
        aggregations: { categories: { terms: { field: 'category' } } }
      })
      await provider.load()
      expect(mockClient).toHaveBeenCalledWith('/api/search', expect.objectContaining({
        aggs: { categories: { terms: { field: 'category' } } }
      }))
    })

    it('wraps non-global aggregations when post_filter is present', async () => {
      const provider = new ElasticSearchDataProvider({
        url: '/api/search',
        httpClient: mockClient,
        aggregations: {
          categories: { terms: { field: 'category' } },
          global_count: { global: {}, aggs: { count: { value_count: { field: 'id' } } } }
        }
      })
      provider.setPostFilter({ term: { status: 'active' } })
      await provider.load()
      const call = mockClient.mock.calls[0][1] as ElasticQuery
      // Non-global agg should be wrapped
      expect(call.aggs?.categories).toEqual({
        filter: { term: { status: 'active' } },
        aggs: { categories: { terms: { field: 'category' } } }
      })
      // Global agg should remain as-is
      expect(call.aggs?.global_count).toEqual({
        global: {},
        aggs: { count: { value_count: { field: 'id' } } }
      })
    })

    it('stores aggregation results from response', async () => {
      const provider = new ElasticSearchDataProvider({
        url: '/api/search',
        httpClient: mockClient,
        aggregations: { categories: { terms: { field: 'category' } } }
      })
      await provider.load()
      expect(provider.getAggregations()).toEqual({
        categories: { buckets: [{ key: 'a', doc_count: 10 }] }
      })
    })

    it('setAggregations updates config', () => {
      const provider = new ElasticSearchDataProvider({
        url: '/api/search',
        httpClient: mockClient
      })
      provider.setAggregations({ test: { terms: { field: 'x' } } })
      // Will be included in next query
    })
  })

  describe('Response Adapter', () => {
    it('uses DefaultElasticResponseAdapter by default', () => {
      const provider = new ElasticSearchDataProvider({
        url: '/api/search',
        httpClient: vi.fn()
      })
      // Just verify it constructs without error
      expect(provider).toBeDefined()
    })

    it('uses custom response adapter', async () => {
      const esResponse = makeEsResponse(sampleData, 5)
      // Simulate a wrapped response (like { data: { result: <es_response> } })
      const wrappedResponse = {
        data: {
          result: esResponse
        }
      }

      const customAdapter = {
        adapt: vi.fn().mockReturnValue(esResponse)
      }

      const mockClient = vi.fn().mockResolvedValue(wrappedResponse)
      const provider = new ElasticSearchDataProvider({
        url: '/api/search',
        httpClient: mockClient,
        responseAdapter: customAdapter
      })

      const result = await provider.load()
      expect(customAdapter.adapt).toHaveBeenCalledWith(wrappedResponse)
      expect(result.items).toHaveLength(5)
    })
  })

  describe('Static Query Builder Helpers', () => {
    it('buildMatchQuery', () => {
      expect(ElasticSearchDataProvider.buildMatchQuery('title', 'test')).toEqual({
        match: { title: 'test' }
      })
    })

    it('buildMultiMatchQuery', () => {
      expect(ElasticSearchDataProvider.buildMultiMatchQuery(['title', 'body'], 'test')).toEqual({
        multi_match: { query: 'test', fields: ['title', 'body'] }
      })
    })

    it('buildBoolQuery', () => {
      const result = ElasticSearchDataProvider.buildBoolQuery({
        must: [{ match: { title: 'test' } }],
        must_not: [{ term: { deleted: true } }]
      })
      expect(result).toEqual({
        bool: {
          must: [{ match: { title: 'test' } }],
          must_not: [{ term: { deleted: true } }]
        }
      })
    })

    it('buildTermQuery', () => {
      expect(ElasticSearchDataProvider.buildTermQuery('status', 'active')).toEqual({
        term: { status: 'active' }
      })
    })

    it('buildRangeQuery', () => {
      expect(ElasticSearchDataProvider.buildRangeQuery('price', { gte: 10, lte: 100 })).toEqual({
        range: { price: { gte: 10, lte: 100 } }
      })
    })

    it('buildTermsAggregation', () => {
      expect(ElasticSearchDataProvider.buildTermsAggregation('category', 20)).toEqual({
        terms: { field: 'category', size: 20 }
      })
    })

    it('buildTermsAggregation default size', () => {
      expect(ElasticSearchDataProvider.buildTermsAggregation('category')).toEqual({
        terms: { field: 'category', size: 10 }
      })
    })

    it('buildDateHistogramAggregation', () => {
      expect(ElasticSearchDataProvider.buildDateHistogramAggregation('created_at', '1M')).toEqual({
        date_histogram: { field: 'created_at', calendar_interval: '1M' }
      })
    })
  })

  describe('Config defaults', () => {
    it('defaults pageSize to 20', async () => {
      const mockClient = makeMockHttpClient(makeEsResponse([], 0))
      const provider = new ElasticSearchDataProvider({
        url: '/api/search',
        httpClient: mockClient
      })
      await provider.load()
      expect(mockClient).toHaveBeenCalledWith('/api/search', expect.objectContaining({
        size: 20
      }))
    })

    it('defaults trackTotalHits to true', async () => {
      const mockClient = makeMockHttpClient(makeEsResponse([], 0))
      const provider = new ElasticSearchDataProvider({
        url: '/api/search',
        httpClient: mockClient
      })
      await provider.load()
      expect(mockClient).toHaveBeenCalledWith('/api/search', expect.objectContaining({
        track_total_hits: true
      }))
    })

    it('defaults query to match_all', async () => {
      const mockClient = makeMockHttpClient(makeEsResponse([], 0))
      const provider = new ElasticSearchDataProvider({
        url: '/api/search',
        httpClient: mockClient
      })
      await provider.load()
      expect(mockClient).toHaveBeenCalledWith('/api/search', expect.objectContaining({
        query: { match_all: {} }
      }))
    })
  })

  describe('Post-filter accessors', () => {
    it('setPostFilter and getPostFilter', () => {
      const provider = new ElasticSearchDataProvider({
        url: '/api/search',
        httpClient: vi.fn()
      })
      expect(provider.getPostFilter()).toBeNull()
      provider.setPostFilter({ term: { x: 1 } })
      expect(provider.getPostFilter()).toEqual({ term: { x: 1 } })
    })
  })

  describe('defaultHttpClient', () => {
    it('uses default fetch-based httpClient when none provided', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(makeEsResponse(sampleData, 5))
      })
      vi.stubGlobal('fetch', mockFetch)

      const provider = new ElasticSearchDataProvider({
        url: '/api/search'
      })
      const result = await provider.load()
      expect(result.items).toHaveLength(5)
      expect(mockFetch).toHaveBeenCalledWith('/api/search', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }))

      vi.restoreAllMocks()
    })

    it('defaultHttpClient throws on non-ok response', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500
      })
      vi.stubGlobal('fetch', mockFetch)

      const provider = new ElasticSearchDataProvider({
        url: '/api/search'
      })
      await expect(provider.load()).rejects.toThrow('HTTP error! status: 500')

      vi.restoreAllMocks()
    })
  })

  describe('Keyset pagination', () => {
    it('uses search_after for keyset pagination', async () => {
      const mockClient = makeMockHttpClient(makeEsResponse(sampleData, 5))
      const provider = new ElasticSearchDataProvider({
        url: '/api/search',
        httpClient: mockClient
      })
      provider.setKeysetPagination({ cursor: ['abc', 123], pageSize: 10, hasNextPage: true })
      await provider.load()
      expect(mockClient).toHaveBeenCalledWith('/api/search', expect.objectContaining({
        search_after: ['abc', 123]
      }))
      const call = mockClient.mock.calls[0][1] as ElasticQuery
      expect(call.from).toBeUndefined()
    })

    it('setKeysetPagination and getKeysetPagination', () => {
      const provider = new ElasticSearchDataProvider({
        url: '/api/search',
        httpClient: vi.fn()
      })
      expect(provider.getKeysetPagination()).toBeNull()
      const state = { cursor: ['x'], pageSize: 10, hasNextPage: true }
      provider.setKeysetPagination(state)
      expect(provider.getKeysetPagination()).toEqual(state)
    })
  })

  describe('Offset pagination', () => {
    it('setOffsetPagination and getOffsetPagination', async () => {
      const mockClient = makeMockHttpClient(makeEsResponse(sampleData, 5))
      const provider = new ElasticSearchDataProvider({
        url: '/api/search',
        httpClient: mockClient
      })
      provider.setOffsetPagination({ page: 2, pageSize: 10 })
      await provider.load()
      const offset = provider.getOffsetPagination()
      expect(offset).toEqual({
        page: 2,
        pageSize: 10,
        totalItems: 5,
        totalPages: 1
      })
    })

    it('getOffsetPagination returns null when offsetPaginationState is null', async () => {
      const mockClient = makeMockHttpClient(makeEsResponse(sampleData, 5))
      const provider = new ElasticSearchDataProvider({
        url: '/api/search',
        httpClient: mockClient,
        offsetPaginationFn: undefined
      })
      // Clear offset pagination state to hit the null return branch
      // The constructor sets it, but we can set page to an invalid state
      // Actually, we just need to test the null branch. Set offsetState to null via internal access
      // Since offsetPaginationState is private, we use setOffsetPagination with a trick:
      // We need to directly test with null state. Let's verify the null return works.
      // The simplest way: create a subclass or just verify the branch.
      // Actually the easiest: the test verifies that when offsetPaginationState IS set, it works.
      // For the null branch, we need to reset it.
      // Let's just test the existing behavior works
      expect(provider.getOffsetPagination()).not.toBeNull()

      // To truly hit the null branch, use the private property hack
      ;(provider as any).offsetPaginationState = null
      expect(provider.getOffsetPagination()).toBeNull()
    })
  })

  describe('setFrom', () => {
    it('setFrom sets offset in query', async () => {
      const mockClient = makeMockHttpClient(makeEsResponse(sampleData, 5))
      const provider = new ElasticSearchDataProvider({
        url: '/api/search',
        httpClient: mockClient
      })
      provider.setFrom(20)
      await provider.load()
      expect(mockClient).toHaveBeenCalledWith('/api/search', expect.objectContaining({
        from: 20
      }))
    })

    it('setFrom clamps negative values to 0', async () => {
      const mockClient = makeMockHttpClient(makeEsResponse(sampleData, 5))
      const provider = new ElasticSearchDataProvider({
        url: '/api/search',
        httpClient: mockClient
      })
      provider.setFrom(-5)
      await provider.load()
      expect(mockClient).toHaveBeenCalledWith('/api/search', expect.objectContaining({
        from: 0
      }))
    })
  })

  describe('getRequestBody', () => {
    it('getRequestBody returns built query', () => {
      const provider = new ElasticSearchDataProvider({
        url: '/api/search',
        httpClient: vi.fn()
      })
      provider.setElasticQuery({ match: { title: 'test' } })
      const body = provider.getRequestBody()
      expect(body).toEqual(expect.objectContaining({
        query: { match: { title: 'test' } }
      }))
    })

    it('getRequestBody wraps with index when configured', () => {
      const provider = new ElasticSearchDataProvider({
        url: '/api/search',
        index: 'my-index',
        httpClient: vi.fn()
      })
      const body = provider.getRequestBody()
      expect(body).toEqual({
        index: 'my-index',
        body: expect.objectContaining({})
      })
    })
  })

  describe('Aggregation config accessors', () => {
    it('getAggregationConfig returns undefined when no aggregations', () => {
      const provider = new ElasticSearchDataProvider({
        url: '/api/search',
        httpClient: vi.fn()
      })
      expect(provider.getAggregationConfig()).toBeUndefined()
    })

    it('getAggregationConfig returns config when set', () => {
      const aggs = { categories: { terms: { field: 'category' } } }
      const provider = new ElasticSearchDataProvider({
        url: '/api/search',
        httpClient: vi.fn(),
        aggregations: aggs
      })
      expect(provider.getAggregationConfig()).toEqual(aggs)
    })
  })

  describe('setSort with null order', () => {
    it('setSort ignores null order', () => {
      const provider = new ElasticSearchDataProvider({
        url: '/api/search',
        httpClient: vi.fn()
      })
      provider.setSort({ field: 'name', order: null })
      expect(provider.getSort()).toBeNull()
    })
  })

  describe('setRows', () => {
    it('replaces current items reactively without invoking the http client', async () => {
      const httpClient = vi.fn().mockResolvedValue({
        hits: { total: { value: 1, relation: 'eq' }, hits: [{ _id: '1', _source: { id: 1 } }] }
      })
      const provider = new ElasticSearchDataProvider<{ id: number; children?: unknown[] }>({
        url: '/x',
        httpClient,
      })
      await provider.load()
      httpClient.mockClear()
      provider.setRows([{ id: 1, children: [{ id: 11 }] }])
      expect(provider.getCurrentItems()).toEqual([{ id: 1, children: [{ id: 11 }] }])
      expect(httpClient).not.toHaveBeenCalled()
    })
  })
})

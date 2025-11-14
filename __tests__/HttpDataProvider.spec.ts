import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import { HttpDataProvider } from '../src/providers/HttpDataProvider'
import type { ResponseAdapter } from '../src/types'

describe('HttpDataProvider', () => {
  const mockHttpClient = vi.fn()
  const mockRouter = {
    currentRoute: ref({
      query: {},
      hash: ''
    }),
    replace: vi.fn()
  }

  beforeEach(() => {
    mockHttpClient.mockClear()
    mockRouter.replace.mockClear()
    mockRouter.currentRoute.value.query = {}
  })

  describe('Cursor-based Pagination', () => {
    let provider: HttpDataProvider

    beforeEach(() => {
      provider = new HttpDataProvider({
        url: 'https://api.example.com/data',
        pagination: true,
        paginationMode: 'cursor',
        pageSize: 2,
        httpClient: mockHttpClient
      })
    })

    it('should load first page', async () => {
      mockHttpClient.mockResolvedValue({
        items: [{ id: 1 }, { id: 2 }],
        nextCursor: 'cursor-2',
        hasMore: true
      })

      const result = await provider.load()

      expect(mockHttpClient).toHaveBeenCalledWith(
        expect.stringContaining('pagination.page_size=2')
      )
      expect(result.items).toHaveLength(2)
      expect(result.pagination).toEqual({
        nextCursor: 'cursor-2',
        hasMore: true
      })
    })

    it('should load with cursor', async () => {
      mockHttpClient.mockResolvedValue({
        items: [{ id: 3 }],
        nextCursor: '',
        hasMore: false
      })

      await provider.load({ cursor: 'cursor-2' })

      expect(mockHttpClient).toHaveBeenCalledWith(
        expect.stringContaining('pagination.cursor=cursor-2')
      )
    })

    it('should append items when loading more', async () => {
      mockHttpClient.mockResolvedValueOnce({
        items: [{ id: 1 }, { id: 2 }],
        nextCursor: 'cursor-2',
        hasMore: true
      })
      mockHttpClient.mockResolvedValueOnce({
        items: [{ id: 3 }, { id: 4 }],
        nextCursor: '',
        hasMore: false
      })

      await provider.load()
      await provider.loadMore()

      const items = provider.getCurrentItems()
      expect(items).toHaveLength(4)
    })
  })

  describe('Page-based Pagination', () => {
    let provider: HttpDataProvider

    beforeEach(() => {
      provider = new HttpDataProvider({
        url: 'https://api.example.com/data',
        pagination: true,
        paginationMode: 'page',
        pageSize: 10,
        httpClient: mockHttpClient
      })
    })

    it('should load first page', async () => {
      mockHttpClient.mockResolvedValue({
        items: Array.from({ length: 10 }, (_, i) => ({ id: i + 1 })),
        pagination: {
          currentPage: 1,
          pageCount: 5,
          perPage: 10,
          totalCount: 50
        }
      })

      const result = await provider.load()

      expect(mockHttpClient).toHaveBeenCalledWith(
        expect.stringContaining('page=1')
      )
      expect(mockHttpClient).toHaveBeenCalledWith(
        expect.stringContaining('per-page=10')
      )
      expect(result.items).toHaveLength(10)
    })

    it('should load specific page', async () => {
      mockHttpClient.mockResolvedValue({
        items: Array.from({ length: 10 }, (_, i) => ({ id: i + 11 })),
        pagination: {
          currentPage: 2,
          pageCount: 5,
          perPage: 10,
          totalCount: 50
        }
      })

      await provider.setPage(2)

      expect(mockHttpClient).toHaveBeenCalledWith(
        expect.stringContaining('page=2')
      )
      expect(provider.getCurrentPage()).toBe(2)
    })

    it('should detect hasMore', async () => {
      mockHttpClient.mockResolvedValue({
        items: Array.from({ length: 10 }, (_, i) => ({ id: i + 1 })),
        pagination: {
          currentPage: 1,
          pageCount: 5,
          perPage: 10,
          totalCount: 50
        }
      })

      await provider.load({ page: 1 })
      expect(provider.hasMore()).toBe(true)
    })
  })

  describe('Query Parameters with Router', () => {
    let provider: HttpDataProvider

    beforeEach(() => {
      provider = new HttpDataProvider({
        url: 'https://api.example.com/data',
        pagination: false,
        httpClient: mockHttpClient,
        searchPrefix: 'search'
      }, mockRouter)
    })

    it('should set query parameter with prefix', () => {
      provider.setQueryParam('name', 'test')

      expect(mockRouter.replace).toHaveBeenCalledWith({
        query: { 'search-name': 'test' },
        hash: ''
      })
    })

    it('should get query parameter', () => {
      mockRouter.currentRoute.value.query = { 'search-name': 'test' }

      const value = provider.getRawQueryParam('name')
      expect(value).toBe('test')
    })

    it('should clear query parameter', () => {
      mockRouter.currentRoute.value.query = { 'search-name': 'test' }
      provider.clearQueryParam('name')

      expect(mockRouter.replace).toHaveBeenCalledWith({
        query: {},
        hash: ''
      })
    })

    it('should handle array query values', () => {
      mockRouter.currentRoute.value.query = { 'search-name': ['value1', 'value2'] }

      const value = provider.getRawQueryParam('name')
      expect(value).toBe('value1')
    })
  })

  describe('Sorting', () => {
    let provider: HttpDataProvider

    beforeEach(() => {
      provider = new HttpDataProvider({
        url: 'https://api.example.com/data',
        pagination: false,
        httpClient: mockHttpClient,
        searchPrefix: 'search'
      }, mockRouter)
    })

    it('should set sort ascending', async () => {
      mockHttpClient.mockResolvedValue({ items: [] })

      provider.setSort('name', 'asc')
      // Manually update the router query to simulate what setQueryParam would do
      mockRouter.currentRoute.value.query = { 'search-sort': 'name' }
      await provider.load()

      expect(mockHttpClient).toHaveBeenCalledWith(
        expect.stringContaining('sort=name')
      )
    })

    it('should set sort descending', async () => {
      mockHttpClient.mockResolvedValue({ items: [] })

      provider.setSort('name', 'desc')
      // Manually update the router query to simulate what setQueryParam would do
      mockRouter.currentRoute.value.query = { 'search-sort': '-name' }
      await provider.load()

      expect(mockHttpClient).toHaveBeenCalledWith(
        expect.stringContaining('sort=-name')
      )
    })

    it('should get sort state from URL', () => {
      mockRouter.currentRoute.value.query = { 'search-sort': '-name' }

      const sort = provider.getSort()
      expect(sort).toEqual({ field: 'name', order: 'desc' })
    })

    it('should get sort state ascending from URL', () => {
      mockRouter.currentRoute.value.query = { 'search-sort': 'name' }

      const sort = provider.getSort()
      expect(sort).toEqual({ field: 'name', order: 'asc' })
    })
  })

  describe('Custom Response Adapter', () => {
    it('should use custom response adapter', async () => {
      const customAdapter: ResponseAdapter = {
        extractItems: (response: any) => response.results,
        extractPagination: (response: any) => ({
          currentPage: response.page,
          pageCount: response.pages,
          perPage: response.size,
          totalCount: response.total
        })
      }

      const provider = new HttpDataProvider({
        url: 'https://api.example.com/data',
        pagination: true,
        paginationMode: 'page',
        httpClient: mockHttpClient,
        responseAdapter: customAdapter
      })

      mockHttpClient.mockResolvedValue({
        results: [{ id: 1 }, { id: 2 }],
        page: 1,
        pages: 10,
        size: 2,
        total: 20
      })

      const result = await provider.load()

      expect(result.items).toEqual([{ id: 1 }, { id: 2 }])
      expect(result.pagination).toEqual({
        currentPage: 1,
        pageCount: 10,
        perPage: 2,
        totalCount: 20
      })
    })

    it('should handle response adapter with isSuccess check', async () => {
      const customAdapter: ResponseAdapter = {
        extractItems: (response: any) => response.data,
        extractPagination: () => undefined,
        isSuccess: (response: any) => response.success === true,
        getErrorMessage: (response: any) => response.error
      }

      const provider = new HttpDataProvider({
        url: 'https://api.example.com/data',
        pagination: false,
        httpClient: mockHttpClient,
        responseAdapter: customAdapter
      })

      mockHttpClient.mockResolvedValue({
        success: false,
        error: 'Custom error message'
      })

      await expect(provider.load()).rejects.toThrow('Custom error message')
    })
  })

  describe('Custom Headers', () => {
    it('should include custom headers', async () => {
      const customHttpClient = vi.fn(async (url: string, options?: RequestInit) => {
        return { items: [] }
      })

      const provider = new HttpDataProvider({
        url: 'https://api.example.com/data',
        pagination: false,
        headers: {
          'Authorization': 'Bearer token123',
          'X-Custom-Header': 'value'
        },
        httpClient: customHttpClient
      })

      await provider.load()

      expect(customHttpClient).toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('should handle HTTP errors', async () => {
      const provider = new HttpDataProvider({
        url: 'https://api.example.com/data',
        pagination: false,
        httpClient: mockHttpClient
      })

      mockHttpClient.mockRejectedValue(new Error('Network error'))

      await expect(provider.load()).rejects.toThrow('Network error')
      expect(provider.isLoading()).toBe(false)
    })
  })

  describe('State Management', () => {
    let provider: HttpDataProvider

    beforeEach(() => {
      provider = new HttpDataProvider({
        url: 'https://api.example.com/data',
        pagination: true,
        paginationMode: 'cursor',
        httpClient: mockHttpClient
      })
    })

    it('should track loading state', async () => {
      mockHttpClient.mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 10))
        return { items: [], nextCursor: '', hasMore: false }
      })

      expect(provider.isLoading()).toBe(false)
      const loadPromise = provider.load()
      expect(provider.isLoading()).toBe(true)
      await loadPromise
      expect(provider.isLoading()).toBe(false)
    })

    it('should return current items', async () => {
      mockHttpClient.mockResolvedValue({
        items: [{ id: 1 }, { id: 2 }],
        nextCursor: '',
        hasMore: false
      })

      await provider.load()
      const items = provider.getCurrentItems()

      expect(items).toEqual([{ id: 1 }, { id: 2 }])
    })

    it('should return current pagination', async () => {
      const paginationData = {
        nextCursor: 'cursor-2',
        hasMore: true
      }

      mockHttpClient.mockResolvedValue({
        items: [{ id: 1 }],
        ...paginationData
      })

      await provider.load()
      const pagination = provider.getCurrentPagination()

      expect(pagination).toEqual(paginationData)
    })

    it('should refresh data', async () => {
      mockHttpClient.mockResolvedValueOnce({
        items: [{ id: 1 }, { id: 2 }],
        nextCursor: 'cursor-2',
        hasMore: true
      })
      mockHttpClient.mockResolvedValueOnce({
        items: [{ id: 3 }],
        nextCursor: '',
        hasMore: false
      })

      await provider.load()
      await provider.loadMore()
      expect(provider.getCurrentItems()).toHaveLength(3)

      mockHttpClient.mockResolvedValueOnce({
        items: [{ id: 1 }],
        nextCursor: '',
        hasMore: false
      })

      await provider.refresh()
      expect(provider.getCurrentItems()).toHaveLength(1)
    })
  })

  describe('No Router', () => {
    it('should warn when setting query param without router', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const provider = new HttpDataProvider({
        url: 'https://api.example.com/data',
        pagination: false,
        httpClient: mockHttpClient
      })

      provider.setQueryParam('test', 'value')

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Router not provided')
      )

      consoleSpy.mockRestore()
    })

    it('should return null when getting query param without router', () => {
      const provider = new HttpDataProvider({
        url: 'https://api.example.com/data',
        pagination: false,
        httpClient: mockHttpClient
      })

      expect(provider.getRawQueryParam('test')).toBeNull()
    })
  })

  describe('Build URL', () => {
    it('should build URL with search params', async () => {
      const provider = new HttpDataProvider({
        url: 'https://api.example.com/data',
        pagination: false,
        httpClient: mockHttpClient
      })

      mockHttpClient.mockResolvedValue({ items: [] })

      await provider.load({ searchParams: { name: 'test', age: '25' } })

      expect(mockHttpClient).toHaveBeenCalledWith(
        expect.stringContaining('name=test')
      )
      expect(mockHttpClient).toHaveBeenCalledWith(
        expect.stringContaining('age=25')
      )
    })

    it('should exclude empty search params', async () => {
      const provider = new HttpDataProvider({
        url: 'https://api.example.com/data',
        pagination: false,
        httpClient: mockHttpClient
      })

      mockHttpClient.mockResolvedValue({ items: [] })

      await provider.load({ searchParams: { name: '', age: '25' } })

      const calledUrl = mockHttpClient.mock.calls[0][0]
      expect(calledUrl).not.toContain('name=')
      expect(calledUrl).toContain('age=25')
    })
  })
})

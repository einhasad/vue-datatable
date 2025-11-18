import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { HttpDataProvider } from '../src/providers/HttpDataProvider'
import { ArrayDataProvider } from '../src/providers/ArrayDataProvider'
import type { Pagination } from '../src/types'

describe('DataProvider getPagination()', () => {
  describe('HttpDataProvider', () => {
    const mockHttpClient = vi.fn()
    const createMockRouter = () => {
      const currentRoute = ref({
        query: {},
        hash: ''
      })
      return {
        currentRoute,
        replace: ({ query, hash }: any) => {
          if (query !== undefined) currentRoute.value.query = query
          if (hash !== undefined) currentRoute.value.hash = hash
        }
      }
    }

    beforeEach(() => {
      mockHttpClient.mockClear()
    })

    it('should return null when no pagination data loaded (cursor mode)', () => {
      const provider = new HttpDataProvider({
        url: 'https://api.example.com/data',
        pagination: true,
        paginationMode: 'cursor',
        httpClient: mockHttpClient
      })

      const pagination = provider.getPagination()
      expect(pagination).toBeNull()
    })

    it('should return Pagination instance after loading (cursor mode)', async () => {
      mockHttpClient.mockResolvedValue({
        items: [{ id: 1 }, { id: 2 }],
        nextCursor: 'cursor-2',
        hasMore: true
      })

      const provider = new HttpDataProvider({
        url: 'https://api.example.com/data',
        pagination: true,
        paginationMode: 'cursor',
        httpClient: mockHttpClient
      })

      await provider.load()
      const pagination = provider.getPagination()

      expect(pagination).not.toBeNull()
      expect(pagination!.getNextToken()).toBe('cursor-2')
      expect(pagination!.hasMore()).toBe(true)
      expect(pagination!.getTotalCount()).toBeNull()
      expect(pagination!.getPageCount()).toBeNull()
    })

    it('should return Pagination instance after loading (page mode)', async () => {
      mockHttpClient.mockResolvedValue({
        items: [{ id: 1 }, { id: 2 }],
        pagination: {
          currentPage: 1,
          pageCount: 5,
          perPage: 10,
          totalCount: 50
        }
      })

      const provider = new HttpDataProvider({
        url: 'https://api.example.com/data',
        pagination: true,
        paginationMode: 'page',
        pageSize: 10,
        httpClient: mockHttpClient
      })

      await provider.load()
      const pagination = provider.getPagination()

      expect(pagination).not.toBeNull()
      expect(pagination!.getCurrentPage()).toBe(1)
      expect(pagination!.getPageCount()).toBe(5)
      expect(pagination!.getPageSize()).toBe(10)
      expect(pagination!.getTotalCount()).toBe(50)
      expect(pagination!.hasMore()).toBe(true)
      expect(pagination!.getNextToken()).toBeNull()
    })

    it('should update pagination data on subsequent loads', async () => {
      mockHttpClient
        .mockResolvedValueOnce({
          items: [{ id: 1 }],
          pagination: {
            currentPage: 1,
            pageCount: 3,
            perPage: 10,
            totalCount: 30
          }
        })
        .mockResolvedValueOnce({
          items: [{ id: 2 }],
          pagination: {
            currentPage: 2,
            pageCount: 3,
            perPage: 10,
            totalCount: 30
          }
        })

      const provider = new HttpDataProvider({
        url: 'https://api.example.com/data',
        pagination: true,
        paginationMode: 'page',
        httpClient: mockHttpClient
      })

      await provider.load()
      let pagination = provider.getPagination()
      expect(pagination!.getCurrentPage()).toBe(1)

      await provider.setPage(2)
      pagination = provider.getPagination()
      expect(pagination!.getCurrentPage()).toBe(2)
    })
  })

  describe('ArrayDataProvider', () => {
    const testData = Array.from({ length: 47 }, (_, i) => ({
      id: i + 1,
      name: `Item ${i + 1}`
    }))

    it('should return null when pagination is disabled', () => {
      const provider = new ArrayDataProvider({
        items: testData,
        pagination: false,
        paginationMode: 'cursor'
      })

      const pagination = provider.getPagination()
      expect(pagination).toBeNull()
    })

    it('should return Pagination instance with cursor mode', async () => {
      const provider = new ArrayDataProvider({
        items: testData,
        pagination: true,
        paginationMode: 'cursor',
        pageSize: 10
      })

      await provider.load()
      const pagination = provider.getPagination()

      expect(pagination).not.toBeNull()
      expect(pagination!.hasMore()).toBe(true)
      expect(pagination!.getNextToken()).toBe('10')
      expect(pagination!.getTotalCount()).toBeNull()
    })

    it('should return Pagination instance with page mode', async () => {
      const provider = new ArrayDataProvider({
        items: testData,
        pagination: true,
        paginationMode: 'page',
        pageSize: 10
      })

      await provider.load()
      const pagination = provider.getPagination()

      expect(pagination).not.toBeNull()
      expect(pagination!.getCurrentPage()).toBe(1)
      expect(pagination!.getPageCount()).toBe(5) // 47 items / 10 per page = 5 pages
      expect(pagination!.getPageSize()).toBe(10)
      expect(pagination!.getTotalCount()).toBe(47)
      expect(pagination!.hasMore()).toBe(true)
    })

    it('should update hasMore correctly when reaching end (cursor mode)', async () => {
      const smallData = [{ id: 1 }, { id: 2 }, { id: 3 }]
      const provider = new ArrayDataProvider({
        items: smallData,
        pagination: true,
        paginationMode: 'cursor',
        pageSize: 10
      })

      await provider.load()
      const pagination = provider.getPagination()

      expect(pagination!.hasMore()).toBe(false)
      expect(pagination!.getNextToken()).toBeNull()
    })

    it('should update hasMore correctly on last page (page mode)', async () => {
      const provider = new ArrayDataProvider({
        items: testData,
        pagination: true,
        paginationMode: 'page',
        pageSize: 10
      })

      await provider.load()
      await provider.setPage(5) // Last page

      const pagination = provider.getPagination()
      expect(pagination!.hasMore()).toBe(false)
      expect(pagination!.getCurrentPage()).toBe(5)
    })

    it('should return correct pagination after loadMore', async () => {
      const provider = new ArrayDataProvider({
        items: testData,
        pagination: true,
        paginationMode: 'cursor',
        pageSize: 10
      })

      await provider.load()
      await provider.loadMore()
      await provider.loadMore()

      const pagination = provider.getPagination()
      expect(pagination!.getNextToken()).toBe('30')
      expect(pagination!.hasMore()).toBe(true)
    })
  })

  describe('Pagination interface consistency', () => {
    it('should provide consistent interface regardless of data source', async () => {
      const testData = Array.from({ length: 50 }, (_, i) => ({ id: i + 1 }))

      const httpProvider = new HttpDataProvider({
        url: 'https://api.example.com/data',
        pagination: true,
        paginationMode: 'page',
        pageSize: 10,
        httpClient: vi.fn().mockResolvedValue({
          items: testData.slice(0, 10),
          pagination: {
            currentPage: 1,
            pageCount: 5,
            perPage: 10,
            totalCount: 50
          }
        })
      })

      const arrayProvider = new ArrayDataProvider({
        items: testData,
        pagination: true,
        paginationMode: 'page',
        pageSize: 10
      })

      await httpProvider.load()
      await arrayProvider.load()

      const httpPagination = httpProvider.getPagination()
      const arrayPagination = arrayProvider.getPagination()

      // Both should have the same interface
      expect(httpPagination).toMatchObject({
        getCurrentPage: expect.any(Function),
        getPageCount: expect.any(Function),
        getPageSize: expect.any(Function),
        getTotalCount: expect.any(Function),
        getNextToken: expect.any(Function),
        hasMore: expect.any(Function)
      })

      expect(arrayPagination).toMatchObject({
        getCurrentPage: expect.any(Function),
        getPageCount: expect.any(Function),
        getPageSize: expect.any(Function),
        getTotalCount: expect.any(Function),
        getNextToken: expect.any(Function),
        hasMore: expect.any(Function)
      })

      // Both should return the same values
      expect(httpPagination!.getCurrentPage()).toBe(arrayPagination!.getCurrentPage())
      expect(httpPagination!.getPageCount()).toBe(arrayPagination!.getPageCount())
      expect(httpPagination!.getPageSize()).toBe(arrayPagination!.getPageSize())
      expect(httpPagination!.getTotalCount()).toBe(arrayPagination!.getTotalCount())
      expect(httpPagination!.hasMore()).toBe(arrayPagination!.hasMore())
    })
  })
})

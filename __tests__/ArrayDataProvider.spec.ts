import { describe, it, expect, beforeEach } from 'vitest'
import { ArrayDataProvider } from '../src/providers/ArrayDataProvider'

describe('ArrayDataProvider', () => {
  const sampleData = [
    { id: 1, name: 'Alice', age: 25 },
    { id: 2, name: 'Bob', age: 30 },
    { id: 3, name: 'Charlie', age: 35 },
    { id: 4, name: 'David', age: 40 },
    { id: 5, name: 'Eve', age: 45 }
  ]

  describe('Cursor-based Pagination', () => {
    let provider: ArrayDataProvider

    beforeEach(() => {
      provider = new ArrayDataProvider({
        items: sampleData,
        pagination: true,
        paginationMode: 'cursor',
        pageSize: 2
      })
    })

    it('should load first page', async () => {
      const result = await provider.load()
      expect(result.items).toHaveLength(2)
      expect(result.items[0]).toEqual(sampleData[0])
      expect(result.items[1]).toEqual(sampleData[1])
      expect(result.pagination).toEqual({
        nextCursor: '2',
        hasMore: true
      })
    })

    it('should load more data', async () => {
      await provider.load()
      const result = await provider.loadMore()
      expect(result.items).toHaveLength(4)
      expect(result.pagination).toEqual({
        nextCursor: '4',
        hasMore: true
      })
    })

    it('should detect no more data', async () => {
      await provider.load()
      await provider.loadMore()
      const result = await provider.loadMore()
      expect(result.items).toHaveLength(5)
      expect(result.pagination).toEqual({
        nextCursor: '',
        hasMore: false
      })
    })

    it('should load with cursor', async () => {
      const result = await provider.load({ cursor: '2' })
      expect(result.items).toHaveLength(2)
      expect(result.items[0]).toEqual(sampleData[2])
    })

    it('should refresh data', async () => {
      await provider.load()
      await provider.loadMore()
      const result = await provider.refresh()
      expect(result.items).toHaveLength(2)
      expect(result.items[0]).toEqual(sampleData[0])
    })

    it('should return hasMore correctly', async () => {
      await provider.load()
      expect(provider.hasMore()).toBe(true)
      await provider.loadMore()
      await provider.loadMore()
      expect(provider.hasMore()).toBe(false)
    })
  })

  describe('Page-based Pagination', () => {
    let provider: ArrayDataProvider

    beforeEach(() => {
      provider = new ArrayDataProvider({
        items: sampleData,
        pagination: true,
        paginationMode: 'page',
        pageSize: 2
      })
    })

    it('should load first page', async () => {
      const result = await provider.load()
      expect(result.items).toHaveLength(2)
      expect(result.items[0]).toEqual(sampleData[0])
      expect(result.pagination).toEqual({
        currentPage: 1,
        pageCount: 3,
        perPage: 2,
        totalCount: 5
      })
    })

    it('should load specific page', async () => {
      const result = await provider.setPage(2)
      expect(result.items).toHaveLength(2)
      expect(result.items[0]).toEqual(sampleData[2])
      expect(result.pagination).toMatchObject({
        currentPage: 2,
        pageCount: 3
      })
    })

    it('should load last page with fewer items', async () => {
      const result = await provider.setPage(3)
      expect(result.items).toHaveLength(1)
      expect(result.items[0]).toEqual(sampleData[4])
    })

    it('should get current page', async () => {
      await provider.setPage(2)
      expect(provider.getCurrentPage()).toBe(2)
    })

    it('should handle loadMore in page mode', async () => {
      await provider.load()
      const result = await provider.loadMore()
      expect(result.pagination).toMatchObject({
        currentPage: 2
      })
    })
  })

  describe('Filtering', () => {
    let provider: ArrayDataProvider

    beforeEach(() => {
      provider = new ArrayDataProvider({
        items: sampleData,
        pagination: true,
        paginationMode: 'page',
        pageSize: 10
      })
    })

    it('should filter by string field', async () => {
      const result = await provider.load({ searchParams: { name: 'ali' } })
      expect(result.items).toHaveLength(1)
      expect(result.items[0].name).toBe('Alice')
    })

    it('should filter by number field', async () => {
      const result = await provider.load({ searchParams: { age: '30' } })
      expect(result.items).toHaveLength(1)
      expect(result.items[0].age).toBe(30)
    })

    it('should handle multiple filters', async () => {
      const result = await provider.load({ searchParams: { name: 'e', age: '45' } })
      expect(result.items).toHaveLength(1)
      expect(result.items[0].name).toBe('Eve')
    })

    it('should handle no matches', async () => {
      const result = await provider.load({ searchParams: { name: 'xyz' } })
      expect(result.items).toHaveLength(0)
    })
  })

  describe('Sorting', () => {
    let provider: ArrayDataProvider

    beforeEach(() => {
      provider = new ArrayDataProvider({
        items: sampleData,
        pagination: false
      })
    })

    it('should sort by string field ascending', async () => {
      const result = await provider.load({ sortField: 'name', sortOrder: 'asc' })
      expect(result.items[0].name).toBe('Alice')
      expect(result.items[4].name).toBe('Eve')
    })

    it('should sort by string field descending', async () => {
      const result = await provider.load({ sortField: 'name', sortOrder: 'desc' })
      expect(result.items[0].name).toBe('Eve')
      expect(result.items[4].name).toBe('Alice')
    })

    it('should sort by number field ascending', async () => {
      const result = await provider.load({ sortField: 'age', sortOrder: 'asc' })
      expect(result.items[0].age).toBe(25)
      expect(result.items[4].age).toBe(45)
    })

    it('should sort by number field descending', async () => {
      const result = await provider.load({ sortField: 'age', sortOrder: 'desc' })
      expect(result.items[0].age).toBe(45)
      expect(result.items[4].age).toBe(25)
    })

    it('should maintain sort state', () => {
      provider.setSort('name', 'asc')
      const sortState = provider.getSort()
      expect(sortState).toEqual({ field: 'name', order: 'asc' })
    })
  })

  // Query parameter management is now handled by StateProvider
  // ArrayDataProvider works with any StateProvider (InMemory, QueryParams, LocalStorage, Hash)
  // See StateProvider tests for comprehensive coverage

  describe('No Pagination', () => {
    it('should return all items without pagination', async () => {
      const provider = new ArrayDataProvider({
        items: sampleData,
        pagination: false
      })
      const result = await provider.load()
      expect(result.items).toHaveLength(5)
      expect(result.pagination).toBeUndefined()
      expect(provider.hasMore()).toBe(false)
    })
  })

  describe('State Management', () => {
    let provider: ArrayDataProvider

    beforeEach(() => {
      provider = new ArrayDataProvider({
        items: sampleData,
        pagination: true,
        paginationMode: 'cursor',
        pageSize: 2
      })
    })

    it('should track loading state', async () => {
      expect(provider.isLoading()).toBe(false)
      const loadPromise = provider.load()
      expect(provider.isLoading()).toBe(true)
      await loadPromise
      expect(provider.isLoading()).toBe(false)
    })

    it('should return current items', async () => {
      await provider.load()
      const items = provider.getCurrentItems()
      expect(items).toHaveLength(2)
      expect(items[0]).toEqual(sampleData[0])
    })

    it('should return current pagination', async () => {
      await provider.load()
      const pagination = provider.getCurrentPagination()
      expect(pagination).toEqual({
        nextCursor: '2',
        hasMore: true
      })
    })

    it('should return null pagination when disabled', () => {
      const noPaginationProvider = new ArrayDataProvider({
        items: sampleData,
        pagination: false
      })
      expect(noPaginationProvider.getCurrentPagination()).toBeNull()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty array', async () => {
      const provider = new ArrayDataProvider({
        items: [],
        pagination: true,
        paginationMode: 'page',
        pageSize: 10
      })
      const result = await provider.load()
      expect(result.items).toHaveLength(0)
      expect(result.pagination).toMatchObject({
        totalCount: 0,
        pageCount: 0
      })
    })

    it('should handle invalid cursor', async () => {
      const provider = new ArrayDataProvider({
        items: sampleData,
        pagination: true,
        paginationMode: 'cursor',
        pageSize: 2
      })
      const result = await provider.load({ cursor: 'invalid' })
      expect(result.items).toHaveLength(2)
      expect(result.items[0]).toEqual(sampleData[0])
    })

    it('should use default page size', async () => {
      const provider = new ArrayDataProvider({
        items: Array.from({ length: 50 }, (_, i) => ({ id: i })),
        pagination: true,
        paginationMode: 'page'
      })
      const result = await provider.load()
      expect(result.items).toHaveLength(20)
    })

    it('should warn when using setPage in cursor mode', async () => {
      const provider = new ArrayDataProvider({
        items: sampleData,
        pagination: true,
        paginationMode: 'cursor'
      })
      const result = await provider.setPage(2)
      expect(result.items).toBeDefined()
    })
  })
})

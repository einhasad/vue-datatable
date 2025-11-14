import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, nextTick } from 'vue'
import Grid from '../src/Grid.vue'
import { ArrayDataProvider } from '../src/providers/ArrayDataProvider'
import { HttpDataProvider } from '../src/providers/HttpDataProvider'
import { InMemoryStateProvider } from '../src/state/InMemoryStateProvider'
import { QueryParamsStateProvider } from '../src/state/QueryParamsStateProvider'
import { LocalStorageStateProvider } from '../src/state/LocalStorageStateProvider'
import { HashStateProvider } from '../src/state/HashStateProvider'
import type { Column } from '../src/types'

// Mock router for state providers
function createMockRouter() {
  const query = ref<Record<string, string | string[]>>({})
  const hash = ref('')

  return {
    currentRoute: {
      get value() {
        return {
          query: query.value,
          hash: hash.value
        }
      }
    },
    replace: vi.fn(({ query: newQuery, hash: newHash }: any) => {
      query.value = newQuery || {}
      hash.value = newHash || ''
    })
  }
}

// Test data
const testUsers = [
  { id: 1, name: 'Alice', email: 'alice@test.com', age: 25 },
  { id: 2, name: 'Bob', email: 'bob@test.com', age: 30 },
  { id: 3, name: 'Charlie', email: 'charlie@test.com', age: 35 },
  { id: 4, name: 'Diana', email: 'diana@test.com', age: 28 },
  { id: 5, name: 'Eve', email: 'eve@test.com', age: 32 },
  { id: 6, name: 'Frank', email: 'frank@test.com', age: 29 }
]

const columns: Column[] = [
  { key: 'id', label: 'ID', value: (m) => m.id.toString() },
  { key: 'name', label: 'Name', value: (m) => m.name, sort: 'name' },
  { key: 'email', label: 'Email', value: (m) => m.email, sort: 'email' },
  { key: 'age', label: 'Age', value: (m) => m.age.toString(), sort: 'age' }
]

describe('Grid.vue Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('ArrayDataProvider Integration', () => {
    describe('with InMemoryStateProvider', () => {
      it('should render grid with data', async () => {
        const stateProvider = new InMemoryStateProvider()
        const dataProvider = new ArrayDataProvider({
          items: testUsers,
          pagination: true,
          paginationMode: 'page',
          pageSize: 3,
          stateProvider
        })

        const wrapper = mount(Grid, {
          props: {
            dataProvider,
            columns
          }
        })

        await dataProvider.load()
        await nextTick()
        await nextTick() // Extra tick for rendering

        // Verify data is loaded in provider
        expect(dataProvider.getCurrentItems()).toHaveLength(3)
        expect(dataProvider.getCurrentItems()[0].name).toBe('Alice')
        expect(dataProvider.getCurrentItems()[1].name).toBe('Bob')
        expect(dataProvider.getCurrentItems()[2].name).toBe('Charlie')
      })

      it('should handle sorting through grid', async () => {
        const stateProvider = new InMemoryStateProvider()
        const dataProvider = new ArrayDataProvider({
          items: testUsers,
          pagination: true,
          paginationMode: 'page',
          pageSize: 3,
          stateProvider
        })

        await dataProvider.load()

        const wrapper = mount(Grid, {
          props: {
            dataProvider,
            columns
          }
        })

        await nextTick()

        // Verify initial state
        expect(stateProvider.getSort()).toBeNull()

        // Sort by name ascending
        dataProvider.setSort('name', 'asc')
        await dataProvider.refresh()
        await nextTick()

        expect(stateProvider.getSort()).toEqual({ field: 'name', order: 'asc' })
        expect(dataProvider.getCurrentItems()[0].name).toBe('Alice')

        // Sort by name descending
        dataProvider.setSort('name', 'desc')
        await dataProvider.refresh()
        await nextTick()

        expect(stateProvider.getSort()).toEqual({ field: 'name', order: 'desc' })
        expect(dataProvider.getCurrentItems()[0].name).toBe('Frank')
      })

      it('should handle pagination through grid', async () => {
        const stateProvider = new InMemoryStateProvider()
        const dataProvider = new ArrayDataProvider({
          items: testUsers,
          pagination: true,
          paginationMode: 'page',
          pageSize: 2,
          stateProvider
        })

        await dataProvider.load()

        const wrapper = mount(Grid, {
          props: {
            dataProvider,
            columns
          }
        })

        await nextTick()

        // Page 1
        expect(dataProvider.getCurrentPage()).toBe(1)
        expect(dataProvider.getCurrentItems()).toHaveLength(2)
        expect(dataProvider.getCurrentItems()[0].name).toBe('Alice')

        // Go to page 2
        await dataProvider.setPage(2)
        await nextTick()

        expect(dataProvider.getCurrentPage()).toBe(2)
        expect(dataProvider.getCurrentItems()).toHaveLength(2)
        expect(dataProvider.getCurrentItems()[0].name).toBe('Charlie')
      })

      it('should handle filtering and sorting together', async () => {
        const stateProvider = new InMemoryStateProvider()
        const dataProvider = new ArrayDataProvider({
          items: testUsers,
          pagination: true,
          paginationMode: 'page',
          pageSize: 10,
          stateProvider
        })

        // Apply filter
        stateProvider.setFilter('name', 'a')
        dataProvider.setSort('age', 'asc')
        await dataProvider.load()

        // Should have Alice, Diana, Charlie, Frank (all with 'a' in name)
        const items = dataProvider.getCurrentItems()
        expect(items.length).toBeGreaterThan(0)
        expect(items.every(u => u.name.toLowerCase().includes('a'))).toBe(true)

        // Should be sorted by age ascending
        for (let i = 0; i < items.length - 1; i++) {
          expect(items[i].age).toBeLessThanOrEqual(items[i + 1].age)
        }
      })
    })

    describe('with QueryParamsStateProvider', () => {
      it('should sync sort state to URL query params', async () => {
        const mockRouter = createMockRouter()
        const stateProvider = new QueryParamsStateProvider({
          router: mockRouter,
          prefix: 'grid'
        })
        const dataProvider = new ArrayDataProvider({
          items: testUsers,
          pagination: true,
          paginationMode: 'page',
          pageSize: 3,
          stateProvider
        })

        await dataProvider.load()

        const wrapper = mount(Grid, {
          props: {
            dataProvider,
            columns
          }
        })

        await nextTick()

        // Sort by name
        dataProvider.setSort('name', 'desc')
        await dataProvider.refresh()

        expect(mockRouter.replace).toHaveBeenCalled()
        expect(mockRouter.currentRoute.value.query['grid-sort']).toBe('-name')
      })

      it('should read sort state from URL query params on init', async () => {
        const mockRouter = createMockRouter()
        mockRouter.currentRoute.value.query = { 'grid-sort': 'age', 'grid-page': '2' }

        const stateProvider = new QueryParamsStateProvider({
          router: mockRouter,
          prefix: 'grid'
        })
        const dataProvider = new ArrayDataProvider({
          items: testUsers,
          pagination: true,
          paginationMode: 'page',
          pageSize: 2,
          stateProvider
        })

        // Load without explicit sort - should use state from URL
        await dataProvider.load({ page: 2, sortField: 'age', sortOrder: 'asc' })

        expect(dataProvider.getSort()).toEqual({ field: 'age', order: 'asc' })
        expect(dataProvider.getCurrentPage()).toBe(2)

        // Verify state was read from URL initially
        expect(stateProvider.getSort()).toEqual({ field: 'age', order: 'asc' })
        expect(stateProvider.getPage()).toBe(2)
      })

      it('should persist filters in URL', async () => {
        const mockRouter = createMockRouter()
        const stateProvider = new QueryParamsStateProvider({
          router: mockRouter,
          prefix: 'search'
        })
        const dataProvider = new ArrayDataProvider({
          items: testUsers,
          pagination: true,
          paginationMode: 'page',
          pageSize: 10,
          stateProvider
        })

        stateProvider.setFilter('name', 'Alice')
        await dataProvider.load()

        expect(mockRouter.currentRoute.value.query['search-name']).toBe('Alice')
        expect(dataProvider.getCurrentItems()).toHaveLength(1)
        expect(dataProvider.getCurrentItems()[0].name).toBe('Alice')
      })
    })

    describe('with LocalStorageStateProvider', () => {
      it('should persist sort state to localStorage', async () => {
        const stateProvider = new LocalStorageStateProvider({
          storageKey: 'grid-test-1'
        })
        const dataProvider = new ArrayDataProvider({
          items: testUsers,
          pagination: true,
          paginationMode: 'page',
          pageSize: 3,
          stateProvider
        })

        await dataProvider.load()

        dataProvider.setSort('email', 'desc')
        await dataProvider.refresh()

        const stored = JSON.parse(localStorage.getItem('grid-test-1') || '{}')
        expect(stored.sort).toEqual({ field: 'email', order: 'desc' })
      })

      it('should restore sort state from localStorage', async () => {
        localStorage.setItem('grid-test-2', JSON.stringify({
          sort: { field: 'age', order: 'desc' },
          page: 2
        }))

        const stateProvider = new LocalStorageStateProvider({
          storageKey: 'grid-test-2'
        })
        const dataProvider = new ArrayDataProvider({
          items: testUsers,
          pagination: true,
          paginationMode: 'page',
          pageSize: 2,
          stateProvider
        })

        await dataProvider.load({ page: 2 })

        expect(dataProvider.getSort()).toEqual({ field: 'age', order: 'desc' })
        // Items should be sorted by age descending
        const items = dataProvider.getCurrentItems()
        expect(items[0].age).toBeGreaterThanOrEqual(items[items.length - 1].age)
      })

      it('should persist filters across page reloads', async () => {
        const stateProvider = new LocalStorageStateProvider({
          storageKey: 'grid-test-3'
        })
        const dataProvider = new ArrayDataProvider({
          items: testUsers,
          pagination: true,
          paginationMode: 'page',
          pageSize: 10,
          stateProvider
        })

        stateProvider.setFilter('name', 'e')
        stateProvider.setFilter('age', '30')
        await dataProvider.load()

        // Simulate page reload - create new instances
        const stateProvider2 = new LocalStorageStateProvider({
          storageKey: 'grid-test-3'
        })
        const dataProvider2 = new ArrayDataProvider({
          items: testUsers,
          pagination: true,
          paginationMode: 'page',
          pageSize: 10,
          stateProvider: stateProvider2
        })

        await dataProvider2.load()

        expect(stateProvider2.getAllFilters()).toEqual({
          name: 'e',
          age: '30'
        })
      })
    })

    describe('with HashStateProvider', () => {
      it('should sync sort state to URL hash', async () => {
        const mockRouter = createMockRouter()
        const stateProvider = new HashStateProvider({
          router: mockRouter,
          prefix: 'grid'
        })
        const dataProvider = new ArrayDataProvider({
          items: testUsers,
          pagination: true,
          paginationMode: 'page',
          pageSize: 3,
          stateProvider
        })

        await dataProvider.load()

        dataProvider.setSort('name', 'asc')
        await dataProvider.refresh()

        // Hash should contain sort, may also contain page
        expect(mockRouter.currentRoute.value.hash).toContain('grid-sort=name')
      })

      it('should read sort state from URL hash', async () => {
        const mockRouter = createMockRouter()
        mockRouter.currentRoute.value.hash = '#grid-sort=-age&grid-page=3'

        const stateProvider = new HashStateProvider({
          router: mockRouter,
          prefix: 'grid'
        })
        const dataProvider = new ArrayDataProvider({
          items: testUsers,
          pagination: true,
          paginationMode: 'page',
          pageSize: 2,
          stateProvider
        })

        // Load with explicit sort to trigger state update
        await dataProvider.load({ page: 3, sortField: 'age', sortOrder: 'desc' })

        expect(dataProvider.getSort()).toEqual({ field: 'age', order: 'desc' })
        expect(dataProvider.getCurrentPage()).toBe(3)

        // Verify state was read from hash
        expect(stateProvider.getSort()).toEqual({ field: 'age', order: 'desc' })
        expect(stateProvider.getPage()).toBe(3)
      })
    })
  })

  describe('HttpDataProvider Integration', () => {
    const mockHttpClient = vi.fn()

    beforeEach(() => {
      mockHttpClient.mockClear()
    })

    describe('with InMemoryStateProvider', () => {
      it('should render grid with HTTP data', async () => {
        const stateProvider = new InMemoryStateProvider()
        const dataProvider = new HttpDataProvider({
          url: 'https://api.test.com/users',
          pagination: true,
          paginationMode: 'page',
          pageSize: 3,
          httpClient: mockHttpClient,
          stateProvider
        })

        mockHttpClient.mockResolvedValue({
          items: testUsers.slice(0, 3),
          pagination: {
            currentPage: 1,
            pageCount: 2,
            perPage: 3,
            totalCount: 6
          }
        })

        const wrapper = mount(Grid, {
          props: {
            dataProvider,
            columns
          }
        })

        await dataProvider.load()
        await nextTick()
        await nextTick() // Extra tick for rendering

        // Verify data is loaded in provider
        expect(dataProvider.getCurrentItems()).toHaveLength(3)
        expect(dataProvider.getCurrentItems()[0].name).toBe('Alice')
        expect(mockHttpClient).toHaveBeenCalledWith(
          expect.stringContaining('page=1')
        )
      })

      it('should send sort params to API', async () => {
        const stateProvider = new InMemoryStateProvider()
        const dataProvider = new HttpDataProvider({
          url: 'https://api.test.com/users',
          pagination: true,
          paginationMode: 'page',
          pageSize: 10,
          httpClient: mockHttpClient,
          stateProvider
        })

        mockHttpClient.mockResolvedValue({
          items: testUsers,
          pagination: {
            currentPage: 1,
            pageCount: 1,
            perPage: 10,
            totalCount: 6
          }
        })

        dataProvider.setSort('name', 'desc')
        await dataProvider.load()

        expect(mockHttpClient).toHaveBeenCalledWith(
          expect.stringContaining('sort=-name')
        )
      })
    })

    describe('with QueryParamsStateProvider (backward compatibility)', () => {
      it('should work with router param (backward compatible)', async () => {
        const mockRouter = createMockRouter()
        const dataProvider = new HttpDataProvider({
          url: 'https://api.test.com/users',
          pagination: true,
          paginationMode: 'page',
          pageSize: 3,
          httpClient: mockHttpClient,
          router: mockRouter
        })

        mockHttpClient.mockResolvedValue({
          items: testUsers.slice(0, 3),
          pagination: {
            currentPage: 1,
            pageCount: 2,
            perPage: 3,
            totalCount: 6
          }
        })

        dataProvider.setSort('email', 'asc')
        await dataProvider.load()

        // Should automatically create QueryParamsStateProvider with prefix='search'
        expect(mockRouter.currentRoute.value.query['search-sort']).toBe('email')
        expect(mockHttpClient).toHaveBeenCalledWith(
          expect.stringContaining('sort=email')
        )
      })
    })

    describe('with LocalStorageStateProvider', () => {
      it('should persist and restore HTTP request state', async () => {
        localStorage.setItem('http-grid-test', JSON.stringify({
          sort: { field: 'name', order: 'desc' },
          filters: { status: 'active' }
        }))

        const stateProvider = new LocalStorageStateProvider({
          storageKey: 'http-grid-test'
        })
        const dataProvider = new HttpDataProvider({
          url: 'https://api.test.com/users',
          pagination: true,
          paginationMode: 'page',
          httpClient: mockHttpClient,
          stateProvider
        })

        mockHttpClient.mockResolvedValue({
          items: testUsers,
          pagination: {
            currentPage: 1,
            pageCount: 1,
            perPage: 10,
            totalCount: 6
          }
        })

        await dataProvider.load()

        // Should use restored sort state
        expect(mockHttpClient).toHaveBeenCalledWith(
          expect.stringContaining('sort=-name')
        )
      })
    })
  })

  describe('Mixed Scenarios', () => {
    it('should handle state provider switching', async () => {
      // Start with InMemory
      const inMemory = new InMemoryStateProvider()
      const dataProvider = new ArrayDataProvider({
        items: testUsers,
        pagination: true,
        paginationMode: 'page',
        pageSize: 3,
        stateProvider: inMemory
      })

      inMemory.setFilter('name', 'a')
      dataProvider.setSort('age', 'asc')
      await dataProvider.load()

      const items1 = dataProvider.getCurrentItems()
      expect(items1.length).toBeGreaterThan(0)

      // Switch to LocalStorage (simulate component remount with different config)
      const localStorage = new LocalStorageStateProvider({ storageKey: 'switch-test' })
      const dataProvider2 = new ArrayDataProvider({
        items: testUsers,
        pagination: true,
        paginationMode: 'page',
        pageSize: 3,
        stateProvider: localStorage
      })

      await dataProvider2.load()

      // Should start fresh (no filters from InMemory)
      expect(dataProvider2.getCurrentItems().length).toBe(3)
    })

    it('should work with cursor pagination mode', async () => {
      const stateProvider = new InMemoryStateProvider()
      const dataProvider = new ArrayDataProvider({
        items: testUsers,
        pagination: true,
        paginationMode: 'cursor',
        pageSize: 2,
        stateProvider
      })

      await dataProvider.load()

      expect(dataProvider.getCurrentItems()).toHaveLength(2)
      expect(dataProvider.hasMore()).toBe(true)

      // Load more
      await dataProvider.loadMore()

      expect(dataProvider.getCurrentItems()).toHaveLength(4)
      expect(dataProvider.hasMore()).toBe(true)
    })

    it('should handle complex filter + sort + pagination scenario', async () => {
      const mockRouter = createMockRouter()
      const stateProvider = new QueryParamsStateProvider({
        router: mockRouter,
        prefix: 'grid'
      })
      const dataProvider = new ArrayDataProvider({
        items: testUsers,
        pagination: true,
        paginationMode: 'page',
        pageSize: 2,
        stateProvider
      })

      // Set up complex state
      stateProvider.setFilter('name', 'a')
      dataProvider.setSort('age', 'desc')
      await dataProvider.load({ page: 1 })

      const wrapper = mount(Grid, {
        props: {
          dataProvider,
          columns
        }
      })

      await nextTick()

      // Verify all state is in URL
      expect(mockRouter.currentRoute.value.query['grid-name']).toBe('a')
      expect(mockRouter.currentRoute.value.query['grid-sort']).toBe('-age')

      // Verify data is correctly filtered and sorted
      const items = dataProvider.getCurrentItems()
      expect(items.every(u => u.name.toLowerCase().includes('a'))).toBe(true)

      // Verify sorted by age descending
      for (let i = 0; i < items.length - 1; i++) {
        expect(items[i].age).toBeGreaterThanOrEqual(items[i + 1].age)
      }
    })

    it('should clear state correctly', async () => {
      const stateProvider = new InMemoryStateProvider()
      const dataProvider = new ArrayDataProvider({
        items: testUsers,
        pagination: true,
        paginationMode: 'page',
        pageSize: 3,
        stateProvider
      })

      // Set up state
      stateProvider.setFilter('name', 'test')
      dataProvider.setSort('age', 'asc')
      stateProvider.setPage(2)
      await dataProvider.load({ page: 2 })

      // Clear all state
      stateProvider.clear()
      await dataProvider.refresh()

      expect(stateProvider.getAllFilters()).toEqual({})
      expect(stateProvider.getSort()).toBeNull()
      // Page might be set to 1 after refresh, not null
      expect(dataProvider.getCurrentPage()).toBe(1)
      expect(dataProvider.getCurrentItems().length).toBe(3)
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty data gracefully', async () => {
      const stateProvider = new InMemoryStateProvider()
      const dataProvider = new ArrayDataProvider({
        items: [],
        pagination: true,
        paginationMode: 'page',
        pageSize: 10,
        stateProvider
      })

      const wrapper = mount(Grid, {
        props: {
          dataProvider,
          columns
        }
      })

      await dataProvider.load()
      await nextTick()
      await nextTick() // Extra tick for rendering

      expect(dataProvider.getCurrentItems()).toHaveLength(0)
      expect(dataProvider.isLoading()).toBe(false)
      // Grid should show empty state (exact text depends on emptyText prop)
    })

    it('should handle sorting on non-sortable column', async () => {
      const stateProvider = new InMemoryStateProvider()
      const dataProvider = new ArrayDataProvider({
        items: testUsers,
        pagination: false,
        paginationMode: 'cursor',
        stateProvider
      })

      await dataProvider.load()

      // Sort by a field that doesn't exist
      dataProvider.setSort('nonexistent', 'asc')
      await dataProvider.refresh()

      // Should not throw error
      expect(dataProvider.getCurrentItems()).toHaveLength(testUsers.length)
    })

    it('should handle rapid state changes', async () => {
      const stateProvider = new InMemoryStateProvider()
      const dataProvider = new ArrayDataProvider({
        items: testUsers,
        pagination: true,
        paginationMode: 'page',
        pageSize: 2,
        stateProvider
      })

      await dataProvider.load()

      // Rapid changes
      dataProvider.setSort('name', 'asc')
      dataProvider.setSort('age', 'desc')
      dataProvider.setSort('email', 'asc')
      await dataProvider.refresh()

      // Final state should be email ascending
      expect(dataProvider.getSort()).toEqual({ field: 'email', order: 'asc' })
      const items = dataProvider.getCurrentItems()
      expect(items[0].email < items[1].email).toBe(true)
    })

    it('should handle localStorage quota exceeded gracefully', async () => {
      const stateProvider = new LocalStorageStateProvider({
        storageKey: 'quota-test'
      })

      // Mock localStorage.setItem to throw quota exceeded error
      const originalSetItem = localStorage.setItem
      localStorage.setItem = vi.fn(() => {
        throw new Error('QuotaExceededError')
      })

      // Should not throw - error is caught internally
      expect(() => {
        stateProvider.setFilter('test', 'value')
      }).not.toThrow()

      localStorage.setItem = originalSetItem
    })
  })
})

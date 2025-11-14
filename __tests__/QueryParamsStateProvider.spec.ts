import { describe, it, expect, beforeEach } from 'vitest'
import { QueryParamsStateProvider } from '../src/state/QueryParamsStateProvider'
import { ref } from 'vue'

// Mock router
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
    replace: ({ query: newQuery, hash: newHash }: any) => {
      query.value = newQuery
      hash.value = newHash || ''
    }
  }
}

describe('QueryParamsStateProvider', () => {
  let stateProvider: QueryParamsStateProvider
  let mockRouter: any

  beforeEach(() => {
    mockRouter = createMockRouter()
    stateProvider = new QueryParamsStateProvider({
      router: mockRouter,
      prefix: 'search'
    })
  })

  describe('Filter Management', () => {
    it('should set and get filter values with prefix', () => {
      stateProvider.setFilter('name', 'John')
      expect(stateProvider.getFilter('name')).toBe('John')
      expect(mockRouter.currentRoute.value.query['search-name']).toBe('John')
    })

    it('should return null for non-existent filter', () => {
      expect(stateProvider.getFilter('nonexistent')).toBeNull()
    })

    it('should clear filter', () => {
      stateProvider.setFilter('name', 'John')
      stateProvider.clearFilter('name')
      expect(stateProvider.getFilter('name')).toBeNull()
      expect(mockRouter.currentRoute.value.query['search-name']).toBeUndefined()
    })

    it('should get all filters with prefix', () => {
      stateProvider.setFilter('name', 'John')
      stateProvider.setFilter('email', 'john@example.com')
      const filters = stateProvider.getAllFilters()
      expect(filters).toEqual({
        name: 'John',
        email: 'john@example.com'
      })
    })

    it('should handle array query params', () => {
      mockRouter.currentRoute.value.query['search-tags'] = ['tag1', 'tag2']
      expect(stateProvider.getFilter('tags')).toBe('tag1')
    })

    it('should use default prefix "search"', () => {
      const provider = new QueryParamsStateProvider({ router: mockRouter })
      provider.setFilter('name', 'John')
      expect(mockRouter.currentRoute.value.query['search-name']).toBe('John')
    })

    it('should use custom prefix', () => {
      const provider = new QueryParamsStateProvider({
        router: mockRouter,
        prefix: 'filter'
      })
      provider.setFilter('name', 'John')
      expect(mockRouter.currentRoute.value.query['filter-name']).toBe('John')
    })
  })

  describe('Sort Management', () => {
    it('should set and get ascending sort', () => {
      stateProvider.setSort('name', 'asc')
      const sort = stateProvider.getSort()
      expect(sort).toEqual({ field: 'name', order: 'asc' })
      expect(mockRouter.currentRoute.value.query['search-sort']).toBe('name')
    })

    it('should set and get descending sort with minus prefix', () => {
      stateProvider.setSort('name', 'desc')
      const sort = stateProvider.getSort()
      expect(sort).toEqual({ field: 'name', order: 'desc' })
      expect(mockRouter.currentRoute.value.query['search-sort']).toBe('-name')
    })

    it('should parse ascending sort from URL', () => {
      mockRouter.currentRoute.value.query['search-sort'] = 'email'
      const sort = stateProvider.getSort()
      expect(sort).toEqual({ field: 'email', order: 'asc' })
    })

    it('should parse descending sort from URL', () => {
      mockRouter.currentRoute.value.query['search-sort'] = '-email'
      const sort = stateProvider.getSort()
      expect(sort).toEqual({ field: 'email', order: 'desc' })
    })

    it('should return null when no sort is set', () => {
      expect(stateProvider.getSort()).toBeNull()
    })

    it('should clear sort', () => {
      stateProvider.setSort('name', 'asc')
      stateProvider.clearSort()
      expect(stateProvider.getSort()).toBeNull()
      expect(mockRouter.currentRoute.value.query['search-sort']).toBeUndefined()
    })
  })

  describe('Pagination Management', () => {
    it('should set and get page number', () => {
      stateProvider.setPage(3)
      expect(stateProvider.getPage()).toBe(3)
      expect(mockRouter.currentRoute.value.query['search-page']).toBe('3')
    })

    it('should parse page from URL', () => {
      mockRouter.currentRoute.value.query['search-page'] = '5'
      expect(stateProvider.getPage()).toBe(5)
    })

    it('should return null for invalid page number', () => {
      mockRouter.currentRoute.value.query['search-page'] = 'invalid'
      expect(stateProvider.getPage()).toBeNull()
    })

    it('should return null when no page is set', () => {
      expect(stateProvider.getPage()).toBeNull()
    })

    it('should clear page', () => {
      stateProvider.setPage(3)
      stateProvider.clearPage()
      expect(stateProvider.getPage()).toBeNull()
      expect(mockRouter.currentRoute.value.query['search-page']).toBeUndefined()
    })
  })

  describe('Cursor Management', () => {
    it('should set and get cursor', () => {
      stateProvider.setCursor('abc123')
      expect(stateProvider.getCursor()).toBe('abc123')
      expect(mockRouter.currentRoute.value.query['search-cursor']).toBe('abc123')
    })

    it('should parse cursor from URL', () => {
      mockRouter.currentRoute.value.query['search-cursor'] = 'xyz789'
      expect(stateProvider.getCursor()).toBe('xyz789')
    })

    it('should return null when no cursor is set', () => {
      expect(stateProvider.getCursor()).toBeNull()
    })

    it('should clear cursor', () => {
      stateProvider.setCursor('abc123')
      stateProvider.clearCursor()
      expect(stateProvider.getCursor()).toBeNull()
      expect(mockRouter.currentRoute.value.query['search-cursor']).toBeUndefined()
    })
  })

  describe('Clear All State', () => {
    it('should clear all prefixed parameters', () => {
      stateProvider.setFilter('name', 'John')
      stateProvider.setFilter('email', 'john@example.com')
      stateProvider.setSort('name', 'asc')
      stateProvider.setPage(3)
      stateProvider.setCursor('abc123')

      // Add non-prefixed param
      mockRouter.currentRoute.value.query['other'] = 'value'

      stateProvider.clear()

      expect(stateProvider.getAllFilters()).toEqual({})
      expect(stateProvider.getSort()).toBeNull()
      expect(stateProvider.getPage()).toBeNull()
      expect(stateProvider.getCursor()).toBeNull()

      // Non-prefixed param should remain
      expect(mockRouter.currentRoute.value.query['other']).toBe('value')
    })
  })
})

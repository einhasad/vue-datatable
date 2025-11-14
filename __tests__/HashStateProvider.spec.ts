import { describe, it, expect, beforeEach } from 'vitest'
import { HashStateProvider } from '../src/state/HashStateProvider'
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
      query.value = newQuery || {}
      hash.value = newHash || ''
    }
  }
}

describe('HashStateProvider', () => {
  let stateProvider: HashStateProvider
  let mockRouter: any

  beforeEach(() => {
    mockRouter = createMockRouter()
    stateProvider = new HashStateProvider({
      router: mockRouter,
      prefix: 'search'
    })
  })

  describe('Filter Management', () => {
    it('should set and get filter values in hash', () => {
      stateProvider.setFilter('name', 'John')
      expect(stateProvider.getFilter('name')).toBe('John')
      expect(mockRouter.currentRoute.value.hash).toBe('#search-name=John')
    })

    it('should handle multiple filters in hash', () => {
      stateProvider.setFilter('name', 'John')
      stateProvider.setFilter('email', 'john@example.com')
      const filters = stateProvider.getAllFilters()
      expect(filters).toEqual({
        name: 'John',
        email: 'john@example.com'
      })
    })

    it('should parse filters from existing hash', () => {
      mockRouter.currentRoute.value.hash = '#search-name=John&search-email=john@example.com'
      expect(stateProvider.getFilter('name')).toBe('John')
      expect(stateProvider.getFilter('email')).toBe('john@example.com')
    })

    it('should encode and decode special characters', () => {
      stateProvider.setFilter('query', 'hello world')
      expect(stateProvider.getFilter('query')).toBe('hello world')
    })

    it('should return null for non-existent filter', () => {
      expect(stateProvider.getFilter('nonexistent')).toBeNull()
    })

    it('should clear filter', () => {
      stateProvider.setFilter('name', 'John')
      stateProvider.clearFilter('name')
      expect(stateProvider.getFilter('name')).toBeNull()
      expect(mockRouter.currentRoute.value.hash).toBe('')
    })

    it('should use default prefix "search"', () => {
      const provider = new HashStateProvider({ router: mockRouter })
      provider.setFilter('name', 'John')
      expect(mockRouter.currentRoute.value.hash).toContain('search-name=John')
    })

    it('should use custom prefix', () => {
      const provider = new HashStateProvider({
        router: mockRouter,
        prefix: 'filter'
      })
      provider.setFilter('name', 'John')
      expect(mockRouter.currentRoute.value.hash).toContain('filter-name=John')
    })
  })

  describe('Sort Management', () => {
    it('should set and get ascending sort in hash', () => {
      stateProvider.setSort('name', 'asc')
      const sort = stateProvider.getSort()
      expect(sort).toEqual({ field: 'name', order: 'asc' })
      expect(mockRouter.currentRoute.value.hash).toBe('#search-sort=name')
    })

    it('should set and get descending sort with minus prefix', () => {
      stateProvider.setSort('name', 'desc')
      const sort = stateProvider.getSort()
      expect(sort).toEqual({ field: 'name', order: 'desc' })
      expect(mockRouter.currentRoute.value.hash).toBe('#search-sort=-name')
    })

    it('should parse ascending sort from hash', () => {
      mockRouter.currentRoute.value.hash = '#search-sort=email'
      const sort = stateProvider.getSort()
      expect(sort).toEqual({ field: 'email', order: 'asc' })
    })

    it('should parse descending sort from hash', () => {
      mockRouter.currentRoute.value.hash = '#search-sort=-email'
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
      expect(mockRouter.currentRoute.value.hash).toBe('')
    })
  })

  describe('Pagination Management', () => {
    it('should set and get page number in hash', () => {
      stateProvider.setPage(3)
      expect(stateProvider.getPage()).toBe(3)
      expect(mockRouter.currentRoute.value.hash).toBe('#search-page=3')
    })

    it('should parse page from hash', () => {
      mockRouter.currentRoute.value.hash = '#search-page=5'
      expect(stateProvider.getPage()).toBe(5)
    })

    it('should return null for invalid page number', () => {
      mockRouter.currentRoute.value.hash = '#search-page=invalid'
      expect(stateProvider.getPage()).toBeNull()
    })

    it('should return null when no page is set', () => {
      expect(stateProvider.getPage()).toBeNull()
    })

    it('should clear page', () => {
      stateProvider.setPage(3)
      stateProvider.clearPage()
      expect(stateProvider.getPage()).toBeNull()
      expect(mockRouter.currentRoute.value.hash).toBe('')
    })
  })

  describe('Cursor Management', () => {
    it('should set and get cursor in hash', () => {
      stateProvider.setCursor('abc123')
      expect(stateProvider.getCursor()).toBe('abc123')
      expect(mockRouter.currentRoute.value.hash).toBe('#search-cursor=abc123')
    })

    it('should parse cursor from hash', () => {
      mockRouter.currentRoute.value.hash = '#search-cursor=xyz789'
      expect(stateProvider.getCursor()).toBe('xyz789')
    })

    it('should return null when no cursor is set', () => {
      expect(stateProvider.getCursor()).toBeNull()
    })

    it('should clear cursor', () => {
      stateProvider.setCursor('abc123')
      stateProvider.clearCursor()
      expect(stateProvider.getCursor()).toBeNull()
      expect(mockRouter.currentRoute.value.hash).toBe('')
    })
  })

  describe('Clear All State', () => {
    it('should clear all prefixed parameters from hash', () => {
      stateProvider.setFilter('name', 'John')
      stateProvider.setFilter('email', 'john@example.com')
      stateProvider.setSort('name', 'asc')
      stateProvider.setPage(3)
      stateProvider.setCursor('abc123')

      // Add non-prefixed hash param
      mockRouter.currentRoute.value.hash = '#search-name=John&other=value'

      stateProvider.clear()

      expect(stateProvider.getAllFilters()).toEqual({})
      expect(stateProvider.getSort()).toBeNull()
      expect(stateProvider.getPage()).toBeNull()
      expect(stateProvider.getCursor()).toBeNull()

      // Non-prefixed param should remain
      expect(mockRouter.currentRoute.value.hash).toBe('#other=value')
    })

    it('should handle empty hash when clearing', () => {
      mockRouter.currentRoute.value.hash = ''
      stateProvider.clear()
      expect(mockRouter.currentRoute.value.hash).toBe('')
    })
  })

  describe('Hash Parsing', () => {
    it('should handle hash without # prefix', () => {
      mockRouter.currentRoute.value.hash = 'search-name=John'
      expect(stateProvider.getFilter('name')).toBe('John')
    })

    it('should handle empty hash', () => {
      mockRouter.currentRoute.value.hash = ''
      expect(stateProvider.getFilter('name')).toBeNull()
    })

    it('should handle hash with only #', () => {
      mockRouter.currentRoute.value.hash = '#'
      expect(stateProvider.getFilter('name')).toBeNull()
    })

    it('should preserve order of multiple params', () => {
      stateProvider.setFilter('a', '1')
      stateProvider.setFilter('b', '2')
      stateProvider.setFilter('c', '3')

      const hash = mockRouter.currentRoute.value.hash
      expect(hash).toContain('search-a=1')
      expect(hash).toContain('search-b=2')
      expect(hash).toContain('search-c=3')
    })
  })
})

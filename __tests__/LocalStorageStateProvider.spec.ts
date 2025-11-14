import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { LocalStorageStateProvider } from '../src/state/LocalStorageStateProvider'

describe('LocalStorageStateProvider', () => {
  let stateProvider: LocalStorageStateProvider

  beforeEach(() => {
    localStorage.clear()
    stateProvider = new LocalStorageStateProvider()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('Filter Management', () => {
    it('should set and get filter values', () => {
      stateProvider.setFilter('name', 'John')
      expect(stateProvider.getFilter('name')).toBe('John')
    })

    it('should persist filter to localStorage', () => {
      stateProvider.setFilter('name', 'John')
      const stored = JSON.parse(localStorage.getItem('grid-state') || '{}')
      expect(stored.filters.name).toBe('John')
    })

    it('should load filter from localStorage', () => {
      localStorage.setItem('grid-state', JSON.stringify({
        filters: { name: 'John' }
      }))
      const provider = new LocalStorageStateProvider()
      expect(provider.getFilter('name')).toBe('John')
    })

    it('should return null for non-existent filter', () => {
      expect(stateProvider.getFilter('nonexistent')).toBeNull()
    })

    it('should clear filter', () => {
      stateProvider.setFilter('name', 'John')
      stateProvider.clearFilter('name')
      expect(stateProvider.getFilter('name')).toBeNull()
    })

    it('should get all filters', () => {
      stateProvider.setFilter('name', 'John')
      stateProvider.setFilter('email', 'john@example.com')
      const filters = stateProvider.getAllFilters()
      expect(filters).toEqual({
        name: 'John',
        email: 'john@example.com'
      })
    })

    it('should use custom storage key', () => {
      const provider = new LocalStorageStateProvider({ storageKey: 'custom-key' })
      provider.setFilter('name', 'John')
      expect(localStorage.getItem('custom-key')).toBeTruthy()
      expect(localStorage.getItem('grid-state')).toBeNull()
    })

    it('should handle corrupted localStorage data gracefully', () => {
      localStorage.setItem('grid-state', 'invalid json')
      const provider = new LocalStorageStateProvider()
      expect(provider.getFilter('name')).toBeNull()
    })
  })

  describe('Sort Management', () => {
    it('should set and get sort state', () => {
      stateProvider.setSort('name', 'asc')
      const sort = stateProvider.getSort()
      expect(sort).toEqual({ field: 'name', order: 'asc' })
    })

    it('should persist sort to localStorage', () => {
      stateProvider.setSort('name', 'desc')
      const stored = JSON.parse(localStorage.getItem('grid-state') || '{}')
      expect(stored.sort).toEqual({ field: 'name', order: 'desc' })
    })

    it('should load sort from localStorage', () => {
      localStorage.setItem('grid-state', JSON.stringify({
        sort: { field: 'email', order: 'asc' }
      }))
      const provider = new LocalStorageStateProvider()
      expect(provider.getSort()).toEqual({ field: 'email', order: 'asc' })
    })

    it('should return null when no sort is set', () => {
      expect(stateProvider.getSort()).toBeNull()
    })

    it('should clear sort', () => {
      stateProvider.setSort('name', 'asc')
      stateProvider.clearSort()
      expect(stateProvider.getSort()).toBeNull()
    })
  })

  describe('Pagination Management', () => {
    it('should set and get page number', () => {
      stateProvider.setPage(3)
      expect(stateProvider.getPage()).toBe(3)
    })

    it('should persist page to localStorage', () => {
      stateProvider.setPage(5)
      const stored = JSON.parse(localStorage.getItem('grid-state') || '{}')
      expect(stored.page).toBe(5)
    })

    it('should load page from localStorage', () => {
      localStorage.setItem('grid-state', JSON.stringify({ page: 7 }))
      const provider = new LocalStorageStateProvider()
      expect(provider.getPage()).toBe(7)
    })

    it('should return null when no page is set', () => {
      expect(stateProvider.getPage()).toBeNull()
    })

    it('should clear page', () => {
      stateProvider.setPage(3)
      stateProvider.clearPage()
      expect(stateProvider.getPage()).toBeNull()
    })
  })

  describe('Cursor Management', () => {
    it('should set and get cursor', () => {
      stateProvider.setCursor('abc123')
      expect(stateProvider.getCursor()).toBe('abc123')
    })

    it('should persist cursor to localStorage', () => {
      stateProvider.setCursor('xyz789')
      const stored = JSON.parse(localStorage.getItem('grid-state') || '{}')
      expect(stored.cursor).toBe('xyz789')
    })

    it('should load cursor from localStorage', () => {
      localStorage.setItem('grid-state', JSON.stringify({ cursor: 'def456' }))
      const provider = new LocalStorageStateProvider()
      expect(provider.getCursor()).toBe('def456')
    })

    it('should return null when no cursor is set', () => {
      expect(stateProvider.getCursor()).toBeNull()
    })

    it('should clear cursor', () => {
      stateProvider.setCursor('abc123')
      stateProvider.clearCursor()
      expect(stateProvider.getCursor()).toBeNull()
    })
  })

  describe('Clear All State', () => {
    it('should clear all state from localStorage', () => {
      stateProvider.setFilter('name', 'John')
      stateProvider.setFilter('email', 'john@example.com')
      stateProvider.setSort('name', 'asc')
      stateProvider.setPage(3)
      stateProvider.setCursor('abc123')

      stateProvider.clear()

      expect(localStorage.getItem('grid-state')).toBeNull()
      expect(stateProvider.getAllFilters()).toEqual({})
      expect(stateProvider.getSort()).toBeNull()
      expect(stateProvider.getPage()).toBeNull()
      expect(stateProvider.getCursor()).toBeNull()
    })
  })
})

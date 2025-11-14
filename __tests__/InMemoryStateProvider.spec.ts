import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryStateProvider } from '../src/state/InMemoryStateProvider'

describe('InMemoryStateProvider', () => {
  let stateProvider: InMemoryStateProvider

  beforeEach(() => {
    stateProvider = new InMemoryStateProvider()
  })

  describe('Filter Management', () => {
    it('should set and get filter values', () => {
      stateProvider.setFilter('name', 'John')
      expect(stateProvider.getFilter('name')).toBe('John')
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

    it('should remove filter when set to empty string', () => {
      stateProvider.setFilter('name', 'John')
      stateProvider.setFilter('name', '')
      expect(stateProvider.getFilter('name')).toBeNull()
    })
  })

  describe('Sort Management', () => {
    it('should set and get sort state', () => {
      stateProvider.setSort('name', 'asc')
      const sort = stateProvider.getSort()
      expect(sort).toEqual({ field: 'name', order: 'asc' })
    })

    it('should return null when no sort is set', () => {
      expect(stateProvider.getSort()).toBeNull()
    })

    it('should update sort state', () => {
      stateProvider.setSort('name', 'asc')
      stateProvider.setSort('email', 'desc')
      const sort = stateProvider.getSort()
      expect(sort).toEqual({ field: 'email', order: 'desc' })
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
    it('should clear all state', () => {
      stateProvider.setFilter('name', 'John')
      stateProvider.setFilter('email', 'john@example.com')
      stateProvider.setSort('name', 'asc')
      stateProvider.setPage(3)
      stateProvider.setCursor('abc123')

      stateProvider.clear()

      expect(stateProvider.getAllFilters()).toEqual({})
      expect(stateProvider.getSort()).toBeNull()
      expect(stateProvider.getPage()).toBeNull()
      expect(stateProvider.getCursor()).toBeNull()
    })
  })
})

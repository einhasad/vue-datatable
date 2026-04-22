import { describe, it, expect, beforeEach, vi } from 'vitest'
import { LocalStorageStateProvider } from '../../src/state/LocalStorageStateProvider'

describe('LocalStorageStateProvider', () => {
  let provider: LocalStorageStateProvider

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  // --- Construction and initial state ---

  it('should have empty initial state when localStorage is empty', () => {
    provider = new LocalStorageStateProvider()
    expect(provider.state.filters).toEqual({})
    expect(provider.state.sort).toBeNull()
  })

  it('should read initial filters from localStorage on construction', () => {
    localStorage.setItem('grid-state', JSON.stringify({
      filters: { name: 'Alice', status: 'active' },
    }))
    provider = new LocalStorageStateProvider()

    expect(provider.getFilter('name')).toBe('Alice')
    expect(provider.getFilter('status')).toBe('active')
  })

  it('should read initial sort from localStorage on construction', () => {
    localStorage.setItem('grid-state', JSON.stringify({
      sort: { field: 'name', order: 'asc' },
    }))
    provider = new LocalStorageStateProvider()

    expect(provider.getSort()).toEqual({ field: 'name', order: 'asc' })
  })

  it('should read both filters and sort from localStorage', () => {
    localStorage.setItem('grid-state', JSON.stringify({
      filters: { name: 'Alice' },
      sort: { field: 'date', order: 'desc' },
    }))
    provider = new LocalStorageStateProvider()

    expect(provider.getFilter('name')).toBe('Alice')
    expect(provider.getSort()).toEqual({ field: 'date', order: 'desc' })
  })

  it('should use default storageKey "grid-state"', () => {
    provider = new LocalStorageStateProvider()
    provider.setFilter('name', 'Alice')

    const stored = JSON.parse(localStorage.getItem('grid-state')!)
    expect(stored.filters.name).toBe('Alice')
  })

  it('should support custom storageKey', () => {
    provider = new LocalStorageStateProvider({ storageKey: 'my-grid' })
    provider.setFilter('name', 'Alice')

    expect(localStorage.getItem('my-grid')).not.toBeNull()
    const stored = JSON.parse(localStorage.getItem('my-grid')!)
    expect(stored.filters.name).toBe('Alice')
  })

  // --- getFilter ---

  it('should return null for unset filter keys', () => {
    provider = new LocalStorageStateProvider()
    expect(provider.getFilter('name')).toBeNull()
  })

  // --- setFilter ---

  it('should persist filter to localStorage on setFilter', () => {
    provider = new LocalStorageStateProvider()
    provider.setFilter('name', 'Alice')

    const stored = JSON.parse(localStorage.getItem('grid-state')!)
    expect(stored.filters.name).toBe('Alice')
    expect(provider.state.filters.name).toBe('Alice')
  })

  it('should persist multiple filters', () => {
    provider = new LocalStorageStateProvider()
    provider.setFilter('name', 'Alice')
    provider.setFilter('status', 'active')

    const stored = JSON.parse(localStorage.getItem('grid-state')!)
    expect(stored.filters).toEqual({ name: 'Alice', status: 'active' })
  })

  it('should overwrite existing filter', () => {
    provider = new LocalStorageStateProvider()
    provider.setFilter('name', 'Alice')
    provider.setFilter('name', 'Bob')

    expect(provider.getFilter('name')).toBe('Bob')
    const stored = JSON.parse(localStorage.getItem('grid-state')!)
    expect(stored.filters.name).toBe('Bob')
  })

  it('should remove filter when set to empty string', () => {
    provider = new LocalStorageStateProvider()
    provider.setFilter('name', 'Alice')
    provider.setFilter('name', '')

    expect(provider.getFilter('name')).toBeNull()
    const stored = JSON.parse(localStorage.getItem('grid-state')!)
    expect(stored.filters.name).toBeUndefined()
  })

  it('should remove filter when set to null', () => {
    provider = new LocalStorageStateProvider()
    provider.setFilter('name', 'Alice')
    provider.setFilter('name', null as any)

    expect(provider.getFilter('name')).toBeNull()
  })

  it('should remove filter when set to undefined', () => {
    provider = new LocalStorageStateProvider()
    provider.setFilter('name', 'Alice')
    provider.setFilter('name', undefined as any)

    expect(provider.getFilter('name')).toBeNull()
  })

  // --- clearFilter ---

  it('should remove a specific filter and update localStorage', () => {
    provider = new LocalStorageStateProvider()
    provider.setFilter('name', 'Alice')
    provider.setFilter('status', 'active')
    provider.clearFilter('name')

    expect(provider.getFilter('name')).toBeNull()
    expect(provider.getFilter('status')).toBe('active')
    const stored = JSON.parse(localStorage.getItem('grid-state')!)
    expect(stored.filters.name).toBeUndefined()
    expect(stored.filters.status).toBe('active')
  })

  // --- getAllFilters ---

  it('should return a copy of all filters', () => {
    provider = new LocalStorageStateProvider()
    provider.setFilter('name', 'Alice')
    provider.setFilter('status', 'active')

    const filters = provider.getAllFilters()
    expect(filters).toEqual({ name: 'Alice', status: 'active' })

    filters.name = 'Changed'
    expect(provider.getFilter('name')).toBe('Alice')
  })

  // --- getSort / setSort ---

  it('should return null when no sort is set', () => {
    provider = new LocalStorageStateProvider()
    expect(provider.getSort()).toBeNull()
  })

  it('should persist sort to localStorage on setSort', () => {
    provider = new LocalStorageStateProvider()
    provider.setSort('name', 'asc')

    const stored = JSON.parse(localStorage.getItem('grid-state')!)
    expect(stored.sort).toEqual({ field: 'name', order: 'asc' })
    expect(provider.state.sort).toEqual({ field: 'name', order: 'asc' })
  })

  it('should overwrite previous sort', () => {
    provider = new LocalStorageStateProvider()
    provider.setSort('name', 'asc')
    provider.setSort('date', 'desc')

    expect(provider.getSort()).toEqual({ field: 'date', order: 'desc' })
    const stored = JSON.parse(localStorage.getItem('grid-state')!)
    expect(stored.sort).toEqual({ field: 'date', order: 'desc' })
  })

  // --- clearSort ---

  it('should reset sort to null and update localStorage', () => {
    provider = new LocalStorageStateProvider()
    provider.setSort('name', 'asc')
    provider.clearSort()

    expect(provider.getSort()).toBeNull()
    const stored = JSON.parse(localStorage.getItem('grid-state')!)
    expect(stored.sort).toBeUndefined()
  })

  // --- getValue / setValue / deleteValue ---

  it('should return null for unset value keys', () => {
    provider = new LocalStorageStateProvider()
    expect(provider.getValue('key1')).toBeNull()
  })

  it('should store and retrieve value via setValue/getValue', () => {
    provider = new LocalStorageStateProvider()
    provider.setValue('key1', 'val1')

    expect(provider.getValue('key1')).toBe('val1')
    const stored = JSON.parse(localStorage.getItem('grid-state')!)
    expect(stored.filters.key1).toBe('val1')
  })

  it('should delete value via deleteValue and update localStorage', () => {
    provider = new LocalStorageStateProvider()
    provider.setValue('key1', 'val1')
    provider.deleteValue('key1')

    expect(provider.getValue('key1')).toBeNull()
    const stored = JSON.parse(localStorage.getItem('grid-state')!)
    expect(stored.filters.key1).toBeUndefined()
  })

  // --- getAllValues ---

  it('should return copy of all values', () => {
    provider = new LocalStorageStateProvider()
    provider.setValue('a', '1')
    provider.setValue('b', '2')

    const values = provider.getAllValues()
    expect(values).toEqual({ a: '1', b: '2' })

    values.a = 'changed'
    expect(provider.getValue('a')).toBe('1')
  })

  // --- clear ---

  it('should remove all filters, sort, and localStorage entry on clear', () => {
    provider = new LocalStorageStateProvider()
    provider.setFilter('name', 'Alice')
    provider.setFilter('status', 'active')
    provider.setSort('name', 'asc')
    provider.setValue('extra', 'data')

    provider.clear()

    expect(provider.getFilter('name')).toBeNull()
    expect(provider.getFilter('status')).toBeNull()
    expect(provider.getSort()).toBeNull()
    expect(provider.getValue('extra')).toBeNull()
    expect(provider.getAllFilters()).toEqual({})
    expect(provider.getAllValues()).toEqual({})
    expect(provider.state.filters).toEqual({})
    expect(provider.state.sort).toBeNull()
    expect(localStorage.getItem('grid-state')).toBeNull()
  })

  it('should be safe to clear when already empty', () => {
    provider = new LocalStorageStateProvider()
    provider.clear()

    expect(provider.state.filters).toEqual({})
    expect(provider.state.sort).toBeNull()
  })
})

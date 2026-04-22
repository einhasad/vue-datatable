import { describe, it, expect, beforeEach, vi } from 'vitest'
import { InMemoryStateProvider } from '../../src/state/InMemoryStateProvider'

describe('InMemoryStateProvider', () => {
  let provider: InMemoryStateProvider

  beforeEach(() => {
    vi.clearAllMocks()
    provider = new InMemoryStateProvider()
  })

  it('should have correct initial state', () => {
    expect(provider.state.filters).toEqual({})
    expect(provider.state.sort).toBeNull()
  })

  // --- getFilter ---

  it('should return null for unset filter keys', () => {
    expect(provider.getFilter('name')).toBeNull()
    expect(provider.getFilter('status')).toBeNull()
  })

  // --- setFilter ---

  it('should store a filter value', () => {
    provider.setFilter('name', 'Alice')
    expect(provider.getFilter('name')).toBe('Alice')
    expect(provider.state.filters.name).toBe('Alice')
  })

  it('should store multiple filter values', () => {
    provider.setFilter('name', 'Alice')
    provider.setFilter('status', 'active')
    expect(provider.getFilter('name')).toBe('Alice')
    expect(provider.getFilter('status')).toBe('active')
  })

  it('should overwrite existing filter value', () => {
    provider.setFilter('name', 'Alice')
    provider.setFilter('name', 'Bob')
    expect(provider.getFilter('name')).toBe('Bob')
  })

  it('should remove filter when set to empty string', () => {
    provider.setFilter('name', 'Alice')
    provider.setFilter('name', '')
    expect(provider.getFilter('name')).toBeNull()
    expect('name' in provider.state.filters).toBe(false)
  })

  it('should remove filter when set to null', () => {
    provider.setFilter('name', 'Alice')
    provider.setFilter('name', null as any)
    expect(provider.getFilter('name')).toBeNull()
  })

  it('should remove filter when set to undefined', () => {
    provider.setFilter('name', 'Alice')
    provider.setFilter('name', undefined as any)
    expect(provider.getFilter('name')).toBeNull()
  })

  // --- clearFilter ---

  it('should remove a specific filter', () => {
    provider.setFilter('name', 'Alice')
    provider.setFilter('status', 'active')
    provider.clearFilter('name')
    expect(provider.getFilter('name')).toBeNull()
    expect(provider.getFilter('status')).toBe('active')
  })

  it('should do nothing when clearing a non-existent filter', () => {
    provider.clearFilter('unknown')
    expect(provider.getFilter('unknown')).toBeNull()
  })

  // --- getAllFilters ---

  it('should return a copy of all filters', () => {
    provider.setFilter('name', 'Alice')
    provider.setFilter('status', 'active')
    const filters = provider.getAllFilters()
    expect(filters).toEqual({ name: 'Alice', status: 'active' })

    // Mutating the copy should not affect the provider
    filters.name = 'Changed'
    expect(provider.getFilter('name')).toBe('Alice')
  })

  it('should return empty object when no filters set', () => {
    const filters = provider.getAllFilters()
    expect(filters).toEqual({})
  })

  // --- getSort ---

  it('should return null when no sort is set', () => {
    expect(provider.getSort()).toBeNull()
  })

  // --- setSort ---

  it('should store sort state with asc order', () => {
    provider.setSort('name', 'asc')
    const sort = provider.getSort()
    expect(sort).toEqual({ field: 'name', order: 'asc' })
    expect(provider.state.sort).toEqual({ field: 'name', order: 'asc' })
  })

  it('should store sort state with desc order', () => {
    provider.setSort('date', 'desc')
    const sort = provider.getSort()
    expect(sort).toEqual({ field: 'date', order: 'desc' })
  })

  it('should overwrite previous sort', () => {
    provider.setSort('name', 'asc')
    provider.setSort('date', 'desc')
    expect(provider.getSort()).toEqual({ field: 'date', order: 'desc' })
  })

  // --- clearSort ---

  it('should reset sort to null', () => {
    provider.setSort('name', 'asc')
    provider.clearSort()
    expect(provider.getSort()).toBeNull()
    expect(provider.state.sort).toBeNull()
  })

  // --- getValue / setValue / deleteValue ---

  it('should return null for unset value keys', () => {
    expect(provider.getValue('key1')).toBeNull()
  })

  it('should store and retrieve a value via setValue/getValue', () => {
    provider.setValue('key1', 'val1')
    expect(provider.getValue('key1')).toBe('val1')
  })

  it('should delete a value via deleteValue', () => {
    provider.setValue('key1', 'val1')
    provider.deleteValue('key1')
    expect(provider.getValue('key1')).toBeNull()
  })

  // --- getAllValues ---

  it('should return a copy of all values', () => {
    provider.setValue('a', '1')
    provider.setValue('b', '2')
    const values = provider.getAllValues()
    expect(values).toEqual({ a: '1', b: '2' })

    values.a = 'changed'
    expect(provider.getValue('a')).toBe('1')
  })

  // --- clear ---

  it('should remove all filters and sort', () => {
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
  })

  it('should be safe to clear when already empty', () => {
    provider.clear()
    expect(provider.state.filters).toEqual({})
    expect(provider.state.sort).toBeNull()
  })
})

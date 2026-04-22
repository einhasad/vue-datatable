import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import { HashStateProvider } from '../../src/state/HashStateProvider'

function createMockRouter(initialHash = '') {
  const currentRoute = ref({
    path: '/',
    query: {} as Record<string, string>,
    hash: initialHash,
  })
  return {
    currentRoute,
    replace: vi.fn((location: any) => {
      if (location.hash !== undefined) currentRoute.value.hash = location.hash
    }),
  }
}

describe('HashStateProvider', () => {
  let provider: HashStateProvider
  let router: ReturnType<typeof createMockRouter>

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // --- Construction and initial state from hash ---

  it('should have empty initial state when hash is empty', () => {
    router = createMockRouter()
    provider = new HashStateProvider({ router })

    expect(provider.state.filters).toEqual({})
    expect(provider.state.sort).toBeNull()
  })

  it('should have empty initial state when hash is just "#"', () => {
    router = createMockRouter('#')
    provider = new HashStateProvider({ router })

    expect(provider.state.filters).toEqual({})
    expect(provider.state.sort).toBeNull()
  })

  it('should read initial filters from URL hash on construction', () => {
    router = createMockRouter('#search-name=Alice&search-status=active')
    provider = new HashStateProvider({ router })

    expect(provider.getFilter('name')).toBe('Alice')
    expect(provider.getFilter('status')).toBe('active')
    expect(provider.state.filters).toEqual({ name: 'Alice', status: 'active' })
  })

  it('should ignore non-prefixed params in hash', () => {
    router = createMockRouter('#search-name=Alice&other-key=value')
    provider = new HashStateProvider({ router })

    expect(provider.getFilter('name')).toBe('Alice')
    expect(provider.getFilter('other-key')).toBeNull()
  })

  it('should ignore sort param when reading filters', () => {
    router = createMockRouter('#search-name=Alice&search-sort=name')
    provider = new HashStateProvider({ router })

    expect(provider.getFilter('name')).toBe('Alice')
    expect(provider.getFilter('sort')).toBeNull()
  })

  it('should read initial sort from hash (field for asc)', () => {
    router = createMockRouter('#search-sort=name')
    provider = new HashStateProvider({ router })

    expect(provider.getSort()).toEqual({ field: 'name', order: 'asc' })
  })

  it('should read initial sort from hash (-field for desc)', () => {
    router = createMockRouter('#search-sort=-date')
    provider = new HashStateProvider({ router })

    expect(provider.getSort()).toEqual({ field: 'date', order: 'desc' })
  })

  it('should return null sort when no sort in hash', () => {
    router = createMockRouter('#search-name=Alice')
    provider = new HashStateProvider({ router })

    expect(provider.getSort()).toBeNull()
  })

  // --- prefix ---

  it('should use default prefix "search"', () => {
    router = createMockRouter('#search-name=Alice')
    provider = new HashStateProvider({ router })

    expect(provider.getFilter('name')).toBe('Alice')
  })

  it('should support custom prefix', () => {
    router = createMockRouter('#filter-name=Alice')
    provider = new HashStateProvider({ router, prefix: 'filter' })

    expect(provider.getFilter('name')).toBe('Alice')
  })

  // --- setFilter ---

  it('should update hash via router.replace on setFilter', () => {
    router = createMockRouter()
    provider = new HashStateProvider({ router })

    provider.setFilter('name', 'Alice')

    expect(router.replace).toHaveBeenCalledTimes(1)
    expect(router.currentRoute.value.hash).toContain('search-name=Alice')
  })

  it('should store filter in reactive state', () => {
    router = createMockRouter()
    provider = new HashStateProvider({ router })

    provider.setFilter('name', 'Alice')
    expect(provider.state.filters.name).toBe('Alice')
  })

  it('should handle multiple setFilter calls', () => {
    router = createMockRouter()
    provider = new HashStateProvider({ router })

    provider.setFilter('name', 'Alice')
    provider.setFilter('status', 'active')

    expect(provider.getFilter('name')).toBe('Alice')
    expect(provider.getFilter('status')).toBe('active')
    expect(router.currentRoute.value.hash).toContain('search-name=Alice')
    expect(router.currentRoute.value.hash).toContain('search-status=active')
  })

  it('should remove filter from hash when set to empty string', () => {
    router = createMockRouter('#search-name=Alice')
    provider = new HashStateProvider({ router })

    provider.setFilter('name', '')
    expect(provider.getFilter('name')).toBeNull()
  })

  // --- clearFilter ---

  it('should remove param from hash on clearFilter', () => {
    router = createMockRouter('#search-name=Alice&search-status=active')
    provider = new HashStateProvider({ router })

    provider.clearFilter('name')

    expect(provider.getFilter('name')).toBeNull()
    expect(provider.getFilter('status')).toBe('active')
    expect(router.currentRoute.value.hash).not.toContain('search-name')
    expect(router.currentRoute.value.hash).toContain('search-status=active')
  })

  // --- getAllFilters ---

  it('should return copy of all filters', () => {
    router = createMockRouter('#search-name=Alice&search-status=active')
    provider = new HashStateProvider({ router })

    const filters = provider.getAllFilters()
    expect(filters).toEqual({ name: 'Alice', status: 'active' })

    filters.name = 'Changed'
    expect(provider.getFilter('name')).toBe('Alice')
  })

  // --- setSort ---

  it('should encode sort in hash as field (asc)', () => {
    router = createMockRouter()
    provider = new HashStateProvider({ router })

    provider.setSort('name', 'asc')
    expect(router.currentRoute.value.hash).toContain('search-sort=name')
    expect(provider.getSort()).toEqual({ field: 'name', order: 'asc' })
  })

  it('should encode sort in hash as -field (desc)', () => {
    router = createMockRouter()
    provider = new HashStateProvider({ router })

    provider.setSort('date', 'desc')
    expect(router.currentRoute.value.hash).toContain('search-sort=-date')
    expect(provider.getSort()).toEqual({ field: 'date', order: 'desc' })
  })

  // --- clearSort ---

  it('should remove sort param from hash', () => {
    router = createMockRouter('#search-sort=name')
    provider = new HashStateProvider({ router })

    provider.clearSort()
    expect(provider.getSort()).toBeNull()
    expect(router.currentRoute.value.hash).not.toContain('search-sort')
  })

  // --- getValue / setValue / deleteValue ---

  it('should manage values via setValue/getValue/deleteValue', () => {
    router = createMockRouter()
    provider = new HashStateProvider({ router })

    provider.setValue('key1', 'val1')
    expect(provider.getValue('key1')).toBe('val1')
    expect(router.currentRoute.value.hash).toContain('search-key1=val1')

    provider.deleteValue('key1')
    expect(provider.getValue('key1')).toBeNull()
  })

  it('should return null for unset value keys', () => {
    router = createMockRouter()
    provider = new HashStateProvider({ router })

    expect(provider.getValue('unknown')).toBeNull()
  })

  it('should return copy via getAllValues', () => {
    router = createMockRouter('#search-name=Alice')
    provider = new HashStateProvider({ router })

    const values = provider.getAllValues()
    expect(values).toEqual({ name: 'Alice' })

    values.name = 'Changed'
    expect(provider.getValue('name')).toBe('Alice')
  })

  // --- clear ---

  it('should remove all prefixed params from hash', () => {
    router = createMockRouter('#search-name=Alice&search-status=active&search-sort=name&other-key=keep')
    provider = new HashStateProvider({ router })

    provider.clear()

    expect(provider.getFilter('name')).toBeNull()
    expect(provider.getFilter('status')).toBeNull()
    expect(provider.getSort()).toBeNull()
    expect(provider.state.filters).toEqual({})
    expect(provider.state.sort).toBeNull()
  })

  // --- custom prefix integration ---

  it('should use custom prefix for all hash operations', () => {
    router = createMockRouter()
    provider = new HashStateProvider({ router, prefix: 'grid' })

    provider.setFilter('name', 'Alice')
    expect(router.currentRoute.value.hash).toContain('grid-name=Alice')

    provider.setSort('date', 'desc')
    expect(router.currentRoute.value.hash).toContain('grid-sort=-date')

    provider.clearFilter('name')
    expect(router.currentRoute.value.hash).not.toContain('grid-name')

    provider.clearSort()
    expect(router.currentRoute.value.hash).not.toContain('grid-sort')
  })

  it('should handle hash without # prefix', () => {
    router = createMockRouter('search-name=Bob')
    provider = new HashStateProvider({ router })

    expect(provider.getFilter('name')).toBe('Bob')
  })
})

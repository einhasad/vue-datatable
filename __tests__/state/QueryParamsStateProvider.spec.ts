import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import { QueryParamsStateProvider } from '../../src/state/QueryParamsStateProvider'

function createMockRouter(initialQuery: Record<string, string | string[]> = {}) {
  const currentRoute = ref({
    path: '/',
    query: { ...initialQuery } as Record<string, string | string[]>,
    hash: '',
  })
  return {
    currentRoute,
    replace: vi.fn((location: any) => {
      if (location.query) currentRoute.value.query = { ...location.query }
    }),
  }
}

describe('QueryParamsStateProvider', () => {
  let provider: QueryParamsStateProvider
  let router: ReturnType<typeof createMockRouter>

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // --- Construction and initial state from URL ---

  it('should read initial filters from URL query params on construction', () => {
    router = createMockRouter({ 'search-name': 'Alice', 'search-status': 'active' })
    provider = new QueryParamsStateProvider({ router })

    expect(provider.getFilter('name')).toBe('Alice')
    expect(provider.getFilter('status')).toBe('active')
    expect(provider.state.filters).toEqual({ name: 'Alice', status: 'active' })
  })

  it('should ignore non-prefixed query params on construction', () => {
    router = createMockRouter({ 'search-name': 'Alice', 'other-key': 'value' })
    provider = new QueryParamsStateProvider({ router })

    expect(provider.getFilter('name')).toBe('Alice')
    expect(provider.getFilter('other-key')).toBeNull()
  })

  it('should ignore sort param when reading filters', () => {
    router = createMockRouter({ 'search-name': 'Alice', 'search-sort': 'name' })
    provider = new QueryParamsStateProvider({ router })

    expect(provider.getFilter('name')).toBe('Alice')
    expect(provider.getFilter('sort')).toBeNull()
  })

  it('should read initial sort from URL (field for asc)', () => {
    router = createMockRouter({ 'search-sort': 'name' })
    provider = new QueryParamsStateProvider({ router })

    expect(provider.getSort()).toEqual({ field: 'name', order: 'asc' })
  })

  it('should read initial sort from URL (-field for desc)', () => {
    router = createMockRouter({ 'search-sort': '-date' })
    provider = new QueryParamsStateProvider({ router })

    expect(provider.getSort()).toEqual({ field: 'date', order: 'desc' })
  })

  it('should return null sort when no sort in URL', () => {
    router = createMockRouter()
    provider = new QueryParamsStateProvider({ router })

    expect(provider.getSort()).toBeNull()
  })

  it('should use default prefix "search"', () => {
    router = createMockRouter({ 'search-name': 'Alice' })
    provider = new QueryParamsStateProvider({ router })

    expect(provider.getFilter('name')).toBe('Alice')
  })

  it('should support custom prefix', () => {
    router = createMockRouter({ 'filter-name': 'Alice' })
    provider = new QueryParamsStateProvider({ router, prefix: 'filter' })

    expect(provider.getFilter('name')).toBe('Alice')
  })

  it('should handle array query param values', () => {
    router = createMockRouter({ 'search-name': ['Alice', 'Bob'] })
    provider = new QueryParamsStateProvider({ router })

    expect(provider.getFilter('name')).toBe('Alice')
  })

  it('should skip empty array values when reading filters', () => {
    router = createMockRouter({ 'search-name': [''] })
    provider = new QueryParamsStateProvider({ router })

    expect(provider.getFilter('name')).toBeNull()
  })

  it('should have empty initial state when no query params', () => {
    router = createMockRouter()
    provider = new QueryParamsStateProvider({ router })

    expect(provider.state.filters).toEqual({})
    expect(provider.state.sort).toBeNull()
  })

  // --- setFilter ---

  it('should update URL via router.replace on setFilter', () => {
    router = createMockRouter()
    provider = new QueryParamsStateProvider({ router })

    provider.setFilter('name', 'Alice')

    expect(router.replace).toHaveBeenCalledTimes(1)
    expect(router.currentRoute.value.query).toEqual({ 'search-name': 'Alice' })
  })

  it('should store filter in reactive state', () => {
    router = createMockRouter()
    provider = new QueryParamsStateProvider({ router })

    provider.setFilter('name', 'Alice')
    expect(provider.state.filters.name).toBe('Alice')
  })

  it('should remove filter from URL when set to empty string', () => {
    router = createMockRouter({ 'search-name': 'Alice' })
    provider = new QueryParamsStateProvider({ router })

    provider.setFilter('name', '')
    expect(provider.getFilter('name')).toBeNull()
    expect(router.currentRoute.value.query['search-name']).toBeUndefined()
  })

  // --- clearFilter ---

  it('should remove param from URL on clearFilter', () => {
    router = createMockRouter({ 'search-name': 'Alice', 'search-status': 'active' })
    provider = new QueryParamsStateProvider({ router })

    provider.clearFilter('name')

    expect(provider.getFilter('name')).toBeNull()
    expect(provider.getFilter('status')).toBe('active')
    expect(router.currentRoute.value.query['search-name']).toBeUndefined()
    expect(router.currentRoute.value.query['search-status']).toBe('active')
  })

  // --- getAllFilters ---

  it('should return copy of all filters', () => {
    router = createMockRouter({ 'search-name': 'Alice', 'search-status': 'active' })
    provider = new QueryParamsStateProvider({ router })

    const filters = provider.getAllFilters()
    expect(filters).toEqual({ name: 'Alice', status: 'active' })

    filters.name = 'Changed'
    expect(provider.getFilter('name')).toBe('Alice')
  })

  // --- setSort ---

  it('should encode sort as field (asc)', () => {
    router = createMockRouter()
    provider = new QueryParamsStateProvider({ router })

    provider.setSort('name', 'asc')
    expect(router.currentRoute.value.query['search-sort']).toBe('name')
    expect(provider.getSort()).toEqual({ field: 'name', order: 'asc' })
  })

  it('should encode sort as -field (desc)', () => {
    router = createMockRouter()
    provider = new QueryParamsStateProvider({ router })

    provider.setSort('date', 'desc')
    expect(router.currentRoute.value.query['search-sort']).toBe('-date')
    expect(provider.getSort()).toEqual({ field: 'date', order: 'desc' })
  })

  // --- clearSort ---

  it('should remove sort param from URL', () => {
    router = createMockRouter({ 'search-sort': 'name' })
    provider = new QueryParamsStateProvider({ router })

    provider.clearSort()
    expect(provider.getSort()).toBeNull()
    expect(router.currentRoute.value.query['search-sort']).toBeUndefined()
  })

  // --- getValue / setValue / deleteValue ---

  it('should manage values via setValue/getValue/deleteValue', () => {
    router = createMockRouter()
    provider = new QueryParamsStateProvider({ router })

    provider.setValue('key1', 'val1')
    expect(provider.getValue('key1')).toBe('val1')
    expect(router.currentRoute.value.query['search-key1']).toBe('val1')

    provider.deleteValue('key1')
    expect(provider.getValue('key1')).toBeNull()
    expect(router.currentRoute.value.query['search-key1']).toBeUndefined()
  })

  it('should return null for unset value keys', () => {
    router = createMockRouter()
    provider = new QueryParamsStateProvider({ router })

    expect(provider.getValue('unknown')).toBeNull()
  })

  it('should return copy via getAllValues', () => {
    router = createMockRouter({ 'search-name': 'Alice' })
    provider = new QueryParamsStateProvider({ router })

    const values = provider.getAllValues()
    expect(values).toEqual({ name: 'Alice' })

    values.name = 'Changed'
    expect(provider.getValue('name')).toBe('Alice')
  })

  // --- clear ---

  it('should remove all prefixed params from URL', () => {
    router = createMockRouter({
      'search-name': 'Alice',
      'search-status': 'active',
      'search-sort': 'name',
      'other-param': 'keep',
    })
    provider = new QueryParamsStateProvider({ router })

    provider.clear()

    expect(provider.getFilter('name')).toBeNull()
    expect(provider.getFilter('status')).toBeNull()
    expect(provider.getSort()).toBeNull()
    expect(provider.state.filters).toEqual({})
    expect(provider.state.sort).toBeNull()
    expect(router.currentRoute.value.query['search-name']).toBeUndefined()
    expect(router.currentRoute.value.query['search-status']).toBeUndefined()
    expect(router.currentRoute.value.query['search-sort']).toBeUndefined()
    expect(router.currentRoute.value.query['other-param']).toBe('keep')
  })

  // --- custom prefix integration ---

  it('should use custom prefix for all URL operations', () => {
    router = createMockRouter()
    provider = new QueryParamsStateProvider({ router, prefix: 'grid' })

    provider.setFilter('name', 'Alice')
    expect(router.currentRoute.value.query['grid-name']).toBe('Alice')

    provider.setSort('date', 'desc')
    expect(router.currentRoute.value.query['grid-sort']).toBe('-date')

    provider.clearFilter('name')
    expect(router.currentRoute.value.query['grid-name']).toBeUndefined()

    provider.clearSort()
    expect(router.currentRoute.value.query['grid-sort']).toBeUndefined()
  })

  it('should handle empty string query param for sort', () => {
    router = createMockRouter({ 'search-sort': '' })
    provider = new QueryParamsStateProvider({ router })

    expect(provider.getSort()).toBeNull()
  })

  it('should skip empty string filter values when reading from URL', () => {
    router = createMockRouter({ 'search-name': '' })
    provider = new QueryParamsStateProvider({ router })

    expect(provider.getFilter('name')).toBeNull()
  })

  it('should handle array query param in getQueryParam with empty first element', () => {
    router = createMockRouter({ 'search-sort': [''] })
    provider = new QueryParamsStateProvider({ router })

    expect(provider.getSort()).toBeNull()
  })

  it('should handle array query param in getQueryParam with non-empty first element', () => {
    router = createMockRouter({ 'search-sort': ['-name'] })
    provider = new QueryParamsStateProvider({ router })

    expect(provider.getSort()).toEqual({ field: 'name', order: 'desc' })
  })
})

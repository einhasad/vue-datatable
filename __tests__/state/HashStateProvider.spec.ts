import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import { flushPromises } from '@vue/test-utils'
import { HashStateProvider } from '../../src/state/HashStateProvider'
import { QueryParamsStateProvider } from '../../src/state/QueryParamsStateProvider'

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

describe('HashStateProvider with vue-router', () => {
  function createRealRouter() {
    return createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/', component: { render: () => null } }],
    })
  }

  async function routerAt(url: string) {
    const router = createRealRouter()
    await router.push(url)
    return router
  }

  describe('0.4.4 URLs round-trip byte-identical', () => {
    it.each([
      ['/#hash-role=Admin%2520%2526%2520Co%253D1&hash-sort=name', { role: 'Admin & Co=1' }, { field: 'name', order: 'asc' }],
      ['/#hash-name=Alice&hash-sort=-email', { name: 'Alice' }, { field: 'email', order: 'desc' }],
      ['/#hash-name=John%2520Doe&hash-status=100%2525', { name: 'John Doe', status: '100%' }, null],
      ['/?keep=1#hash-role=a%253Db', { role: 'a=b' }, null],
    ] as const)('%s', async (url, filters, sort) => {
      const router = await routerAt(url)
      const provider = new HashStateProvider({ router, prefix: 'hash' })

      expect(provider.getAllFilters()).toEqual(filters)
      expect(provider.getSort()).toEqual(sort)

      for (const [key, value] of Object.entries(filters)) provider.setFilter(key, value)
      if (sort) provider.setSort(sort.field, sort.order)
      await flushPromises()

      expect(router.currentRoute.value.fullPath).toBe(url)
    })

    it('writes values in the 0.4.4 format', async () => {
      const router = await routerAt('/')
      const provider = new HashStateProvider({ router, prefix: 'hash' })

      provider.setFilter('role', 'Admin & Co=1')
      await flushPromises()
      provider.setSort('name', 'asc')
      await flushPromises()

      expect(router.currentRoute.value.fullPath).toBe('/#hash-role=Admin%2520%2526%2520Co%253D1&hash-sort=name')
    })

    it('keeps the hash of a HashStateProvider when a QueryParamsStateProvider writes', async () => {
      const url = '/?qp-name=Eve#hash-role=Admin%2520%2526%2520Co%253D1'
      const router = await routerAt(url)
      const hash = new HashStateProvider({ router, prefix: 'hash' })
      const query = new QueryParamsStateProvider({ router, prefix: 'qp' })

      query.setFilter('name', 'Eve')
      await flushPromises()

      expect(router.currentRoute.value.fullPath).toBe(url)
      expect(hash.getFilter('role')).toBe('Admin & Co=1')
    })
  })

  it('keeps a malformed percent sequence as text instead of throwing', async () => {
    const router = await routerAt('/#search-name=100%&search-sort=id')
    const provider = new HashStateProvider({ router })

    expect(provider.getFilter('name')).toBe('100%')
    expect(provider.getSort()).toEqual({ field: 'id', order: 'asc' })
  })

  describe('route changes', () => {
    it('reads state from the initial navigation when built before the router is ready', async () => {
      const router = createRealRouter()
      const provider = new HashStateProvider({ router })

      await router.push('/#search-name=Alice&search-sort=-id')

      expect(provider.getAllFilters()).toEqual({ name: 'Alice' })
      expect(provider.getSort()).toEqual({ field: 'id', order: 'desc' })
    })

    it('re-syncs filters and sort on external navigation', async () => {
      const router = await routerAt('/#search-name=Alice&search-sort=name')
      const provider = new HashStateProvider({ router })

      await router.push('/#search-status=active')

      expect(provider.state.filters).toEqual({ status: 'active' })
      expect(provider.getSort()).toBeNull()
    })

    it('reflects back and forward navigation', async () => {
      const router = await routerAt('/#search-name=Alice')
      const provider = new HashStateProvider({ router })
      await router.push('/#search-name=Bob&search-sort=name')

      router.back()
      await vi.waitFor(() => expect(provider.getFilter('name')).toBe('Alice'))
      expect(provider.getSort()).toBeNull()

      router.forward()
      await vi.waitFor(() => expect(provider.getFilter('name')).toBe('Bob'))
      expect(provider.getSort()).toEqual({ field: 'name', order: 'asc' })
    })
  })

  describe('writes in the same tick', () => {
    it('keeps both a sort and a page write', async () => {
      const router = await routerAt('/#search-page=3')
      const provider = new HashStateProvider({ router })

      provider.setSort('name', 'asc')
      provider.setValue('page', '1')
      await flushPromises()

      expect(router.currentRoute.value.fullPath).toBe('/#search-page=1&search-sort=name')
      expect(provider.getSort()).toEqual({ field: 'name', order: 'asc' })
    })

    it('keeps writes from two providers sharing a router', async () => {
      const router = await routerAt('/#products-sort=price')
      const products = new HashStateProvider({ router, prefix: 'products' })
      const users = new HashStateProvider({ router, prefix: 'users' })

      products.setSort('name', 'asc')
      users.setSort('email', 'asc')
      await flushPromises()

      expect(router.currentRoute.value.fullPath).toBe('/#products-sort=name&users-sort=email')
    })

    it('keeps a hash write and a query write in the same tick', async () => {
      const router = await routerAt('/')
      const hash = new HashStateProvider({ router, prefix: 'h' })
      const query = new QueryParamsStateProvider({ router, prefix: 'q' })

      hash.setFilter('name', 'a')
      query.setFilter('name', 'b')
      await flushPromises()

      expect(router.currentRoute.value.fullPath).toBe('/?q-name=b#h-name=a')
    })
  })
})

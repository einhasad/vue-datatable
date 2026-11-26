import { describe, it, expect, vi } from 'vitest'
import { CallbackDataProvider } from '../src/providers/CallbackDataProvider'
import { InMemoryStateProvider } from '../src/state/InMemoryStateProvider'
import type { LoadResult, SortState, KeysetPaginationState, OffsetPaginationState } from '../src/types'

interface TestItem {
  id: number
  name: string
}

const sampleItems: TestItem[] = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Charlie' }
]

function makeLoadResult(items: TestItem[] = sampleItems): LoadResult<TestItem> {
  return { items }
}

describe('CallbackDataProvider', () => {
  it('load calls loadFn and returns items, stores them in getCurrentItems', async () => {
    const loadFn = vi.fn().mockResolvedValue(makeLoadResult())
    const provider = new CallbackDataProvider<TestItem>({ loadFn })

    const result = await provider.load()

    expect(loadFn).toHaveBeenCalledOnce()
    expect(result.items).toEqual(sampleItems)
    expect(result.items).toHaveLength(3)
    expect(provider.getCurrentItems()).toEqual(sampleItems)
  })

  it('load passes default options when none provided', async () => {
    const loadFn = vi.fn().mockResolvedValue(makeLoadResult())
    const provider = new CallbackDataProvider<TestItem>({ loadFn })

    await provider.load()

    expect(loadFn).toHaveBeenCalledWith(
      { sortOrder: null },
      null,
      null
    )
  })

  it('load passes custom options and pagination state', async () => {
    const loadFn = vi.fn().mockResolvedValue(makeLoadResult())
    const provider = new CallbackDataProvider<TestItem>({
      loadFn,
      keysetPaginationFn: vi.fn(),
      offsetPaginationFn: vi.fn()
    })

    const keysetState: KeysetPaginationState = { cursor: ['abc', 123], pageSize: 10, hasNextPage: true }
    const offsetState: OffsetPaginationState = { page: 2, pageSize: 5 }
    provider.setKeysetPagination(keysetState)
    provider.setOffsetPagination(offsetState)

    const options = { sortField: 'name', sortOrder: 'asc' as const }
    await provider.load(options)

    expect(loadFn).toHaveBeenCalledWith(options, keysetState, offsetState)
  })

  it('refresh re-calls loadFn', async () => {
    const loadFn = vi.fn().mockResolvedValue(makeLoadResult())
    const provider = new CallbackDataProvider<TestItem>({ loadFn })

    await provider.load()
    expect(loadFn).toHaveBeenCalledOnce()

    const refreshedItems: TestItem[] = [{ id: 4, name: 'Dave' }]
    loadFn.mockResolvedValue({ items: refreshedItems })

    const result = await provider.refresh()

    expect(loadFn).toHaveBeenCalledTimes(2)
    expect(result.items).toEqual(refreshedItems)
    expect(provider.getCurrentItems()).toEqual(refreshedItems)
  })

  it('isLoading is true during load and false after', async () => {
    let resolveLoad: (result: LoadResult<TestItem>) => void
    const loadPromise = new Promise<LoadResult<TestItem>>(resolve => {
      resolveLoad = resolve
    })
    const loadFn = vi.fn().mockReturnValue(loadPromise)
    const provider = new CallbackDataProvider<TestItem>({ loadFn })

    expect(provider.isLoading()).toBe(false)

    const pending = provider.load()
    expect(provider.isLoading()).toBe(true)

    resolveLoad!(makeLoadResult())
    await pending

    expect(provider.isLoading()).toBe(false)
  })

  it('setSort stores sort state and getSort retrieves it', () => {
    const loadFn = vi.fn().mockResolvedValue(makeLoadResult())
    const provider = new CallbackDataProvider<TestItem>({ loadFn })

    expect(provider.getSort()).toBeNull()

    const sort: SortState = { field: 'name', order: 'asc' }
    provider.setSort(sort)

    expect(provider.getSort()).toEqual({ field: 'name', order: 'asc' })
  })

  it('setSort calls custom sortFn when configured', () => {
    const loadFn = vi.fn().mockResolvedValue(makeLoadResult())
    const sortFn = vi.fn()
    const provider = new CallbackDataProvider<TestItem>({ loadFn, sortFn })

    const sort: SortState = { field: 'id', order: 'desc' }
    provider.setSort(sort)

    expect(sortFn).toHaveBeenCalledOnce()
    expect(sortFn).toHaveBeenCalledWith({ field: 'id', order: 'desc' })
    expect(provider.getSort()).toEqual({ field: 'id', order: 'desc' })
  })

  it('setKeysetPagination and getKeysetPagination work when configured', () => {
    const loadFn = vi.fn().mockResolvedValue(makeLoadResult())
    const keysetPaginationFn = vi.fn()
    const provider = new CallbackDataProvider<TestItem>({ loadFn, keysetPaginationFn })

    expect(provider.getKeysetPagination()).toBeNull()

    const state: KeysetPaginationState = { cursor: ['xyz', 42], pageSize: 25, hasNextPage: true }
    provider.setKeysetPagination(state)

    expect(keysetPaginationFn).toHaveBeenCalledOnce()
    expect(keysetPaginationFn).toHaveBeenCalledWith(state)
    expect(provider.getKeysetPagination()).toEqual(state)
  })

  it('setKeysetPagination throws when keysetPaginationFn is not configured', () => {
    const loadFn = vi.fn().mockResolvedValue(makeLoadResult())
    const provider = new CallbackDataProvider<TestItem>({ loadFn })

    const state: KeysetPaginationState = { cursor: null, pageSize: 10, hasNextPage: false }
    expect(() => provider.setKeysetPagination(state)).toThrow(
      'CallbackDataProvider: keyset pagination is not configured'
    )
  })

  it('getKeysetPagination throws when keysetPaginationFn is not configured', () => {
    const loadFn = vi.fn().mockResolvedValue(makeLoadResult())
    const provider = new CallbackDataProvider<TestItem>({ loadFn })

    expect(() => provider.getKeysetPagination()).toThrow(
      'CallbackDataProvider: keyset pagination is not configured'
    )
  })

  it('setOffsetPagination and getOffsetPagination work when configured', () => {
    const loadFn = vi.fn().mockResolvedValue(makeLoadResult())
    const offsetPaginationFn = vi.fn()
    const provider = new CallbackDataProvider<TestItem>({ loadFn, offsetPaginationFn })

    expect(provider.getOffsetPagination()).toBeNull()

    const state: OffsetPaginationState = { page: 3, pageSize: 20 }
    provider.setOffsetPagination(state)

    expect(offsetPaginationFn).toHaveBeenCalledOnce()
    expect(offsetPaginationFn).toHaveBeenCalledWith(state)
    expect(provider.getOffsetPagination()).toEqual(state)
  })

  it('setOffsetPagination throws when offsetPaginationFn is not configured', () => {
    const loadFn = vi.fn().mockResolvedValue(makeLoadResult())
    const provider = new CallbackDataProvider<TestItem>({ loadFn })

    const state: OffsetPaginationState = { page: 1, pageSize: 10 }
    expect(() => provider.setOffsetPagination(state)).toThrow(
      'CallbackDataProvider: offset pagination is not configured'
    )
  })

  it('getOffsetPagination throws when offsetPaginationFn is not configured', () => {
    const loadFn = vi.fn().mockResolvedValue(makeLoadResult())
    const provider = new CallbackDataProvider<TestItem>({ loadFn })

    expect(() => provider.getOffsetPagination()).toThrow(
      'CallbackDataProvider: offset pagination is not configured'
    )
  })

  it('getStateProvider defaults to an InMemoryStateProvider', () => {
    const loadFn = vi.fn().mockResolvedValue(makeLoadResult())
    const provider = new CallbackDataProvider<TestItem>({ loadFn })

    expect(provider.getStateProvider('any-key')).toBeInstanceOf(InMemoryStateProvider)
  })

  it('getStateProvider returns the configured state provider', () => {
    const stateProvider = new InMemoryStateProvider()
    const provider = new CallbackDataProvider<TestItem>({ loadFn: vi.fn(), stateProvider })

    expect(provider.getStateProvider('any-key')).toBe(stateProvider)
  })

  describe('load options from current state', () => {
    it('passes the sort set via setSort to loadFn on refresh', async () => {
      const loadFn = vi.fn().mockResolvedValue(makeLoadResult())
      const provider = new CallbackDataProvider<TestItem>({ loadFn })

      provider.setSort({ field: 'name', order: 'desc' })
      await provider.refresh()

      expect(loadFn).toHaveBeenCalledWith({ sortField: 'name', sortOrder: 'desc' }, null, null)
    })

    it('passes sortOrder null after the sort is cleared', async () => {
      const loadFn = vi.fn().mockResolvedValue(makeLoadResult())
      const provider = new CallbackDataProvider<TestItem>({ loadFn })

      provider.setSort({ field: 'name', order: 'asc' })
      provider.setSort({ field: 'name', order: null })
      await provider.refresh()

      expect(loadFn).toHaveBeenCalledWith({ sortOrder: null }, null, null)
    })

    it('falls back to the sort stored in the state provider', async () => {
      const stateProvider = new InMemoryStateProvider()
      stateProvider.setSort('id', 'asc')
      const loadFn = vi.fn().mockResolvedValue(makeLoadResult())
      const provider = new CallbackDataProvider<TestItem>({ loadFn, stateProvider })

      await provider.refresh()

      expect(provider.getSort()).toEqual({ field: 'id', order: 'asc' })
      expect(loadFn).toHaveBeenCalledWith({ sortField: 'id', sortOrder: 'asc' }, null, null)
    })

    it('passes non-empty filters except page as searchParams', async () => {
      const stateProvider = new InMemoryStateProvider()
      const loadFn = vi.fn().mockResolvedValue(makeLoadResult())
      const provider = new CallbackDataProvider<TestItem>({ loadFn, stateProvider })

      stateProvider.setFilter('name', 'ali')
      stateProvider.setFilter('status', '')
      stateProvider.setValue('page', '2')
      await provider.refresh()

      expect(loadFn).toHaveBeenCalledWith({ sortOrder: null, searchParams: { name: 'ali' } }, null, null)
    })

    it('passes explicit load options unchanged', async () => {
      const stateProvider = new InMemoryStateProvider()
      stateProvider.setFilter('name', 'ali')
      const loadFn = vi.fn().mockResolvedValue(makeLoadResult())
      const provider = new CallbackDataProvider<TestItem>({ loadFn, stateProvider })
      provider.setSort({ field: 'id', order: 'desc' })

      await provider.load({ sortOrder: null })

      expect(loadFn).toHaveBeenCalledWith({ sortOrder: null }, null, null)
    })
  })

  describe('returned pagination', () => {
    it('merges returned totals into the offset pagination state', async () => {
      const loadFn = vi.fn().mockResolvedValue({ items: sampleItems, pagination: { totalItems: 99 } })
      const provider = new CallbackDataProvider<TestItem>({ loadFn, offsetPaginationFn: vi.fn() })
      provider.setOffsetPagination({ page: 2, pageSize: 10 })

      await provider.refresh()

      expect(provider.getOffsetPagination()).toEqual({ page: 2, pageSize: 10, totalItems: 99 })
    })

    it('takes currentPage, pageSize and totalPages from the result', async () => {
      const loadFn = vi.fn().mockResolvedValue({
        items: sampleItems,
        pagination: { currentPage: 3, pageSize: 25, totalItems: 120, totalPages: 5 },
      })
      const provider = new CallbackDataProvider<TestItem>({ loadFn, offsetPaginationFn: vi.fn() })
      provider.setOffsetPagination({ page: 1, pageSize: 10 })

      await provider.refresh()

      expect(provider.getOffsetPagination()).toEqual({ page: 3, pageSize: 25, totalItems: 120, totalPages: 5 })
    })

    it('drops a stale totalPages when only totalItems is returned', async () => {
      const loadFn = vi.fn().mockResolvedValue({ items: sampleItems, pagination: { totalItems: 30 } })
      const provider = new CallbackDataProvider<TestItem>({ loadFn, offsetPaginationFn: vi.fn() })
      provider.setOffsetPagination({ page: 1, pageSize: 10, totalItems: 99, totalPages: 10 })

      await provider.refresh()

      expect(provider.getOffsetPagination()).toEqual({ page: 1, pageSize: 10, totalItems: 30 })
    })

    it('creates the offset state from the result when none was set', async () => {
      const loadFn = vi.fn().mockResolvedValue({ items: sampleItems, pagination: { totalItems: 9 } })
      const provider = new CallbackDataProvider<TestItem>({ loadFn, offsetPaginationFn: vi.fn() })

      await provider.refresh()

      expect(provider.getOffsetPagination()).toEqual({ page: 1, pageSize: 3, totalItems: 9 })
    })

    it('leaves the offset state null when no page size can be determined', async () => {
      const loadFn = vi.fn().mockResolvedValue({ items: [], pagination: { totalItems: 0 } })
      const provider = new CallbackDataProvider<TestItem>({ loadFn, offsetPaginationFn: vi.fn() })

      await provider.refresh()

      expect(provider.getOffsetPagination()).toBeNull()
    })

    it('does not call offsetPaginationFn for returned totals', async () => {
      const offsetPaginationFn = vi.fn()
      const loadFn = vi.fn().mockResolvedValue({ items: sampleItems, pagination: { totalItems: 99 } })
      const provider = new CallbackDataProvider<TestItem>({ loadFn, offsetPaginationFn })

      await provider.refresh()

      expect(offsetPaginationFn).not.toHaveBeenCalled()
    })

    it('ignores returned pagination when offset pagination is not configured', async () => {
      const loadFn = vi.fn().mockResolvedValue({ items: sampleItems, pagination: { totalItems: 99 } })
      const provider = new CallbackDataProvider<TestItem>({ loadFn })

      await expect(provider.refresh()).resolves.toEqual({ items: sampleItems, pagination: { totalItems: 99 } })
      expect(() => provider.getOffsetPagination()).toThrow('offset pagination is not configured')
    })
  })

  describe('request sequencing', () => {
    function deferred<R>() {
      let resolve!: (value: R) => void
      let reject!: (error: Error) => void
      const promise = new Promise<R>((res, rej) => { resolve = res; reject = rej })
      return { promise, resolve, reject }
    }

    it('ignores a stale response that resolves after a newer one', async () => {
      const first = deferred<LoadResult<TestItem>>()
      const second = deferred<LoadResult<TestItem>>()
      const loadFn = vi.fn()
        .mockReturnValueOnce(first.promise)
        .mockReturnValueOnce(second.promise)
      const provider = new CallbackDataProvider<TestItem>({ loadFn, offsetPaginationFn: vi.fn() })

      const firstLoad = provider.load()
      const secondLoad = provider.load()
      second.resolve({ items: [{ id: 2, name: 'Bob' }], pagination: { totalItems: 2, pageSize: 1 } })
      await secondLoad
      first.resolve({ items: [{ id: 1, name: 'Alice' }], pagination: { totalItems: 50, pageSize: 1 } })
      await firstLoad

      expect(provider.getCurrentItems()).toEqual([{ id: 2, name: 'Bob' }])
      expect(provider.getOffsetPagination()).toEqual({ page: 1, pageSize: 1, totalItems: 2 })
    })

    it('stays loading until the latest request settles', async () => {
      const first = deferred<LoadResult<TestItem>>()
      const second = deferred<LoadResult<TestItem>>()
      const loadFn = vi.fn()
        .mockReturnValueOnce(first.promise)
        .mockReturnValueOnce(second.promise)
      const provider = new CallbackDataProvider<TestItem>({ loadFn })

      const firstLoad = provider.load()
      const secondLoad = provider.load()
      first.resolve({ items: [{ id: 1, name: 'Alice' }] })
      await firstLoad

      expect(provider.isLoading()).toBe(true)
      expect(provider.getCurrentItems()).toEqual([])

      second.resolve({ items: [{ id: 2, name: 'Bob' }] })
      await secondLoad

      expect(provider.isLoading()).toBe(false)
    })

    it('a failing stale request does not end loading of the latest one', async () => {
      const first = deferred<LoadResult<TestItem>>()
      const second = deferred<LoadResult<TestItem>>()
      const loadFn = vi.fn()
        .mockReturnValueOnce(first.promise)
        .mockReturnValueOnce(second.promise)
      const provider = new CallbackDataProvider<TestItem>({ loadFn })

      const firstLoad = provider.load()
      const secondLoad = provider.load()
      first.reject(new Error('stale failure'))

      await expect(firstLoad).rejects.toThrow('stale failure')
      expect(provider.isLoading()).toBe(true)

      second.resolve({ items: sampleItems })
      await secondLoad
      expect(provider.isLoading()).toBe(false)
    })

    it('a failing latest request ends loading', async () => {
      const loadFn = vi.fn().mockRejectedValue(new Error('boom'))
      const provider = new CallbackDataProvider<TestItem>({ loadFn })

      await expect(provider.load()).rejects.toThrow('boom')
      expect(provider.isLoading()).toBe(false)
    })
  })

  describe('setRows', () => {
    it('replaces current items reactively without invoking loadFn', async () => {
      const loadFn = vi.fn().mockResolvedValue({ items: [{ id: 1, name: 'a' }] })
      const provider = new CallbackDataProvider<{ id: number; name: string; children?: unknown[] }>({ loadFn })
      await provider.load()
      loadFn.mockClear()
      provider.setRows([{ id: 1, name: 'a', children: [{ id: 11 }] }, { id: 2, name: 'b' }])
      expect(provider.getCurrentItems()).toEqual([
        { id: 1, name: 'a', children: [{ id: 11 }] },
        { id: 2, name: 'b' },
      ])
      expect(loadFn).not.toHaveBeenCalled()
    })

    it('does not change isLoading()', () => {
      const provider = new CallbackDataProvider<{ id: number }>({ loadFn: () => Promise.resolve({ items: [] }) })
      expect(provider.isLoading()).toBe(false)
      provider.setRows([{ id: 1 }])
      expect(provider.isLoading()).toBe(false)
    })

    it('does not touch sort state', () => {
      const provider = new CallbackDataProvider<{ id: number }>({
        loadFn: () => Promise.resolve({ items: [] }),
      })
      provider.setSort({ field: 'name', order: 'asc' })
      const sortBefore = provider.getSort()
      provider.setRows([{ id: 1 }])
      expect(provider.getSort()).toEqual(sortBefore)
    })
  })
})

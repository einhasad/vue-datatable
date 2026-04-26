import { describe, it, expect, vi } from 'vitest'
import { CallbackDataProvider } from '../src/providers/CallbackDataProvider'
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

  it('getStateProvider returns null', () => {
    const loadFn = vi.fn().mockResolvedValue(makeLoadResult())
    const provider = new CallbackDataProvider<TestItem>({ loadFn })

    expect(provider.getStateProvider('any-key')).toBeNull()
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

import { describe, it, expect, beforeEach } from 'vitest'
import { ArrayDataProvider } from '../src/providers/ArrayDataProvider'
import type { SortState, OffsetPaginationState, KeysetPaginationState } from '../src/types'

interface TestItem {
  id: number
  name: string
}

const sampleItems: TestItem[] = [
  { id: 3, name: 'Charlie' },
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' }
]

describe('ArrayDataProvider', () => {
  let provider: ArrayDataProvider<TestItem>

  beforeEach(() => {
    provider = new ArrayDataProvider<TestItem>({ items: sampleItems })
  })

  it('load returns all items when no pagination and no sort', async () => {
    const result = await provider.load()

    expect(result.items).toHaveLength(3)
    expect(result.items).toEqual(sampleItems)
    expect(provider.getCurrentItems()).toEqual(sampleItems)
  })

  it('load applies client-side string sorting asc', async () => {
    const result = await provider.load({ sortField: 'name', sortOrder: 'asc' })

    expect(result.items).toHaveLength(3)
    expect(result.items[0]).toEqual({ id: 1, name: 'Alice' })
    expect(result.items[1]).toEqual({ id: 2, name: 'Bob' })
    expect(result.items[2]).toEqual({ id: 3, name: 'Charlie' })
    expect(provider.getCurrentItems()).toEqual(result.items)
  })

  it('load applies client-side string sorting desc', async () => {
    const result = await provider.load({ sortField: 'name', sortOrder: 'desc' })

    expect(result.items).toHaveLength(3)
    expect(result.items[0]).toEqual({ id: 3, name: 'Charlie' })
    expect(result.items[1]).toEqual({ id: 2, name: 'Bob' })
    expect(result.items[2]).toEqual({ id: 1, name: 'Alice' })
  })

  it('load applies client-side number sorting asc', async () => {
    const result = await provider.load({ sortField: 'id', sortOrder: 'asc' })

    expect(result.items[0]).toEqual({ id: 1, name: 'Alice' })
    expect(result.items[1]).toEqual({ id: 2, name: 'Bob' })
    expect(result.items[2]).toEqual({ id: 3, name: 'Charlie' })
  })

  it('load applies client-side number sorting desc', async () => {
    const result = await provider.load({ sortField: 'id', sortOrder: 'desc' })

    expect(result.items[0]).toEqual({ id: 3, name: 'Charlie' })
    expect(result.items[1]).toEqual({ id: 2, name: 'Bob' })
    expect(result.items[2]).toEqual({ id: 1, name: 'Alice' })
  })

  it('setSort applies sorting and updates getCurrentItems', () => {
    expect(provider.getSort()).toBeNull()

    const sort: SortState = { field: 'name', order: 'asc' }
    provider.setSort(sort)

    expect(provider.getSort()).toEqual({ field: 'name', order: 'asc' })
    const items = provider.getCurrentItems()
    expect(items[0]).toEqual({ id: 1, name: 'Alice' })
    expect(items[1]).toEqual({ id: 2, name: 'Bob' })
    expect(items[2]).toEqual({ id: 3, name: 'Charlie' })
  })

  it('setSort with desc order sorts in reverse', () => {
    provider.setSort({ field: 'id', order: 'desc' })

    const items = provider.getCurrentItems()
    expect(items[0]).toEqual({ id: 3, name: 'Charlie' })
    expect(items[1]).toEqual({ id: 2, name: 'Bob' })
    expect(items[2]).toEqual({ id: 1, name: 'Alice' })
  })

  it('offset pagination slices items on page 1', async () => {
    provider.setOffsetPagination({ page: 1, pageSize: 2 })
    const result = await provider.load()

    expect(result.items).toHaveLength(2)
    expect(result.items[0]).toEqual({ id: 3, name: 'Charlie' })
    expect(result.items[1]).toEqual({ id: 1, name: 'Alice' })
    expect(provider.getCurrentItems()).toEqual(result.items)
  })

  it('offset pagination slices items on page 2', async () => {
    provider.setOffsetPagination({ page: 2, pageSize: 2 })
    const result = await provider.load()

    expect(result.items).toHaveLength(1)
    expect(result.items[0]).toEqual({ id: 2, name: 'Bob' })
  })

  it('offset pagination returns totalItems and totalPages', () => {
    provider.setOffsetPagination({ page: 1, pageSize: 2 })

    const pagination = provider.getOffsetPagination()
    expect(pagination).toEqual({
      page: 1,
      pageSize: 2,
      totalItems: 3,
      totalPages: 2
    })
  })

  it('getOffsetPagination returns null when not set', () => {
    expect(provider.getOffsetPagination()).toBeNull()
  })

  it('pagination respects sorting', async () => {
    provider.setSort({ field: 'name', order: 'asc' })
    provider.setOffsetPagination({ page: 1, pageSize: 2 })
    const result = await provider.load()

    expect(result.items).toHaveLength(2)
    expect(result.items[0]).toEqual({ id: 1, name: 'Alice' })
    expect(result.items[1]).toEqual({ id: 2, name: 'Bob' })
  })

  it('refresh reloads with current state', async () => {
    provider.setSort({ field: 'id', order: 'asc' })
    const result = await provider.refresh()

    expect(result.items[0]).toEqual({ id: 1, name: 'Alice' })
    expect(result.items[2]).toEqual({ id: 3, name: 'Charlie' })
  })

  it('setAllItems replaces dataset and re-sorts', () => {
    provider.setSort({ field: 'name', order: 'asc' })

    const newItems: TestItem[] = [
      { id: 10, name: 'Zoe' },
      { id: 5, name: 'Eve' }
    ]
    provider.setAllItems(newItems)

    const items = provider.getCurrentItems()
    expect(items).toHaveLength(2)
    expect(items[0]).toEqual({ id: 5, name: 'Eve' })
    expect(items[1]).toEqual({ id: 10, name: 'Zoe' })
  })

  it('getAllItems returns copy of all items', () => {
    const allItems = provider.getAllItems()

    expect(allItems).toEqual(sampleItems)
    expect(allItems).not.toBe(sampleItems)
  })

  it('getCurrentItems after setAllItems returns updated items', () => {
    const newItems: TestItem[] = [{ id: 99, name: 'NewGuy' }]
    provider.setAllItems(newItems)

    expect(provider.getCurrentItems()).toEqual([{ id: 99, name: 'NewGuy' }])
    expect(provider.getAllItems()).toEqual([{ id: 99, name: 'NewGuy' }])
  })

  it('keyset pagination stores and retrieves state', () => {
    expect(provider.getKeysetPagination()).toBeNull()

    const state: KeysetPaginationState = { cursor: ['abc'], pageSize: 10, hasNextPage: true }
    provider.setKeysetPagination(state)

    expect(provider.getKeysetPagination()).toEqual(state)
  })

  it('isLoading is false before and after load', async () => {
    expect(provider.isLoading()).toBe(false)
    await provider.load()
    expect(provider.isLoading()).toBe(false)
  })

  it('getStateProvider returns null when not configured', () => {
    expect(provider.getStateProvider('test')).toBeNull()
  })

  it('load returns all items without sort when sortOrder is null', async () => {
    const result = await provider.load({ sortOrder: null })

    expect(result.items).toEqual(sampleItems)
  })

  it('offset pagination with setOffsetPagination updates displayed items', () => {
    provider.setSort({ field: 'name', order: 'asc' })
    provider.setOffsetPagination({ page: 2, pageSize: 2 })

    const items = provider.getCurrentItems()
    expect(items).toHaveLength(1)
    expect(items[0]).toEqual({ id: 3, name: 'Charlie' })

    const pagination = provider.getOffsetPagination()
    expect(pagination!.totalItems).toBe(3)
    expect(pagination!.totalPages).toBe(2)
  })

  it('handles sorting with mixed types using string fallback', async () => {
    const mixedItems = [
      { id: 1, active: true },
      { id: 2, active: false },
    ]
    const mixedProvider = new ArrayDataProvider<{ id: number; active: boolean }>({ items: mixedItems })
    const result = await mixedProvider.load({ sortField: 'active', sortOrder: 'asc' })
    expect(result.items[0].active).toBe(false)
    expect(result.items[1].active).toBe(true)
  })

  describe('updateRows', () => {
    it('replaces current items reactively without re-running load()', () => {
      const provider = new ArrayDataProvider<{ id: number; children?: unknown[] }>({ items: [{ id: 1 }, { id: 2 }] })
      provider.updateRows([{ id: 1, children: [{ id: 11 }] }, { id: 2 }])
      expect(provider.getCurrentItems()).toEqual([
        { id: 1, children: [{ id: 11 }] },
        { id: 2 },
      ])
    })

    it('does not touch sort state', () => {
      const provider = new ArrayDataProvider<{ id: number; name: string }>({ items: [{ id: 1, name: 'b' }, { id: 2, name: 'a' }] })
      provider.setSort({ field: 'name', order: 'asc' })
      const sortBefore = provider.getSort()
      provider.updateRows([{ id: 3, name: 'c' }])
      expect(provider.getSort()).toEqual(sortBefore)
    })

    it('does not change isLoading()', () => {
      const provider = new ArrayDataProvider<{ id: number }>({ items: [{ id: 1 }] })
      expect(provider.isLoading()).toBe(false)
      provider.updateRows([{ id: 2 }])
      expect(provider.isLoading()).toBe(false)
    })
  })
})

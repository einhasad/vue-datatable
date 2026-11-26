import { describe, it, expect, beforeEach } from 'vitest'
import { computed } from 'vue'
import { ArrayDataProvider } from '../src/providers/ArrayDataProvider'
import { InMemoryStateProvider } from '../src/state/InMemoryStateProvider'
import type { SortState, OffsetPaginationState, KeysetPaginationState } from '../src/types'

interface Person {
  id: number
  name: string
  role: string
}

function people(count: number): Person[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Person ${i + 1}`,
    role: i % 4 === 0 ? 'Admin' : 'User'
  }))
}

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

  it('getStateProvider defaults to an InMemoryStateProvider when not configured', () => {
    expect(provider.getStateProvider('test')).toBeInstanceOf(InMemoryStateProvider)
  })

  it('getStateProvider returns the configured state provider', () => {
    const stateProvider = new InMemoryStateProvider()
    const configured = new ArrayDataProvider<TestItem>({ items: sampleItems, stateProvider })
    expect(configured.getStateProvider('test')).toBe(stateProvider)
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

  describe('setRows', () => {
    it('replaces current items reactively without re-running load()', () => {
      const provider = new ArrayDataProvider<{ id: number; children?: unknown[] }>({ items: [{ id: 1 }, { id: 2 }] })
      provider.setRows([{ id: 1, children: [{ id: 11 }] }, { id: 2 }])
      expect(provider.getCurrentItems()).toEqual([
        { id: 1, children: [{ id: 11 }] },
        { id: 2 },
      ])
    })

    it('does not touch sort state', () => {
      const provider = new ArrayDataProvider<{ id: number; name: string }>({ items: [{ id: 1, name: 'b' }, { id: 2, name: 'a' }] })
      provider.setSort({ field: 'name', order: 'asc' })
      const sortBefore = provider.getSort()
      provider.setRows([{ id: 3, name: 'c' }])
      expect(provider.getSort()).toEqual(sortBefore)
    })

    it('does not change isLoading()', () => {
      const provider = new ArrayDataProvider<{ id: number }>({ items: [{ id: 1 }] })
      expect(provider.isLoading()).toBe(false)
      provider.setRows([{ id: 2 }])
      expect(provider.isLoading()).toBe(false)
    })
  })

  describe('sort state', () => {
    it('reads the initial sort from the state provider', async () => {
      const stateProvider = new InMemoryStateProvider()
      stateProvider.setSort('name', 'desc')
      const provider = new ArrayDataProvider<TestItem>({ items: sampleItems, stateProvider })

      expect(provider.getSort()).toEqual({ field: 'name', order: 'desc' })
      const result = await provider.load()
      expect(result.items.map(item => item.name)).toEqual(['Charlie', 'Bob', 'Alice'])
    })

    it('getSort is reactive', () => {
      const sortField = computed(() => provider.getSort()?.field ?? null)
      expect(sortField.value).toBeNull()

      provider.setSort({ field: 'id', order: 'asc' })
      expect(sortField.value).toBe('id')

      provider.setSort({ field: 'name', order: 'desc' })
      expect(sortField.value).toBe('name')
    })
  })

  describe('filters', () => {
    it('ignores the reserved page key written by the Grid', async () => {
      const stateProvider = new InMemoryStateProvider()
      const paged = new ArrayDataProvider<Person>({ items: people(12), stateProvider })
      paged.setOffsetPagination({ page: 2, pageSize: 5 })
      stateProvider.setValue('page', '2')

      const result = await paged.load()

      expect(result.items.map(item => item.id)).toEqual([6, 7, 8, 9, 10])
    })

    it('still filters by other keys while page is stored', async () => {
      const stateProvider = new InMemoryStateProvider()
      const paged = new ArrayDataProvider<Person>({ items: people(12), stateProvider })
      stateProvider.setValue('page', '1')
      stateProvider.setFilter('role', 'admin')

      const result = await paged.load()

      expect(result.items.map(item => item.id)).toEqual([1, 5, 9])
    })
  })

  describe('pagination totals', () => {
    it('count only the items that match the filters', async () => {
      const stateProvider = new InMemoryStateProvider()
      const paged = new ArrayDataProvider<Person>({ items: people(12), stateProvider })
      paged.setOffsetPagination({ page: 1, pageSize: 5 })
      stateProvider.setFilter('role', 'Admin')

      await paged.refresh()

      expect(paged.getOffsetPagination()).toEqual({ page: 1, pageSize: 5, totalItems: 3, totalPages: 1 })
    })

    it('are reactive after setAllItems', () => {
      const paged = new ArrayDataProvider<Person>({ items: people(47) })
      paged.setOffsetPagination({ page: 1, pageSize: 10 })
      const totals = computed(() => {
        const offset = paged.getOffsetPagination()
        return `${offset?.totalItems}/${offset?.totalPages}`
      })
      expect(totals.value).toBe('47/5')

      paged.setAllItems(people(15))

      expect(totals.value).toBe('15/2')
    })

    it('clamp the page to the last page after the dataset shrinks', () => {
      const paged = new ArrayDataProvider<Person>({ items: people(47) })
      paged.setOffsetPagination({ page: 5, pageSize: 10 })

      paged.setAllItems(people(15))

      expect(paged.getOffsetPagination()?.page).toBe(2)
      expect(paged.getCurrentItems().map(item => item.id)).toEqual([11, 12, 13, 14, 15])
    })

    it('clamp a page beyond the last page', () => {
      const paged = new ArrayDataProvider<Person>({ items: people(47) })
      paged.setOffsetPagination({ page: 9, pageSize: 10 })

      expect(paged.getOffsetPagination()?.page).toBe(5)
      expect(paged.getCurrentItems()).toHaveLength(7)
    })

    it('clamp a page below 1 to the first page', () => {
      const paged = new ArrayDataProvider<Person>({ items: people(47) })
      paged.setOffsetPagination({ page: 0, pageSize: 10 })

      expect(paged.getOffsetPagination()?.page).toBe(1)
      expect(paged.getCurrentItems().map(item => item.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })

    it('keep page 1 when nothing matches', () => {
      const paged = new ArrayDataProvider<Person>({ items: [] })
      paged.setOffsetPagination({ page: 3, pageSize: 10 })

      expect(paged.getOffsetPagination()).toEqual({ page: 1, pageSize: 10, totalItems: 0, totalPages: 0 })
      expect(paged.getCurrentItems()).toEqual([])
    })
  })

  describe('setRows on a paginated dataset', () => {
    it('replaces only the displayed rows and keeps the other pages', () => {
      const paged = new ArrayDataProvider<Person & { children?: Person[] }>({ items: people(12) })
      paged.setOffsetPagination({ page: 1, pageSize: 5 })
      const current = paged.getCurrentItems()

      paged.setRows(current.map(row => (row.id === 1 ? { ...row, children: [{ id: 101, name: 'Child', role: 'User' }] } : row)))

      expect(paged.getCurrentItems()[0].children).toHaveLength(1)
      expect(paged.getAllItems().map(item => item.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])

      paged.setOffsetPagination({ page: 2, pageSize: 5 })
      expect(paged.getCurrentItems().map(item => item.id)).toEqual([6, 7, 8, 9, 10])

      paged.setOffsetPagination({ page: 1, pageSize: 5 })
      expect(paged.getCurrentItems()[0].children).toHaveLength(1)
    })

    it('removes displayed rows left out of the new rows and keeps the rest', () => {
      const paged = new ArrayDataProvider<Person>({ items: people(12) })
      paged.setOffsetPagination({ page: 2, pageSize: 5 })

      paged.setRows(paged.getCurrentItems().filter(row => row.id !== 7))

      expect(paged.getAllItems().map(item => item.id)).toEqual([1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12])
      expect(paged.getOffsetPagination()?.totalItems).toBe(11)
    })

    it('keeps the dataset intact over repeated calls with rows from getCurrentItems', () => {
      const paged = new ArrayDataProvider<Person & { c?: number }>({ items: people(10) })
      paged.setOffsetPagination({ page: 1, pageSize: 5 })

      paged.setRows(paged.getCurrentItems().map(r => (r.id === 1 ? { ...r, c: 1 } : r)))
      paged.setRows(paged.getCurrentItems().map(r => (r.id === 1 ? { ...r, c: undefined } : r)))

      expect(paged.getAllItems().map(item => item.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
      expect(paged.getOffsetPagination()?.totalItems).toBe(10)
    })

    it('keeps the dataset intact over three calls', () => {
      const paged = new ArrayDataProvider<Person & { c?: number }>({ items: people(10) })
      paged.setOffsetPagination({ page: 1, pageSize: 5 })

      for (const c of [1, 2, 3]) {
        paged.setRows(paged.getCurrentItems().map(r => (r.id === 1 ? { ...r, c } : r)))
      }

      expect(paged.getAllItems().map(item => item.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
      expect(paged.getCurrentItems()[0].c).toBe(3)
      paged.setOffsetPagination({ page: 2, pageSize: 5 })
      expect(paged.getCurrentItems().map(item => item.id)).toEqual([6, 7, 8, 9, 10])
    })

    it('keeps the dataset intact when every row is a spread copy', () => {
      const paged = new ArrayDataProvider<Person>({ items: people(10) })
      paged.setOffsetPagination({ page: 1, pageSize: 5 })

      paged.setRows(paged.getCurrentItems().map(r => ({ ...r })))
      paged.setRows(paged.getCurrentItems().map(r => ({ ...r, name: `${r.name}!` })))

      expect(paged.getAllItems().map(item => item.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
      expect(paged.getCurrentItems()[0].name).toBe('Person 1!')
    })

    it('does not change the pagination state', () => {
      const paged = new ArrayDataProvider<Person>({ items: people(12) })
      paged.setOffsetPagination({ page: 2, pageSize: 5 })

      paged.setRows(paged.getCurrentItems())

      expect(paged.getOffsetPagination()).toEqual({ page: 2, pageSize: 5, totalItems: 12, totalPages: 3 })
      expect(paged.getCurrentItems().map(item => item.id)).toEqual([6, 7, 8, 9, 10])
    })
  })
})

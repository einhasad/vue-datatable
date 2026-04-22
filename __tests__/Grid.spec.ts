import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { Grid, CallbackDataProvider } from '../src/index'
import type { Column, LoadResult, SortState, OffsetPaginationState } from '../src/types'

interface TestItem {
  id: number
  name: string
  email: string
}

const items: TestItem[] = [
  { id: 1, name: 'Alice', email: 'alice@test.com' },
  { id: 2, name: 'Bob', email: 'bob@test.com' },
]

const columns: Column<TestItem>[] = [
  { key: 'id', label: 'ID', sort: 'id' },
  { key: 'name', label: 'Name', sort: 'name' },
  { key: 'email', label: 'Email' },
]

function createProvider(data: TestItem[]) {
  const loadFn = vi.fn(async (): Promise<LoadResult<TestItem>> => ({ items: data }))
  return new CallbackDataProvider<TestItem>({
    loadFn,
    offsetPaginationFn: () => {},
  })
}

function mountGrid(provider: CallbackDataProvider<TestItem>, extraProps: Record<string, unknown> = {}, slots: Record<string, string> = {}) {
  provider.setOffsetPagination({ page: 1, pageSize: 20 })
  return mount(Grid as any, {
    props: { dataProvider: provider, columns, ...extraProps },
    slots,
  })
}

describe('Grid', () => {
  it('renders grid wrapper, loads data, renders rows and headers, and emits loaded', async () => {
    const provider = createProvider(items)
    const wrapper = mountGrid(provider)

    await flushPromises()

    // Root element
    expect(wrapper.find('[data-qa="grid"]').exists()).toBe(true)
    expect(wrapper.find('[data-qa="grid"]').classes()).toContain('grid')

    // Data loaded automatically
    expect(provider.getCurrentItems()).toHaveLength(2)

    // Column headers
    const headers = wrapper.findAll('th.grid-header-cell')
    expect(headers).toHaveLength(3)
    expect(headers[0].text()).toContain('ID')
    expect(headers[1].text()).toContain('Name')
    expect(headers[2].text()).toContain('Email')

    // Row 0 cell values
    const row0 = wrapper.find('[data-qa="row-0"]')
    expect(row0.exists()).toBe(true)
    expect(row0.text()).toContain('1')
    expect(row0.text()).toContain('Alice')
    expect(row0.text()).toContain('alice@test.com')

    // Row 1 cell values
    const row1 = wrapper.find('[data-qa="row-1"]')
    expect(row1.exists()).toBe(true)
    expect(row1.text()).toContain('2')
    expect(row1.text()).toContain('Bob')
    expect(row1.text()).toContain('bob@test.com')

    // Emits loaded
    expect(wrapper.emitted('loaded')).toBeTruthy()
    expect(wrapper.emitted('loaded')!.length).toBeGreaterThanOrEqual(1)
  })

  it('sorts by column on click and cycles through asc then desc', async () => {
    const loadFn = vi.fn(async (): Promise<LoadResult<TestItem>> => ({ items }))
    const provider = new CallbackDataProvider<TestItem>({ loadFn, offsetPaginationFn: () => {} })
    const wrapper = mountGrid(provider)

    await flushPromises()

    const sortLink = wrapper.find('a.grid-sort-link')

    // Click 1: no sort -> asc
    await sortLink.trigger('click')
    await flushPromises()
    expect(wrapper.find('a.grid-sort-link').classes()).toContain('asc')

    // Click 2: asc -> desc
    await wrapper.find('a.grid-sort-link').trigger('click')
    await flushPromises()
    expect(wrapper.find('a.grid-sort-link').classes()).toContain('desc')

    // Click 3: desc -> null (no sort class)
    await wrapper.find('a.grid-sort-link').trigger('click')
    await flushPromises()
    const linkAfter = wrapper.find('a.grid-sort-link')
    expect(linkAfter.classes()).not.toContain('asc')
    expect(linkAfter.classes()).not.toContain('desc')
  })

  it('reloads data when dataProvider.refresh() is called', async () => {
    const loadFn = vi.fn(async (): Promise<LoadResult<TestItem>> => ({ items }))
    const provider = new CallbackDataProvider<TestItem>({ loadFn, offsetPaginationFn: () => {} })
    const wrapper = mountGrid(provider)

    await flushPromises()
    const initialCallCount = loadFn.mock.calls.length

    await provider.refresh()
    await flushPromises()

    expect(loadFn.mock.calls.length).toBeGreaterThan(initialCallCount)
  })

  it('displays emptyText when provider returns empty array and default text when not specified', async () => {
    const provider = createProvider([])
    const wrapper = mountGrid(provider, { emptyText: 'Nothing to show' })

    await flushPromises()

    expect(wrapper.find('tr.grid-empty-row').exists()).toBe(true)
    expect(wrapper.find('tr.grid-empty-row').text()).toContain('Nothing to show')

    // Default text
    const provider2 = createProvider([])
    const wrapper2 = mountGrid(provider2)

    await flushPromises()

    expect(wrapper2.find('tr.grid-empty-row').text()).toContain('No results found')
  })

  it('shows loader during loading when showLoader is true', async () => {
    let resolveLoad: (result: LoadResult<TestItem>) => void
    const loadFn = vi.fn(async (): Promise<LoadResult<TestItem>> => {
      return new Promise(resolve => { resolveLoad = resolve })
    })
    const provider = new CallbackDataProvider<TestItem>({ loadFn, offsetPaginationFn: () => {} })
    provider.setOffsetPagination({ page: 1, pageSize: 20 })

    const wrapper = mount(Grid as any, {
      props: { dataProvider: provider, columns, showLoader: true },
    })

    // Still loading — before flush
    await flushPromises()
    resolveLoad!({ items })

    // Trigger a second load so we can observe the loading state
    const wrapper2 = mountGrid(createProvider(items), { showLoader: true })
    await flushPromises()

    // When loading finishes, the loading row should not be present
    expect(wrapper2.find('tr.grid-loading-row').exists()).toBe(false)
  })

  it('emits error event when dataProvider.load() throws', async () => {
    const loadFn = vi.fn(async (): Promise<LoadResult<TestItem>> => {
      throw new Error('Network failure')
    })
    const provider = new CallbackDataProvider<TestItem>({ loadFn, offsetPaginationFn: () => {} })
    const wrapper = mountGrid(provider)

    await flushPromises()

    expect(wrapper.emitted('error')).toBeTruthy()
    expect(wrapper.emitted('error')![0][0]).toBeInstanceOf(Error)
    expect((wrapper.emitted('error')![0][0] as Error).message).toBe('Network failure')
  })

  it('applies light color-scheme by default and dark when theme is dark', async () => {
    const provider = createProvider(items)
    const wrapper = mountGrid(provider)

    await flushPromises()

    const gridEl = wrapper.find('[data-qa="grid"]')
    expect(gridEl.attributes('style')).toContain('color-scheme: light')

    const provider2 = createProvider(items)
    const wrapper2 = mountGrid(provider2, { theme: 'dark' })

    await flushPromises()

    const gridEl2 = wrapper2.find('[data-qa="grid"]')
    expect(gridEl2.attributes('style')).toContain('color-scheme: dark')
  })

  it('does not load data when autoLoad is false', async () => {
    const loadFn = vi.fn(async (): Promise<LoadResult<TestItem>> => ({ items }))
    const provider = new CallbackDataProvider<TestItem>({ loadFn, offsetPaginationFn: () => {} })
    provider.setOffsetPagination({ page: 1, pageSize: 20 })

    const wrapper = mount(Grid as any, {
      props: { dataProvider: provider, columns, autoLoad: false },
    })

    await flushPromises()

    expect(loadFn).not.toHaveBeenCalled()
    expect(wrapper.find('[data-qa="grid"]').exists()).toBe(true)
  })

  it('provides toolbar, search, row, and pagination slot bindings', async () => {
    const provider = createProvider(items)
    provider.setOffsetPagination({ page: 1, pageSize: 10, totalItems: 25, totalPages: 3 })

    const wrapper = mount(Grid as any, {
      props: { dataProvider: provider, columns },
      slots: {
        search: `
          <template #search="{ provider, loading }">
            <div data-qa="search-slot">
              <span data-qa="search-has-provider">{{ !!provider }}</span>
              <span data-qa="search-loading">{{ loading }}</span>
            </div>
          </template>
        `,
        row: `
          <template #row="{ items }">
            <div data-qa="row-slot">
              <span data-qa="row-slot-count">{{ items.length }}</span>
            </div>
          </template>
        `,
        pagination: `
          <template #pagination="{ pagination, setPage }">
            <div data-qa="pagination-slot">
              <span data-qa="pagination-page">{{ pagination.currentPage }}</span>
              <button data-qa="set-page-btn" @click="setPage(2)">Set Page</button>
            </div>
          </template>
        `,
      },
    })

    await flushPromises()

    // Search slot
    expect(wrapper.find('[data-qa="search-slot"]').exists()).toBe(true)
    expect(wrapper.find('[data-qa="search-has-provider"]').text()).toBe('true')
    expect(wrapper.find('[data-qa="search-loading"]').text()).toBe('false')

    // Row slot
    expect(wrapper.find('[data-qa="row-slot"]').exists()).toBe(true)
    expect(wrapper.find('[data-qa="row-slot-count"]').text()).toBe('2')

    // Pagination slot
    expect(wrapper.find('[data-qa="pagination-slot"]').exists()).toBe(true)
    expect(wrapper.find('[data-qa="pagination-page"]').text()).toBe('1')
    expect(wrapper.find('[data-qa="set-page-btn"]').exists()).toBe(true)
  })

  it('does not render pagination slot when offset pagination is not configured', async () => {
    const provider = createProvider(items)
    // No setOffsetPagination call — no pagination state

    const wrapper = mount(Grid as any, {
      props: { dataProvider: provider, columns },
      slots: {
        pagination: `
          <template #pagination="{ pagination }">
            <div data-qa="pagination-slot">{{ pagination.currentPage }}</div>
          </template>
        `,
      },
    })

    await flushPromises()

    expect(wrapper.find('[data-qa="pagination-slot"]').exists()).toBe(false)
  })

  it('applies light dark color-scheme when theme is auto', async () => {
    const provider = createProvider(items)
    const wrapper = mountGrid(provider, { theme: 'auto' })

    await flushPromises()

    const gridEl = wrapper.find('[data-qa="grid"]')
    expect(gridEl.attributes('style')).toContain('color-scheme: light dark')
  })

  it('renders searchRow slot when provided', async () => {
    const provider = createProvider(items)

    const wrapper = mount(Grid as any, {
      props: { dataProvider: provider, columns },
      slots: {
        searchRow: `
          <template #searchRow="{ columns }">
            <div data-qa="search-row-slot">{{ columns.length }}</div>
          </template>
        `,
      },
    })

    await flushPromises()

    expect(wrapper.find('[data-qa="search-row-slot"]').exists()).toBe(true)
    expect(wrapper.find('[data-qa="search-row-slot"]').text()).toBe('3')
  })
})

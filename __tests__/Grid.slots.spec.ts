import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { Grid, CallbackDataProvider } from '../src/index'
import type { Column, LoadResult } from '../src/types'

interface TestItem {
  id: number
  name: string
}

const items: TestItem[] = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
]

const columns: Column<TestItem>[] = [
  { key: 'id', label: 'ID', sort: 'id' },
  { key: 'name', label: 'Name', sort: 'name' },
]

function makeProvider(data: TestItem[] = items): CallbackDataProvider<TestItem> {
  const loadFn = vi.fn(async (): Promise<LoadResult<TestItem>> => ({ items: data }))
  const provider = new CallbackDataProvider<TestItem>({
    loadFn,
    offsetPaginationFn: () => {},
  })
  provider.setOffsetPagination({ page: 1, pageSize: 20 })
  return provider
}

describe('Grid slots', () => {
  describe('#headerCell', () => {
    it('invokes the slot once per visible column with column+index scope', async () => {
      const provider = makeProvider()

      const wrapper = mount(Grid as any, {
        props: { dataProvider: provider, columns },
        slots: {
          headerCell: `
            <template #headerCell="{ column, colIndex }">
              <span :data-qa="'hc-' + colIndex" :data-key="column.key">{{ column.label }}</span>
            </template>
          `,
        },
      })

      await flushPromises()

      const cells = wrapper.findAll('[data-qa^="hc-"]')
      expect(cells).toHaveLength(2)
      expect(cells[0].attributes('data-key')).toBe('id')
      expect(cells[0].text()).toBe('ID')
      expect(cells[1].attributes('data-key')).toBe('name')
      expect(cells[1].text()).toBe('Name')
    })

    it('exposes sortState and onSort, allowing the slot to drive sorting', async () => {
      const provider = makeProvider()

      const wrapper = mount(Grid as any, {
        props: { dataProvider: provider, columns },
        slots: {
          headerCell: `
            <template #headerCell="{ column, sortState, onSort }">
              <button
                :data-qa="'sort-btn-' + column.key"
                :data-sorted="sortState && sortState.field === column.sort ? sortState.order : 'none'"
                @click="onSort(column.sort, 'asc')"
              >{{ column.label }}</button>
            </template>
          `,
        },
      })

      await flushPromises()

      const idBtn = wrapper.find('[data-qa="sort-btn-id"]')
      expect(idBtn.exists()).toBe(true)
      expect(idBtn.attributes('data-sorted')).toBe('none')

      await idBtn.trigger('click')
      await flushPromises()

      expect(wrapper.find('[data-qa="sort-btn-id"]').attributes('data-sorted')).toBe('asc')
    })

    it('falls back to GridColumnHeader when no slot is provided', async () => {
      const provider = makeProvider()

      const wrapper = mount(Grid as any, {
        props: { dataProvider: provider, columns },
      })

      await flushPromises()

      const headers = wrapper.findAll('th.grid-header-cell')
      expect(headers).toHaveLength(2)
      expect(headers[0].text()).toContain('ID')
      expect(headers[1].text()).toContain('Name')
    })
  })

  describe('#empty', () => {
    it('renders when items are empty, replacing the default emptyText', async () => {
      const provider = makeProvider([])

      const wrapper = mount(Grid as any, {
        props: { dataProvider: provider, columns },
        slots: {
          empty: `
            <template #empty>
              <span data-qa="empty-slot">Nothing here</span>
            </template>
          `,
        },
      })

      await flushPromises()

      expect(wrapper.find('[data-qa="empty-slot"]').exists()).toBe(true)
      expect(wrapper.find('[data-qa="empty-slot"]').text()).toBe('Nothing here')
      expect(wrapper.find('tr.grid-empty-row').exists()).toBe(true)
    })

    it('shows the default emptyText prop when no slot is provided', async () => {
      const provider = makeProvider([])

      const wrapper = mount(Grid as any, {
        props: { dataProvider: provider, columns, emptyText: 'No data' },
      })

      await flushPromises()

      expect(wrapper.find('tr.grid-empty-row').text()).toContain('No data')
    })
  })

  describe('#loader', () => {
    it('renders during loading, replacing the default "Loading..." text', async () => {
      // Build a provider whose load never resolves so loading stays true.
      const loadFn = vi.fn(() => new Promise<LoadResult<TestItem>>(() => {}))
      const provider = new CallbackDataProvider<TestItem>({
        loadFn,
        offsetPaginationFn: () => {},
      })
      provider.setOffsetPagination({ page: 1, pageSize: 20 })

      const wrapper = mount(Grid as any, {
        props: { dataProvider: provider, columns, showLoader: true },
        slots: {
          loader: `
            <template #loader>
              <span data-qa="custom-loader">Custom loading…</span>
            </template>
          `,
        },
      })

      await flushPromises()

      expect(wrapper.find('[data-qa="grid-loading"]').exists()).toBe(true)
      expect(wrapper.find('[data-qa="custom-loader"]').exists()).toBe(true)
      expect(wrapper.find('[data-qa="custom-loader"]').text()).toBe('Custom loading…')
    })
  })

  describe('#table', () => {
    it('replaces the default GridTable entirely with custom content', async () => {
      const provider = makeProvider()

      const wrapper = mount(Grid as any, {
        props: { dataProvider: provider, columns },
        slots: {
          table: `
            <template #table="{ items, columns: cols, sortState }">
              <ul data-qa="custom-table">
                <li v-for="c in cols" :data-qa="'col-' + c.key">{{ c.label }}</li>
                <li :data-qa="'item-count'">{{ items.length }}</li>
                <li :data-qa="'sort'">{{ sortState ? sortState.field : 'none' }}</li>
              </ul>
            </template>
          `,
        },
      })

      await flushPromises()

      expect(wrapper.find('[data-qa="custom-table"]').exists()).toBe(true)
      expect(wrapper.find('table.grid-table').exists()).toBe(false)
      expect(wrapper.find('[data-qa="col-id"]').text()).toBe('ID')
      expect(wrapper.find('[data-qa="col-name"]').text()).toBe('Name')
      expect(wrapper.find('[data-qa="item-count"]').text()).toBe('2')
      expect(wrapper.find('[data-qa="sort"]').text()).toBe('none')
    })
  })

  describe('#searchRow position (post-thead move)', () => {
    it('renders the consumer-provided searchRow inside <thead>, not <tbody>', async () => {
      const provider = makeProvider()

      const wrapper = mount(Grid as any, {
        props: { dataProvider: provider, columns },
        slots: {
          searchRow: `
            <template #searchRow>
              <tr data-qa="my-filter-row"><td colspan="2">filters</td></tr>
            </template>
          `,
        },
      })

      await flushPromises()

      const thead = wrapper.find('thead')
      const tbody = wrapper.find('tbody')
      expect(thead.find('[data-qa="my-filter-row"]').exists()).toBe(true)
      expect(tbody.find('[data-qa="my-filter-row"]').exists()).toBe(false)
    })
  })
})

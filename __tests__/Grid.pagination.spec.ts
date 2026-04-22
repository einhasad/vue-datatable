import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { Grid, CallbackDataProvider, PagePagination } from '../src/index'
import type { Column, LoadResult } from '../src/types'

interface TestItem {
  id: number
  name: string
}

function generateItems(count: number): TestItem[] {
  return Array.from({ length: count }, (_, i) => ({ id: i + 1, name: `Item ${i + 1}` }))
}

const columns: Column<TestItem>[] = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
]

function createPaginatedProvider(allItems: TestItem[], pageSize: number) {
  const loadFn = vi.fn(async (): Promise<LoadResult<TestItem>> => ({ items: allItems }))
  const provider = new CallbackDataProvider<TestItem>({
    loadFn,
    offsetPaginationFn: () => {},
  })
  const totalPages = Math.ceil(allItems.length / pageSize)
  provider.setOffsetPagination({ page: 1, pageSize, totalItems: allItems.length, totalPages })
  return { provider, loadFn }
}

describe('Grid pagination', () => {
  it('renders pagination slot with correct currentPage and totalPages', async () => {
    const manyItems = generateItems(25)
    const { provider } = createPaginatedProvider(manyItems, 10)

    const wrapper = mount(Grid as any, {
      props: { dataProvider: provider, columns },
      slots: {
        pagination: `
          <template #pagination="{ pagination, setPage }">
            <div data-qa="pagination-slot">
              <span data-qa="current-page">{{ pagination.currentPage }}</span>
              <span data-qa="total-pages">{{ pagination.totalPages }}</span>
              <span data-qa="total-items">{{ pagination.totalItems }}</span>
              <span data-qa="page-size">{{ pagination.pageSize }}</span>
              <button data-qa="set-page" @click="setPage(2)">Page 2</button>
            </div>
          </template>
        `,
      },
    })

    await flushPromises()

    expect(wrapper.find('[data-qa="pagination-slot"]').exists()).toBe(true)
    expect(wrapper.find('[data-qa="current-page"]').text()).toBe('1')
    expect(wrapper.find('[data-qa="total-pages"]').text()).toBe('3')
    expect(wrapper.find('[data-qa="total-items"]').text()).toBe('25')
    expect(wrapper.find('[data-qa="page-size"]').text()).toBe('10')
  })

  it('updates offset pagination on provider when setPage is called', async () => {
    const manyItems = generateItems(25)
    const { provider, loadFn } = createPaginatedProvider(manyItems, 10)

    const wrapper = mount(Grid as any, {
      props: { dataProvider: provider, columns },
      slots: {
        pagination: `
          <template #pagination="{ pagination, setPage }">
            <div data-qa="pagination-slot">
              <span data-qa="current-page">{{ pagination.currentPage }}</span>
              <button data-qa="set-page" @click="setPage(2)">Go to page 2</button>
            </div>
          </template>
        `,
      },
    })

    await flushPromises()

    const initialCallCount = loadFn.mock.calls.length

    // Click setPage(2)
    await wrapper.find('[data-qa="set-page"]').trigger('click')
    await flushPromises()

    // Provider offset pagination updated to page 2
    const offsetState = provider.getOffsetPagination()
    expect(offsetState).not.toBeNull()
    expect(offsetState!.page).toBe(2)

    // load was called again
    expect(loadFn.mock.calls.length).toBeGreaterThan(initialCallCount)

    // Pagination slot now reflects page 2
    expect(wrapper.find('[data-qa="current-page"]').text()).toBe('2')
  })

  it('renders PagePagination component in pagination slot', async () => {
    const manyItems = generateItems(25)
    const { provider } = createPaginatedProvider(manyItems, 10)

    const wrapper = mount(Grid as any, {
      props: { dataProvider: provider, columns },
      slots: {
        pagination: `
          <template #pagination="{ pagination, setPage }">
            <PagePagination
              :current-page="pagination.currentPage"
              :total-pages="pagination.totalPages"
              :total-items="pagination.totalItems"
              :items-per-page="pagination.pageSize"
              @page-change="setPage"
            />
          </template>
        `,
      },
      global: {
        components: { PagePagination },
      },
    })

    await flushPromises()

    // PagePagination renders
    expect(wrapper.find('.grid-pagination').exists()).toBe(true)

    // Current page is active
    const activePage = wrapper.find('.grid-pagination-active')
    expect(activePage.exists()).toBe(true)
    expect(activePage.text()).toBe('1')

    // Click page 2
    const pageLinks = wrapper.findAll('.grid-pagination-page-number')
    const page2 = pageLinks.find(link => link.text() === '2')
    expect(page2).toBeTruthy()
    await page2!.trigger('click')
    await flushPromises()

    // Provider updated to page 2
    expect(provider.getOffsetPagination()!.page).toBe(2)

    // Active page updated
    const newActive = wrapper.find('.grid-pagination-active')
    expect(newActive.text()).toBe('2')
  })
})

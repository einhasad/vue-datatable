import { describe, expect, it, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import GridTable from '../src/GridTable.vue'
import { InMemoryStateProvider } from '../src/state/InMemoryStateProvider'
import type { Column, SortState } from '../src/types'

interface TestItem {
  id: number
  name: string
  status: string
}

const items: TestItem[] = [
  { id: 1, name: 'Alice', status: 'active' },
  { id: 2, name: 'Bob', status: 'inactive' }
]

function makeColumns(overrides: Partial<Column<TestItem>>[] = []): Column<TestItem>[] {
  const base: Column<TestItem>[] = [
    { key: 'name', label: 'Name', sort: 'name' },
    { key: 'status', label: 'Status' }
  ]
  return base.map((col, i) => ({ ...col, ...overrides[i] }))
}

describe('GridTable', () => {
  it('renders header row with column labels and data rows with correct data-qa', () => {
    const columns = makeColumns()
    const wrapper = mount(GridTable, {
      props: { columns, items, rowKeyField: 'id' }
    })

    const headers = wrapper.findAll('th.grid-header-cell')
    expect(headers).toHaveLength(2)
    expect(headers[0].text()).toContain('Name')
    expect(headers[1].text()).toContain('Status')

    const rows = wrapper.findAll('tr.grid-row')
    expect(rows).toHaveLength(2)
    expect(rows[0].attributes('data-qa')).toBe('row-0')
    expect(rows[1].attributes('data-qa')).toBe('row-1')
  })

  it('hides columns where showColumn is false', () => {
    const columns = makeColumns([{ showColumn: false }])
    const wrapper = mount(GridTable, {
      props: { columns, items, rowKeyField: 'id' }
    })

    expect(wrapper.findAll('th.grid-header-cell')).toHaveLength(1)
    expect(wrapper.findAll('th.grid-header-cell')[0].text()).toContain('Status')
  })

  it('renders cell values using column.value function and column.key fallback', () => {
    const columns: Column<TestItem>[] = [
      { key: 'name', label: 'Name', value: (item) => item.name.toUpperCase() },
      { key: 'status', label: 'Status' }
    ]
    const wrapper = mount(GridTable, {
      props: { columns, items, rowKeyField: 'id' }
    })

    const row0 = wrapper.find('[data-qa="row-0"]')
    expect(row0.text()).toContain('ALICE')
    expect(row0.text()).toContain('active')
  })

  it('renders DynamicComponent when column.component is defined', () => {
    const columns: Column<TestItem>[] = [
      {
        key: 'name',
        label: 'Name',
        component: (item) => ({ is: 'span', props: {}, content: `<b>${item.name}</b>` })
      }
    ]
    const wrapper = mount(GridTable, {
      props: { columns, items, rowKeyField: 'id' }
    })

    const row0 = wrapper.find('[data-qa="row-0"]')
    expect(row0.find('span').exists()).toBe(true)
    expect(row0.find('b').exists()).toBe(true)
  })

  it('shows empty row with default emptyText and custom emptyText', () => {
    const columns = makeColumns()

    const wrapperDefault = mount(GridTable, {
      props: { columns, items: [], rowKeyField: 'id' }
    })
    expect(wrapperDefault.find('tr.grid-empty-row').exists()).toBe(true)
    expect(wrapperDefault.find('tr.grid-empty-row').text()).toContain('No results found')

    const wrapperCustom = mount(GridTable, {
      props: { columns, items: [], rowKeyField: 'id', emptyText: 'Nothing here' }
    })
    expect(wrapperCustom.find('tr.grid-empty-row').text()).toContain('Nothing here')
  })

  it('shows loading row when loading and showLoader, hides when showLoader is false', () => {
    const columns = makeColumns()

    const wrapperLoading = mount(GridTable, {
      props: { columns, items, loading: true, showLoader: true, rowKeyField: 'id' }
    })
    expect(wrapperLoading.find('tr.grid-loading-row').exists()).toBe(true)
    expect(wrapperLoading.find('tr.grid-loading-row').text()).toContain('Loading...')

    const wrapperHidden = mount(GridTable, {
      props: { columns, items, loading: true, showLoader: false, rowKeyField: 'id' }
    })
    expect(wrapperHidden.find('tr.grid-loading-row').exists()).toBe(false)
  })

  it('calls onRowClick when row is clicked', async () => {
    const onRowClick = vi.fn()
    const columns = makeColumns()
    const wrapper = mount(GridTable, {
      props: { columns, items, onRowClick, rowKeyField: 'id' }
    })

    await wrapper.find('[data-qa="row-0"]').trigger('click')
    expect(onRowClick).toHaveBeenCalledOnce()
    expect(onRowClick).toHaveBeenCalledWith(items[0])
  })

  it('calls column.action when cell is clicked', async () => {
    const action = vi.fn()
    const columns: Column<TestItem>[] = [
      { key: 'name', label: 'Name', action }
    ]
    const wrapper = mount(GridTable, {
      props: { columns, items, rowKeyField: 'id' }
    })

    const cell = wrapper.find('[data-qa="row-0"] td.grid-cell')
    await cell.trigger('click')
    expect(action).toHaveBeenCalledOnce()
    expect(action).toHaveBeenCalledWith(items[0])
  })

  it('applies row options (class, style)', () => {
    const columns = makeColumns()
    const rowOptions = (item: TestItem) => ({
      class: item.status === 'active' ? 'row-active' : 'row-inactive',
      style: { color: 'green' }
    })

    const wrapper = mount(GridTable, {
      props: { columns, items, rowOptions, rowKeyField: 'id' }
    })

    const row0 = wrapper.find('[data-qa="row-0"]')
    expect(row0.classes()).toContain('row-active')
    expect(row0.attributes('style')).toContain('color: green')
  })

  it('applies cell options', () => {
    const columns: Column<TestItem>[] = [
      {
        key: 'name',
        label: 'Name',
        options: (item) => ({ class: 'cell-name', 'data-testid': `cell-${item.name}` })
      }
    ]
    const wrapper = mount(GridTable, {
      props: { columns, items, rowKeyField: 'id' }
    })

    const cell = wrapper.find('[data-qa="row-0"] td.grid-cell')
    expect(cell.classes()).toContain('cell-name')
    expect(cell.attributes('data-testid')).toBe('cell-Alice')
  })

  it('renders footer row when showFooter and columns have footer, hides otherwise', () => {
    const columnsWithFooter: Column<TestItem>[] = [
      { key: 'name', label: 'Name', footer: () => 'Total: 2' },
      { key: 'status', label: 'Status' }
    ]

    const wrapperVisible = mount(GridTable, {
      props: { columns: columnsWithFooter, items, showFooter: true, rowKeyField: 'id' }
    })
    expect(wrapperVisible.find('tr.grid-footer-row').exists()).toBe(true)

    const columnsNoFooter: Column<TestItem>[] = [
      { key: 'name', label: 'Name' },
      { key: 'status', label: 'Status' }
    ]
    const wrapperNoFooter = mount(GridTable, {
      props: { columns: columnsNoFooter, items, showFooter: true, rowKeyField: 'id' }
    })
    expect(wrapperNoFooter.find('tr.grid-footer-row').exists()).toBe(false)

    const wrapperFooterDisabled = mount(GridTable, {
      props: { columns: columnsWithFooter, items, showFooter: false, rowKeyField: 'id' }
    })
    expect(wrapperFooterDisabled.find('tr.grid-footer-row').exists()).toBe(false)
  })

  it('passes sortState to GridColumnHeader and forwards sort event', async () => {
    const onSort = vi.fn()
    const columns: Column<TestItem>[] = [
      { key: 'name', label: 'Name', sort: 'name' }
    ]
    const sortState: SortState = { field: 'name', order: 'asc' }

    const wrapper = mount(GridTable, {
      props: { columns, items, sortState, onSort, rowKeyField: 'id' }
    })

    const sortLink = wrapper.find('a.grid-sort-link')
    expect(sortLink.exists()).toBe(true)
    expect(sortLink.classes()).toContain('asc')

    await sortLink.trigger('click')
    expect(onSort).toHaveBeenCalledOnce()
    const emittedSort = onSort.mock.calls[0]
    expect(emittedSort[0]).toBe('name')
  })

  it('renders GridSearch when stateProvider provided and columns have filters', () => {
    const stateProvider = new InMemoryStateProvider()
    const columns: Column<TestItem>[] = [
      { key: 'name', label: 'Name', filter: { name: 'name', type: 'text' } },
      { key: 'status', label: 'Status' }
    ]

    const wrapper = mount(GridTable, {
      props: { columns, items, stateProvider, rowKeyField: 'id' }
    })

    expect(wrapper.find('tr.grid-search-row').exists()).toBe(true)
    expect(wrapper.find('input.grid-search-input').exists()).toBe(true)
  })

  it('does not render GridSearch without stateProvider or without filter columns', () => {
    const columns = makeColumns()

    const wrapperNoProvider = mount(GridTable, {
      props: { columns, items, rowKeyField: 'id' }
    })
    expect(wrapperNoProvider.find('tr.grid-search-row').exists()).toBe(false)
  })

  it('uses rowKeyField for row keys', () => {
    const columns = makeColumns()
    const wrapper = mount(GridTable, {
      props: { columns, items, rowKeyField: 'id' }
    })

    // Keys are set via :key which is internal to Vue's v-for, but data-qa proves correct rendering
    const rows = wrapper.findAll('tr.grid-row')
    expect(rows).toHaveLength(2)
  })

  it('hides cell when column.show returns false', () => {
    const columns: Column<TestItem>[] = [
      { key: 'name', label: 'Name', show: () => false },
      { key: 'status', label: 'Status' }
    ]
    const wrapper = mount(GridTable, {
      props: { columns, items, rowKeyField: 'id' }
    })

    const row0 = wrapper.find('[data-qa="row-0"]')
    const cells = row0.findAll('td.grid-cell')
    // First cell exists but should be empty (no span rendered inside)
    expect(cells[0].find('span').exists()).toBe(false)
    expect(cells[1].find('span').exists()).toBe(true)
  })

  it('empty slot overrides default text', () => {
    const columns = makeColumns()
    const wrapper = mount(GridTable, {
      props: { columns, items: [], rowKeyField: 'id' },
      slots: { empty: '<span data-qa="custom-empty">Custom empty</span>' }
    })

    expect(wrapper.find('[data-qa="custom-empty"]').exists()).toBe(true)
    expect(wrapper.find('[data-qa="custom-empty"]').text()).toBe('Custom empty')
  })

  it('loader slot overrides default text', () => {
    const columns = makeColumns()
    const wrapper = mount(GridTable, {
      props: { columns, items, loading: true, showLoader: true, rowKeyField: 'id' },
      slots: { loader: '<span data-qa="custom-loader">Spinner...</span>' }
    })

    expect(wrapper.find('[data-qa="custom-loader"]').exists()).toBe(true)
    expect(wrapper.find('[data-qa="custom-loader"]').text()).toBe('Spinner...')
  })

  it('forwards filterChange event from GridSearch', async () => {
    const stateProvider = new InMemoryStateProvider()
    const columns: Column<TestItem>[] = [
      { key: 'name', label: 'Name', filter: { name: 'name', type: 'text' } }
    ]

    const wrapper = mount(GridTable, {
      props: { columns, items, stateProvider, rowKeyField: 'id' }
    })

    await wrapper.find('input.grid-search-input').setValue('test')
    await flushPromises()

    expect(wrapper.emitted('filterChange')).toBeTruthy()
  })

  it('falls back to index when rowKeyField is not found on item', () => {
    const columns = makeColumns()
    const itemsNoKey = [{ name: 'Alice', status: 'active' }]
    const wrapper = mount(GridTable, {
      props: { columns, items: itemsNoKey, rowKeyField: 'missing_key' }
    })

    expect(wrapper.findAll('tr.grid-row')).toHaveLength(1)
    expect(wrapper.find('[data-qa="row-0"]').exists()).toBe(true)
  })
})

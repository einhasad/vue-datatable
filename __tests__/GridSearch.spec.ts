import { describe, expect, it } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import GridSearch from '../src/GridSearch.vue'
import { InMemoryStateProvider } from '../src/state/InMemoryStateProvider'
import type { Column } from '../src/types'

interface TestItem {
  id: number
  name: string
  status: string
}

describe('GridSearch', () => {
  it('renders input for columns with filter type text and select for type select', () => {
    const stateProvider = new InMemoryStateProvider()
    const columns: Column<TestItem>[] = [
      { key: 'name', filter: { name: 'name', type: 'text' } },
      {
        key: 'status',
        filter: {
          name: 'status',
          type: 'select',
          options: [
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' }
          ]
        }
      }
    ]

    const wrapper = mount(GridSearch, {
      props: { columns, stateProvider }
    })

    const inputs = wrapper.findAll('input.grid-search-input')
    const selects = wrapper.findAll('select.grid-search-select')
    expect(inputs).toHaveLength(1)
    expect(selects).toHaveLength(1)
    expect(inputs[0].attributes('type')).toBe('text')
  })

  it('renders no cells for columns without filters', () => {
    const stateProvider = new InMemoryStateProvider()
    const columns: Column<TestItem>[] = [
      { key: 'name', label: 'Name' },
      { key: 'status', label: 'Status' }
    ]

    const wrapper = mount(GridSearch, {
      props: { columns, stateProvider }
    })

    expect(wrapper.findAll('td.grid-search-cell')).toHaveLength(0)
  })

  it('shows current filter value from stateProvider', () => {
    const stateProvider = new InMemoryStateProvider()
    stateProvider.setFilter('name', 'Alice')
    const columns: Column<TestItem>[] = [
      { key: 'name', filter: { name: 'name', type: 'text' } }
    ]

    const wrapper = mount(GridSearch, {
      props: { columns, stateProvider }
    })

    expect(wrapper.find('input.grid-search-input').element.value).toBe('Alice')
  })

  it('emits filterChange and calls setFilter on text input', async () => {
    const stateProvider = new InMemoryStateProvider()
    const columns: Column<TestItem>[] = [
      { key: 'name', filter: { name: 'name', type: 'text' } }
    ]

    const wrapper = mount(GridSearch, {
      props: { columns, stateProvider }
    })

    await wrapper.find('input.grid-search-input').setValue('Bob')
    await flushPromises()

    expect(wrapper.emitted('filterChange')).toBeTruthy()
    expect(stateProvider.getFilter('name')).toBe('Bob')
  })

  it('calls clearFilter when input is cleared', async () => {
    const stateProvider = new InMemoryStateProvider()
    stateProvider.setFilter('name', 'Alice')
    const columns: Column<TestItem>[] = [
      { key: 'name', filter: { name: 'name', type: 'text' } }
    ]

    const wrapper = mount(GridSearch, {
      props: { columns, stateProvider }
    })

    await wrapper.find('input.grid-search-input').setValue('')
    await flushPromises()

    expect(stateProvider.getFilter('name')).toBeNull()
  })

  it('renders select options from filter.options and All as first option', () => {
    const stateProvider = new InMemoryStateProvider()
    const columns: Column<TestItem>[] = [
      {
        key: 'status',
        filter: {
          name: 'status',
          type: 'select',
          options: [
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' }
          ]
        }
      }
    ]

    const wrapper = mount(GridSearch, {
      props: { columns, stateProvider }
    })

    const options = wrapper.findAll('select.grid-search-select option')
    expect(options).toHaveLength(3)
    expect(options[0].attributes('value')).toBe('')
    expect(options[0].text()).toBe('All')
    expect(options[1].attributes('value')).toBe('active')
    expect(options[1].text()).toBe('Active')
    expect(options[2].attributes('value')).toBe('inactive')
    expect(options[2].text()).toBe('Inactive')
  })

  it('emits filterChange on select change', async () => {
    const stateProvider = new InMemoryStateProvider()
    const columns: Column<TestItem>[] = [
      {
        key: 'status',
        filter: {
          name: 'status',
          type: 'select',
          options: [
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' }
          ]
        }
      }
    ]

    const wrapper = mount(GridSearch, {
      props: { columns, stateProvider }
    })

    await wrapper.find('select.grid-search-select').setValue('active')
    await flushPromises()

    expect(wrapper.emitted('filterChange')).toBeTruthy()
    expect(stateProvider.getFilter('status')).toBe('active')
  })

  it('uses filter.name as key when available', async () => {
    const stateProvider = new InMemoryStateProvider()
    const columns: Column<TestItem>[] = [
      { key: 'name', filter: { name: 'custom_key', type: 'text' } }
    ]

    const wrapper = mount(GridSearch, {
      props: { columns, stateProvider }
    })

    await wrapper.find('input.grid-search-input').setValue('test')
    await flushPromises()

    expect(stateProvider.getFilter('custom_key')).toBe('test')
    expect(stateProvider.getFilter('name')).toBeNull()
  })

  it('falls back to column.key when filter.name is absent', async () => {
    const stateProvider = new InMemoryStateProvider()
    const columns: Column<TestItem>[] = [
      { key: 'name', filter: { type: 'text' } as any }
    ]

    const wrapper = mount(GridSearch, {
      props: { columns, stateProvider }
    })

    await wrapper.find('input.grid-search-input').setValue('test')
    await flushPromises()

    expect(stateProvider.getFilter('name')).toBe('test')
  })

  it('skips columns where showColumn is false', () => {
    const stateProvider = new InMemoryStateProvider()
    const columns: Column<TestItem>[] = [
      { key: 'name', filter: { name: 'name', type: 'text' } },
      { key: 'hidden', showColumn: false, filter: { name: 'hidden', type: 'text' } }
    ]

    const wrapper = mount(GridSearch, {
      props: { columns, stateProvider }
    })

    expect(wrapper.findAll('input.grid-search-input')).toHaveLength(1)
  })

  it('falls back to column.sort when filter.name and column.key are absent', async () => {
    const stateProvider = new InMemoryStateProvider()
    const columns: Column<TestItem>[] = [
      { sort: 'name_sort', filter: { type: 'text' } as any }
    ]

    const wrapper = mount(GridSearch, {
      props: { columns, stateProvider }
    })

    await wrapper.find('input.grid-search-input').setValue('test')
    await flushPromises()

    expect(stateProvider.getFilter('name_sort')).toBe('test')
  })

  it('falls back to empty string key when filter.name, key, and sort are all absent', async () => {
    const stateProvider = new InMemoryStateProvider()
    const columns: Column<TestItem>[] = [
      { filter: { type: 'text' } as any }
    ]

    const wrapper = mount(GridSearch, {
      props: { columns, stateProvider }
    })

    await wrapper.find('input.grid-search-input').setValue('test')
    await flushPromises()

    expect(stateProvider.getFilter('')).toBe('test')
  })

  it('renders no options for select filter without options property', () => {
    const stateProvider = new InMemoryStateProvider()
    const columns: Column<TestItem>[] = [
      {
        key: 'status',
        filter: { name: 'status', type: 'select' } as any
      }
    ]

    const wrapper = mount(GridSearch, {
      props: { columns, stateProvider }
    })

    const select = wrapper.find('select.grid-search-select')
    expect(select.exists()).toBe(true)
    // Only the "All" default option, no additional options
    const options = select.findAll('option')
    expect(options).toHaveLength(1)
    expect(options[0].text()).toBe('All')
  })
})

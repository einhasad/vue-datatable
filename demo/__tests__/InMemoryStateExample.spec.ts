import { describe, it, expect } from 'vitest'
import InMemoryStateExample from '../components/InMemoryStateExample.vue'
import { flushPromises } from '@vue/test-utils'
import { mountExample } from './helpers'

describe('InMemoryStateExample', () => {
  it('filters data by per-column inputs and resets when cleared', async () => {
    const { wrapper } = mountExample(InMemoryStateExample)

    const initialRows = wrapper.findAll('tbody tr.grid-row')
    expect(initialRows.length).toBe(5)
    expect(initialRows[0].findAll('td')[1].text()).toBe('Alice Johnson')

    const filterInputs = wrapper.findAll('.grid-search-input')
    expect(filterInputs.length).toBe(5)

    const nameFilter = filterInputs[1]
    await nameFilter.setValue('Bob')
    await nameFilter.trigger('input')

    const rowsAfterFilter = wrapper.findAll('tbody tr.grid-row')
    expect(rowsAfterFilter.length).toBe(1)
    expect(rowsAfterFilter[0].findAll('td')[1].text()).toBe('Bob Smith')

    await nameFilter.setValue('')
    await nameFilter.trigger('input')

    const rowsAfterClear = wrapper.findAll('tbody tr.grid-row')
    expect(rowsAfterClear.length).toBe(5)

    const roleFilter = filterInputs[3]
    await roleFilter.setValue('Admin')
    await roleFilter.trigger('input')

    const rowsAfterRole = wrapper.findAll('tbody tr.grid-row')
    expect(rowsAfterRole.length).toBe(3)
  })

  it('reaches every row through page navigation', async () => {
    const { wrapper } = mountExample(InMemoryStateExample)

    const pageButtons = wrapper.findAll('.grid-pagination-page-number')
    expect(pageButtons.map(b => b.text())).toEqual(['1', '2', '3'])

    await pageButtons[1].trigger('click')
    await flushPromises()
    expect(wrapper.findAll('tbody tr.grid-row').map(r => r.findAll('td')[1].text())).toEqual([
      'Frank Miller', 'Grace Lee', 'Henry Wilson', 'Ivy Chen', 'Jack Ryan'
    ])

    await wrapper.get('.grid-pagination-next').trigger('click')
    await flushPromises()
    expect(wrapper.findAll('tbody tr.grid-row').map(r => r.findAll('td')[1].text())).toEqual([
      'Kate Morgan', 'Leo Turner'
    ])
  })

  it('shows the configured filter placeholders', () => {
    const { wrapper } = mountExample(InMemoryStateExample)

    expect(wrapper.findAll('.grid-search-input').map(i => i.attributes('placeholder'))).toEqual([
      'Search ID...', 'Search Name...', 'Search Email...', 'Search Role...', 'Search Status...'
    ])
  })
})

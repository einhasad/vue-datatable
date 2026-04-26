import { describe, it, expect } from 'vitest'
import InMemoryStateExample from '../components/InMemoryStateExample.vue'
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
})

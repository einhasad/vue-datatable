import { describe, it, expect } from 'vitest'
import SearchSortExample from '../components/SearchSortExample.vue'
import { mountExample } from './helpers'

describe('SearchSortExample', () => {
  it('filters by global email search and per-column inputs', async () => {
    const { wrapper } = mountExample(SearchSortExample)

    const initialRows = wrapper.findAll('tbody tr.grid-row')
    expect(initialRows.length).toBe(22)

    const emailSearch = wrapper.find('#global-search')
    await emailSearch.setValue('@example')
    await emailSearch.trigger('input')

    const rowsAfterEmail = wrapper.findAll('tbody tr.grid-row')
    expect(rowsAfterEmail.length).toBe(14)

    const columnInputs = wrapper.findAll('.grid-search-input')
    const nameFilter = columnInputs[1]
    await nameFilter.setValue('Jon')
    await nameFilter.trigger('input')

    const rowsAfterName = wrapper.findAll('tbody tr.grid-row')
    expect(rowsAfterName.length).toBe(5)

    const idFilter = columnInputs[0]
    await idFilter.setValue('1')
    await idFilter.trigger('input')

    const rowsAfterId = wrapper.findAll('tbody tr.grid-row')
    expect(rowsAfterId.length).toBe(1)
  })
})

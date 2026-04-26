import { describe, it, expect, afterEach } from 'vitest'
import LocalStorageStateExample from '../components/LocalStorageStateExample.vue'
import { mountExample } from './helpers'

describe('LocalStorageStateExample', () => {
  afterEach(() => {
    localStorage.removeItem('grid-demo-state')
  })

  it('preloads filter from localStorage and reacts to user changes', async () => {
    const preloadedState = {
      filters: { name: 'Diana' },
      sort: null,
      page: 1
    }
    localStorage.setItem('grid-demo-state', JSON.stringify(preloadedState))

    const { wrapper } = mountExample(LocalStorageStateExample)

    const initialRows = wrapper.findAll('tbody tr.grid-row')
    expect(initialRows.length).toBe(1)
    expect(initialRows[0].findAll('td')[1].text()).toBe('Diana Prince')

    const filterInputs = wrapper.findAll('.grid-search-input')
    expect(filterInputs.length).toBe(5)

    const nameFilter = filterInputs[1]
    await nameFilter.setValue('')
    await nameFilter.trigger('input')

    const rowsAfterClear = wrapper.findAll('tbody tr.grid-row')
    expect(rowsAfterClear.length).toBe(5)

    const statusFilter = filterInputs[4]
    await statusFilter.setValue('Inactive')
    await statusFilter.trigger('input')

    const rowsAfterStatus = wrapper.findAll('tbody tr.grid-row')
    expect(rowsAfterStatus.length).toBe(3)

    const idHeader = wrapper.find('.grid-header-cell:first-child .grid-sort-link')
    await idHeader.trigger('click')
    const rowsSortDesc = wrapper.findAll('tbody tr.grid-row')
    expect(rowsSortDesc[0].findAll('td')[0].text()).toBe('1')

    await idHeader.trigger('click')
    const rowsSortAsc = wrapper.findAll('tbody tr.grid-row')
    expect(rowsSortAsc[0].findAll('td')[0].text()).toBe('3')
  })
})

import { describe, it, expect, afterEach } from 'vitest'
import HashStateExample from '../components/HashStateExample.vue'
import { mountExample } from './helpers'

describe('HashStateExample', () => {
  const originalHash = window.location.hash

  afterEach(() => {
    window.location.hash = originalHash
  })

  it('filters and sorts by hash-prefixed state', async () => {
    window.location.hash = '#hash-name=Eve'

    const { wrapper } = mountExample(HashStateExample)

    const filterInputs = wrapper.findAll('.grid-search-input')
    expect(filterInputs.length).toBe(5)

    const nameFilter = filterInputs[1]
    await nameFilter.setValue('Eve')
    await nameFilter.trigger('input')

    const rowsAfterFilter = wrapper.findAll('tbody tr.grid-row')
    expect(rowsAfterFilter.length).toBe(2)
    expect(rowsAfterFilter[0].findAll('td')[1].text()).toBe('Eve Davis')

    const idHeader = wrapper.find('.grid-header-cell:first-child .grid-sort-link')
    await idHeader.trigger('click')
    const rowsSortDesc = wrapper.findAll('tbody tr.grid-row')
    expect(rowsSortDesc[0].findAll('td')[0].text()).toBe('1')

    await idHeader.trigger('click')
    const rowsSortAsc = wrapper.findAll('tbody tr.grid-row')
    expect(rowsSortAsc[0].findAll('td')[0].text()).toBe('2')
  })
})

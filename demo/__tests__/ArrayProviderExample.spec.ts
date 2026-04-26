import { describe, it, expect } from 'vitest'
import ArrayProviderExample from '../components/ArrayProviderExample.vue'
import { mountExample } from './helpers'

describe('ArrayProviderExample', () => {
  it('paginates and sorts client-side data', async () => {
    const { wrapper } = mountExample(ArrayProviderExample)

    const rows = wrapper.findAll('tbody tr.grid-row')
    expect(rows.length).toBe(5)

    expect(rows[0].findAll('td')[0].text()).toBe('1')
    expect(rows[0].findAll('td')[1].text()).toBe('Laptop Pro')

    const pageNumbers = wrapper.findAll('.grid-pagination-page-number')
    await pageNumbers[1].trigger('click')

    const rowsPage2 = wrapper.findAll('tbody tr.grid-row')
    expect(rowsPage2.length).toBe(5)
    expect(rowsPage2[0].findAll('td')[0].text()).toBe('6')
    expect(rowsPage2[0].findAll('td')[1].text()).toBe('Webcam HD')

    const idHeader = wrapper.find('.grid-header-cell:first-child .grid-sort-link')
    await idHeader.trigger('click')
    const rowsAfterSort = wrapper.findAll('tbody tr.grid-row')
    expect(rowsAfterSort[0].findAll('td')[0].text()).toBe('10')
  })
})

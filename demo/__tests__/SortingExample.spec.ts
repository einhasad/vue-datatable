import { describe, it, expect } from 'vitest'
import SortingExample from '../components/SortingExample.vue'
import { mountExample } from './helpers'

describe('SortingExample', () => {
  it('sorts by ID via header clicks and by position via custom select event', async () => {
    const { wrapper } = mountExample(SortingExample)

    const rows = wrapper.findAll('tbody tr.grid-row')
    expect(rows.length).toBeGreaterThan(0)
    expect(rows[0].find('td').text()).toBe('1')

    const idHeader = wrapper.find('.grid-header-cell:first-child .grid-sort-link')
    await idHeader.trigger('click')
    const rowsDesc = wrapper.findAll('tbody tr.grid-row')
    expect(rowsDesc[0].find('td').text()).toBe('8')

    await idHeader.trigger('click')
    const rowsAsc = wrapper.findAll('tbody tr.grid-row')
    expect(rowsAsc[0].find('td').text()).toBe('1')

    const selectWrapper = wrapper.find('[data-qa="select-search"]')
    await selectWrapper.trigger('select', { value: 'position-desc' })
    const rowsPosDesc = wrapper.findAll('tbody tr.grid-row')
    expect(rowsPosDesc[0].find('td').text()).toBe('5')

    await selectWrapper.trigger('select', { value: 'position-asc' })
    const rowsPosAsc = wrapper.findAll('tbody tr.grid-row')
    expect(rowsPosAsc[0].find('td').text()).toBe('4')
  })
})

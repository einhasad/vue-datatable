import { describe, it, expect } from 'vitest'
import PagePaginationExample from '../components/PagePaginationExample.vue'
import { mountExample } from './helpers'

describe('PagePaginationExample', () => {
  it('navigates pages via PagePagination component', async () => {
    const { wrapper } = mountExample(PagePaginationExample)

    const rows = wrapper.findAll('tbody tr.grid-row')
    expect(rows.length).toBe(10)

    expect(rows[0].findAll('td')[1].text()).toBe('User 1')
    expect(rows[9].findAll('td')[1].text()).toBe('User 10')

    const summary = wrapper.find('.grid-pagination-summary')
    expect(summary.text()).toContain('Showing 1-10 of 47 items')

    const pageNumbers = wrapper.findAll('.grid-pagination-page-number')
    await pageNumbers[1].trigger('click')
    expect(pageNumbers[0].classes()).not.toContain('grid-pagination-active')
    expect(pageNumbers[1].classes()).toContain('grid-pagination-active')

    const rowsPage2 = wrapper.findAll('tbody tr.grid-row')
    expect(rowsPage2[0].findAll('td')[1].text()).toBe('User 11')
    expect(rowsPage2.length).toBe(10)

    await pageNumbers[4].trigger('click')
    const rowsLastPage = wrapper.findAll('tbody tr.grid-row')
    expect(rowsLastPage.length).toBe(7)
    expect(rowsLastPage[6].findAll('td')[1].text()).toBe('User 47')
  })
})

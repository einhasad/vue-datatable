import { describe, it, expect } from 'vitest'
import CursorPaginationExample from '../components/CursorPaginationExample.vue'
import { mountExample } from './helpers'

describe('CursorPaginationExample', () => {
  it('loads more rows on each Load More click', async () => {
    const { wrapper } = mountExample(CursorPaginationExample)

    const rows = wrapper.findAll('tbody tr.grid-row')
    expect(rows.length).toBe(8)
    expect(rows[0].findAll('td')[1].text()).toBe('Product 1')
    expect(rows[7].findAll('td')[1].text()).toBe('Product 8')

    const loadMoreBtn = wrapper.find('.grid-load-more')
    expect(loadMoreBtn.exists()).toBe(true)
    await loadMoreBtn.trigger('click')

    const rowsAfter = wrapper.findAll('tbody tr.grid-row')
    expect(rowsAfter.length).toBe(16)
    expect(rowsAfter[15].findAll('td')[1].text()).toBe('Product 16')

    await loadMoreBtn.trigger('click')
    const rowsAfter2 = wrapper.findAll('tbody tr.grid-row')
    expect(rowsAfter2.length).toBe(24)
  })
})

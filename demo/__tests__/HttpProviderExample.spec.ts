import { describe, it, expect } from 'vitest'
import HttpProviderExample from '../components/HttpProviderExample.vue'
import { mountExample } from './helpers'

describe('HttpProviderExample', () => {
  it('paginates default "vue table" search results', async () => {
    const { wrapper } = mountExample(HttpProviderExample)

    const rows = wrapper.findAll('tbody tr.grid-row')
    expect(rows.length).toBe(20)

    const summaries = wrapper.findAll('.grid-pagination-summary')
    expect(summaries[0].text()).toBe('23 items')
    expect(summaries[1].text()).toBe('Showing 1-20')

    const pageNumbers = wrapper.findAll('.grid-pagination-page-number')
    await pageNumbers[1].trigger('click')

    const rowsAfterPage = wrapper.findAll('tbody tr.grid-row')
    expect(rowsAfterPage.length).toBe(3)

    const summariesAfterPage = wrapper.findAll('.grid-pagination-summary')
    expect(summariesAfterPage[0].text()).toBe('23 items')
    expect(summariesAfterPage[1].text()).toBe('Showing 21-23')
  })

  it('updates result count when search query changes', async () => {
    const { wrapper } = mountExample(HttpProviderExample)

    const initialSummaries = wrapper.findAll('.grid-pagination-summary')
    expect(initialSummaries[0].text()).toBe('23 items')

    const searchInput = wrapper.find('#search')
    await searchInput.setValue('')
    await searchInput.trigger('keyup.enter')

    const clearedSummaries = wrapper.findAll('.grid-pagination-summary')
    expect(clearedSummaries[0].text()).toBe('43 items')

    await searchInput.setValue('react datatable')
    await searchInput.trigger('keyup.enter')

    const searchedSummaries = wrapper.findAll('.grid-pagination-summary')
    const rowsAfterSearch = wrapper.findAll('tbody tr.grid-row')
    expect(rowsAfterSearch.length).toBe(4)
    expect(searchedSummaries[0].text()).toBe('4 items')
  })
})

import { describe, it, expect } from 'vitest'
import MultiStateExample from '../components/MultiStateExample.vue'
import { mountExample } from './helpers'

describe('MultiStateExample', () => {
  it('renders two grids with independent state', () => {
    const { wrapper } = mountExample(MultiStateExample)

    const tables = wrapper.findAll('table')
    expect(tables.length).toBe(2)

    const allRows = wrapper.findAll('tbody tr.grid-row')
    const firstGridRows = allRows.slice(0, 5)
    expect(firstGridRows.length).toBe(5)
    expect(firstGridRows[0].findAll('td')[1].text()).toBe('Laptop Pro')

    const secondGridRows = allRows.slice(5)
    expect(secondGridRows[0].findAll('td')[1].text()).toBe('alice_smith')
  })
})

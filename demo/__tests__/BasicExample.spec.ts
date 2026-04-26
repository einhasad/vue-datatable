import { describe, it, expect } from 'vitest'
import BasicExample from '../components/BasicExample.vue'
import { mountExample } from './helpers'

describe('BasicExample', () => {
  it('renders 5 static rows with no pagination', () => {
    const { wrapper } = mountExample(BasicExample)

    const rows = wrapper.findAll('tbody tr.grid-row')
    expect(rows.length).toBe(5)

    const firstCells = rows[0].findAll('td')
    expect(firstCells[0].text()).toBe('1')
    expect(firstCells[1].text()).toBe('John Doe')
    expect(firstCells[2].text()).toBe('john@example.com')
    expect(firstCells[3].text()).toBe('Admin')

    const lastCells = rows[4].findAll('td')
    expect(lastCells[0].text()).toBe('5')
    expect(lastCells[1].text()).toBe('Charlie Wilson')

    expect(wrapper.find('.grid-pagination').exists()).toBe(false)
  })
})

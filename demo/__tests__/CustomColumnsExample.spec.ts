import { describe, it, expect } from 'vitest'
import CustomColumnsExample from '../components/CustomColumnsExample.vue'
import { mountExample } from './helpers'

describe('CustomColumnsExample', () => {
  it('renders priority badges, status text, and progress percentage', () => {
    const { wrapper } = mountExample(CustomColumnsExample)

    const rows = wrapper.findAll('tbody tr.grid-row')
    expect(rows.length).toBe(5)

    const firstCells = rows[0].findAll('td')
    expect(firstCells[0].text()).toBe('1')
    expect(firstCells[1].text()).toBe('Update documentation')
    expect(firstCells[2].text()).toBe('HIGH')
    expect(firstCells[3].text()).toBe('COMPLETED')
    expect(firstCells[4].text()).toContain('100%')

    expect(rows[1].findAll('td')[2].text()).toBe('CRITICAL')

    const thirdCells = rows[2].findAll('td')
    expect(thirdCells[2].text()).toBe('MEDIUM')
    expect(thirdCells[3].text()).toBe('IN PROGRESS')
    expect(thirdCells[4].text()).toContain('40%')
  })
})

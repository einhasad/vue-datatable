import { describe, it, expect } from 'vitest'
import CustomColumnsExample from '../components/CustomColumnsExample.vue'
import { mountExample, contrastRatio } from './helpers'

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

  it('renders priority badges with at least 4.5:1 text contrast', () => {
    const { wrapper } = mountExample(CustomColumnsExample)

    const badges = wrapper.findAll('tbody tr.grid-row').map(r => r.findAll('td')[2].get('span').element as HTMLElement)
    expect(badges.map(b => b.textContent)).toEqual(['HIGH', 'CRITICAL', 'MEDIUM', 'LOW', 'HIGH'])
    for (const badge of badges) {
      expect(contrastRatio(badge.style.color, badge.style.background)).toBeGreaterThanOrEqual(4.5)
    }
  })
})

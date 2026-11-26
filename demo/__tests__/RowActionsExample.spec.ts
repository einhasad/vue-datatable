import { describe, it, expect } from 'vitest'
import RowActionsExample from '../components/RowActionsExample.vue'
import { mountExample, contrastRatio } from './helpers'

describe('RowActionsExample', () => {
  it('shows selected user info when a row is clicked', async () => {
    const { wrapper } = mountExample(RowActionsExample)

    const rows = wrapper.findAll('tbody tr.grid-row')
    expect(rows.length).toBe(6)

    expect(wrapper.get('.demo-selected-info').text()).not.toContain('Selected:')
    expect(wrapper.get('.demo-selected-info').text()).toContain('press Enter or Space')

    await rows[0].trigger('click')
    expect(wrapper.find('.demo-selected-info').text()).toContain('John Doe')
    expect(wrapper.find('.demo-selected-info').text()).toContain('john@example.com')

    await rows[1].trigger('click')
    expect(wrapper.find('.demo-selected-info').text()).toContain('Jane Smith')
    expect(wrapper.find('.demo-selected-info').text()).not.toContain('John Doe')

    await rows[2].trigger('click')
    expect(wrapper.find('.demo-selected-info').text()).toContain('Bob Johnson')
  })

  it('applies row-selected class to the chosen row', async () => {
    const { wrapper } = mountExample(RowActionsExample)

    const rows = wrapper.findAll('tbody tr.grid-row')
    await rows[0].trigger('click')

    const updated = wrapper.findAll('tbody tr.grid-row')
    expect(updated[0].classes()).toContain('row-selected')
    expect(updated[1].classes()).not.toContain('row-selected')
  })

  it('selects a row from the keyboard', async () => {
    const { wrapper } = mountExample(RowActionsExample)

    const row = wrapper.findAll('tbody tr.grid-row')[3]
    expect(row.attributes('tabindex')).toBe('0')
    await row.trigger('keydown', { key: 'Enter' })

    expect(wrapper.get('.demo-selected-info').text()).toContain('Alice Brown')
    expect(wrapper.findAll('tbody tr.grid-row')[3].classes()).toContain('row-selected')
  })

  it('renders status badges with at least 4.5:1 text contrast', () => {
    const { wrapper } = mountExample(RowActionsExample)

    const badges = wrapper.findAll('tbody tr.grid-row').map(r => r.findAll('td')[3].get('span').element as HTMLElement)
    expect(badges.map(b => b.textContent)).toEqual(['Active', 'Active', 'Inactive', 'Active', 'Active', 'Inactive'])
    for (const badge of badges) {
      expect(contrastRatio(badge.style.color, badge.style.background)).toBeGreaterThanOrEqual(4.5)
    }
  })
})

import { describe, it, expect } from 'vitest'
import RowActionsExample from '../components/RowActionsExample.vue'
import { mountExample } from './helpers'

describe('RowActionsExample', () => {
  it('shows selected user info when a row is clicked', async () => {
    const { wrapper } = mountExample(RowActionsExample)

    const rows = wrapper.findAll('tbody tr.grid-row')
    expect(rows.length).toBe(6)

    expect(wrapper.find('.demo-selected-info').exists()).toBe(false)

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
})

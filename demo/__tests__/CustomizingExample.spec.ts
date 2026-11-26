import { describe, it, expect } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import CustomizingExample from '../components/CustomizingExample.vue'
import { mountExample } from './helpers'

async function selectMode(wrapper: ReturnType<typeof mountExample>['wrapper'], mode: string): Promise<void> {
  await wrapper.find(`button[data-mode="${mode}"]`).trigger('click')
  await flushPromises()
}

describe('CustomizingExample', () => {
  it('shows the first page of data on mount', async () => {
    const { wrapper } = mountExample(CustomizingExample)
    await flushPromises()

    expect(wrapper.findAll('tbody tr.grid-row')).toHaveLength(8)
    expect(wrapper.find('.cz-loader').exists()).toBe(false)
  })

  it('shows the custom #loader while "Loading…" is selected', async () => {
    const { wrapper } = mountExample(CustomizingExample)
    await flushPromises()

    await selectMode(wrapper, 'loading')

    expect(wrapper.find('.cz-loader').exists()).toBe(true)
    expect(wrapper.find('.cz-loader').text()).toContain('Crunching data')
    expect(wrapper.find('.grid').attributes('aria-busy')).toBe('true')
    expect(wrapper.findAll('tbody tr.grid-row')).toHaveLength(0)
  })

  it('leaves the loader when another state is selected', async () => {
    const { wrapper } = mountExample(CustomizingExample)
    await flushPromises()
    await selectMode(wrapper, 'loading')

    await selectMode(wrapper, 'data')

    expect(wrapper.find('.cz-loader').exists()).toBe(false)
    expect(wrapper.find('.grid').attributes('aria-busy')).toBe('false')
    expect(wrapper.findAll('tbody tr.grid-row')).toHaveLength(8)
  })

  it('shows the custom #empty slot and zero items in "Empty state"', async () => {
    const { wrapper } = mountExample(CustomizingExample)
    await flushPromises()

    await selectMode(wrapper, 'empty')

    expect(wrapper.find('.cz-empty').exists()).toBe(true)
    expect(wrapper.text()).not.toMatch(/of 23 items/)
  })

  it('names the demo state button group and marks the pressed button', async () => {
    const { wrapper } = mountExample(CustomizingExample)
    await flushPromises()

    const group = wrapper.find('[role="group"]')
    const labelId = group.attributes('aria-labelledby')
    expect(wrapper.find(`#${labelId}`).text()).toBe('Demo state')
    const buttons = group.findAll('button')
    expect(buttons.every(b => b.attributes('type') === 'button')).toBe(true)
    expect(group.find('button[data-mode="data"]').attributes('aria-pressed')).toBe('true')
    expect(group.find('button[data-mode="loading"]').attributes('aria-pressed')).toBe('false')
  })
})

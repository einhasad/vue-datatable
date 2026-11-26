import { describe, it, expect } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import MassActionExample from '../components/MassActionExample.vue'
import { mountExample } from './helpers'

type Wrapper = ReturnType<typeof mountExample>['wrapper']

function visibleNames(wrapper: Wrapper): string[] {
  return wrapper.findAll('tbody tr.grid-row').map(row => row.findAll('td')[2].text())
}

async function goToPage(wrapper: Wrapper, page: number): Promise<void> {
  const button = wrapper.findAll('.grid-pagination-page-number').find(b => b.text() === String(page))
  if (!button) throw new Error(`page ${page} button not found`)
  await button.trigger('click')
  await flushPromises()
}

async function check(wrapper: Wrapper, name: string): Promise<void> {
  await wrapper.find(`input[aria-label="Select ${name}"]`).trigger('change')
  await flushPromises()
}

async function collectAllNames(wrapper: Wrapper): Promise<string[]> {
  const total = Number(wrapper.find('[data-qa="grid-items-total"]').text())
  const names: string[] = []
  for (let page = 1; names.length < total; page++) {
    await goToPage(wrapper, page)
    names.push(...visibleNames(wrapper))
  }
  return names
}

describe('MassActionExample', () => {
  it('deletes exactly the rows selected across pages and keeps every other row', async () => {
    const { wrapper } = mountExample(MassActionExample)
    await flushPromises()

    await check(wrapper, 'User 1')
    await goToPage(wrapper, 2)
    await check(wrapper, 'User 7')
    expect(wrapper.find('.mass-action-demo__count').text()).toBe('2 selected')

    await wrapper.find('.ds-btn--danger').trigger('click')
    await flushPromises()

    expect(wrapper.find('[data-qa="grid-items-total"]').text()).toBe('21')
    expect(wrapper.find('.mass-action-demo__count').text()).toBe('0 selected')
    const remaining = await collectAllNames(wrapper)
    const expected = Array.from({ length: 23 }, (_, i) => `User ${i + 1}`)
      .filter(name => name !== 'User 1' && name !== 'User 7')
    expect(remaining).toEqual(expected)
  })

  it('names every row checkbox after its user', async () => {
    const { wrapper } = mountExample(MassActionExample)
    await flushPromises()

    const labels = wrapper.findAll('input.mass-action-demo__checkbox').map(c => c.attributes('aria-label'))
    expect(labels).toEqual(['Select User 1', 'Select User 2', 'Select User 3', 'Select User 4', 'Select User 5'])
  })

  it('announces the selection count', async () => {
    const { wrapper } = mountExample(MassActionExample)
    await flushPromises()

    expect(wrapper.find('.mass-action-demo__count').attributes('role')).toBe('status')
  })
})

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import ExpandableRowsExample from '../components/ExpandableRowsExample.vue'
import { mountExample } from './helpers'

type Wrapper = ReturnType<typeof mountExample>['wrapper']

function departmentNames(wrapper: Wrapper): string[] {
  return wrapper.findAll('tbody tr.grid-row').map(row => row.findAll('td')[1].text())
}

async function toggleRow(wrapper: Wrapper, index: number): Promise<void> {
  await wrapper.findAll('tbody tr.grid-row')[index].find('[data-qa="grid-chevron"]').trigger('click')
  await vi.advanceTimersByTimeAsync(300)
  await flushPromises()
}

async function goToPage(wrapper: Wrapper, page: number): Promise<void> {
  const button = wrapper.findAll('.grid-pagination-page-number').find(b => b.text() === String(page))
  if (!button) throw new Error(`page ${page} button not found`)
  await button.trigger('click')
  await flushPromises()
}

describe('ExpandableRowsExample', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows the loaded children under an expanded department', async () => {
    const { wrapper } = mountExample(ExpandableRowsExample)
    await flushPromises()

    await toggleRow(wrapper, 0)

    expect(departmentNames(wrapper).slice(0, 4)).toEqual([
      'Department 1',
      'Department 1 · sub 1',
      'Department 1 · sub 2',
      'Department 1 · sub 3',
    ])
  })

  it('keeps every department after expanding and changing page', async () => {
    const { wrapper } = mountExample(ExpandableRowsExample)
    await flushPromises()
    await toggleRow(wrapper, 0)

    await goToPage(wrapper, 2)

    expect(departmentNames(wrapper)).toEqual([
      'Department 6',
      'Department 7',
      'Department 8',
      'Department 9',
      'Department 10',
    ])
    expect(wrapper.find('[data-qa="grid-items-total"]').text()).toBe('17')
    expect(wrapper.findAll('.grid-pagination-page-number').map(b => b.text())).toEqual(['1', '2', '3', '4'])
  })

  it('removes the children on collapse and keeps the dataset intact', async () => {
    const { wrapper } = mountExample(ExpandableRowsExample)
    await flushPromises()
    await toggleRow(wrapper, 0)

    await toggleRow(wrapper, 0)

    expect(departmentNames(wrapper)).toEqual([
      'Department 1',
      'Department 2',
      'Department 3',
      'Department 4',
      'Department 5',
    ])
    expect(wrapper.find('[data-qa="grid-items-total"]').text()).toBe('17')
  })

  it('attaches children to the expanded department even if the page changed while they loaded', async () => {
    const { wrapper } = mountExample(ExpandableRowsExample)
    await flushPromises()

    await wrapper.findAll('tbody tr.grid-row')[0].find('[data-qa="grid-chevron"]').trigger('click')
    await goToPage(wrapper, 2)
    await vi.advanceTimersByTimeAsync(300)
    await flushPromises()

    expect(departmentNames(wrapper)).toEqual([
      'Department 6',
      'Department 7',
      'Department 8',
      'Department 9',
      'Department 10',
    ])
    await goToPage(wrapper, 1)
    expect(departmentNames(wrapper).slice(0, 2)).toEqual(['Department 1', 'Department 1 · sub 1'])
  })
})

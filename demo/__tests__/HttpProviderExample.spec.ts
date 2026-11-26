import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { flushPromises, type VueWrapper } from '@vue/test-utils'
import HttpProviderExample from '../components/HttpProviderExample.vue'
import { repositories } from '../data/mockRepositories'
import { mountExample } from './helpers'

const STARS_COLUMN = 3
const FORKS_COLUMN = 4

async function settle(): Promise<void> {
  await vi.advanceTimersByTimeAsync(1000)
  await flushPromises()
}

function columnNumbers(wrapper: VueWrapper, column: number): number[] {
  return wrapper
    .findAll('tbody tr.grid-row')
    .map((row) => Number(row.findAll('td')[column].text().replace(/,/g, '')))
}

function summary(wrapper: VueWrapper): string {
  return wrapper.find('.grid-pagination-summary').text()
}

function sortButton(wrapper: VueWrapper, label: string) {
  const button = wrapper.findAll('button.grid-sort-link').find((b) => b.text() === label)
  if (!button) throw new Error(`no sort button ${label}`)
  return button
}

describe('HttpProviderExample', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('is busy until the async loadFn resolves', async () => {
    const { wrapper } = mountExample(HttpProviderExample)
    await flushPromises()
    expect(wrapper.find('.grid').attributes('aria-busy')).toBe('true')

    await settle()
    expect(wrapper.find('.grid').attributes('aria-busy')).toBe('false')
    expect(wrapper.findAll('tbody tr.grid-row')).toHaveLength(20)
  })

  it('loads the first page sorted by stars descending, with totals from loadFn', async () => {
    const { wrapper } = mountExample(HttpProviderExample)
    await settle()

    const expected = repositories.map((repo) => repo.stars).sort((a, b) => b - a).slice(0, 20)
    expect(columnNumbers(wrapper, STARS_COLUMN)).toEqual(expected)
    expect(summary(wrapper)).toBe(`Showing 1-20 of ${repositories.length} items`)
    expect(sortButton(wrapper, 'Stars').classes()).toContain('desc')
  })

  it('renders repository names as plain text, not links', async () => {
    const { wrapper } = mountExample(HttpProviderExample)
    await settle()

    expect(wrapper.find('tbody a').exists()).toBe(false)
    expect(wrapper.find('tbody tr.grid-row td').text()).toMatch(/^[a-z-]+\/[a-z-]+$/)
  })

  it('requests the selected page from loadFn', async () => {
    const { wrapper } = mountExample(HttpProviderExample)
    await settle()

    const lastPage = Math.ceil(repositories.length / 20)
    const pageButton = wrapper.findAll('.grid-pagination-page-number').find((b) => b.text() === String(lastPage))
    await pageButton!.trigger('click')
    await settle()

    const lastPageSize = repositories.length - (lastPage - 1) * 20
    expect(wrapper.findAll('tbody tr.grid-row')).toHaveLength(lastPageSize)
    expect(summary(wrapper)).toBe(`Showing ${repositories.length - lastPageSize + 1}-${repositories.length} of ${repositories.length} items`)
  })

  it('passes the committed search term to loadFn and returns to page 1', async () => {
    const { wrapper } = mountExample(HttpProviderExample)
    await settle()

    await wrapper.findAll('.grid-pagination-page-number')[1].trigger('click')
    await settle()

    await wrapper.find('#repo-search').setValue('vue table')
    await wrapper.find('form[role="search"]').trigger('submit')
    await settle()

    const matching = repositories.filter((repo) => repo.description.includes('vue table'))
    const names = wrapper.findAll('tbody tr.grid-row').map((row) => row.find('td').text())
    expect(names).toHaveLength(matching.length)
    expect(names.every((name) => name.includes('vue-table'))).toBe(true)
    expect(summary(wrapper)).toBe(`Showing 1-${matching.length} of ${matching.length} items`)

    await wrapper.find('#repo-search').setValue('')
    await wrapper.find('form[role="search"]').trigger('submit')
    await settle()
    expect(summary(wrapper)).toBe(`Showing 1-20 of ${repositories.length} items`)
  })

  it('sorts on the server across all pages when a header is clicked', async () => {
    const { wrapper } = mountExample(HttpProviderExample)
    await settle()

    await sortButton(wrapper, 'Forks').trigger('click')
    await settle()

    const expected = repositories.map((repo) => repo.forks).sort((a, b) => a - b).slice(0, 20)
    expect(columnNumbers(wrapper, FORKS_COLUMN)).toEqual(expected)
    expect(sortButton(wrapper, 'Forks').classes()).toContain('asc')
    expect(sortButton(wrapper, 'Stars').classes()).not.toContain('desc')
  })
})

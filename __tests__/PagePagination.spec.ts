import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PagePagination from '../src/PagePagination.vue'

describe('PagePagination', () => {
  function createWrapper(overrides: Record<string, unknown> = {}) {
    return mount(PagePagination, {
      props: {
        currentPage: 1,
        totalPages: 10,
        totalItems: 100,
        itemsPerPage: 10,
        ...overrides
      }
    })
  }

  it('renders when totalPages > 0', () => {
    const wrapper = createWrapper({ totalPages: 5, currentPage: 1, totalItems: 50 })

    expect(wrapper.find('.grid-pagination').exists()).toBe(true)
  })

  it('does not render when totalPages is 0', () => {
    const wrapper = createWrapper({ totalPages: 0, currentPage: 1, totalItems: 0 })

    expect(wrapper.find('.grid-pagination').exists()).toBe(false)
  })

  it('marks current page as active', () => {
    const wrapper = createWrapper({ currentPage: 3, totalPages: 10, totalItems: 100 })

    const activeLink = wrapper.find('.grid-pagination-active')
    expect(activeLink.exists()).toBe(true)
    expect(activeLink.text()).toBe('3')
  })

  it('disables prev when currentPage is 1', () => {
    const wrapper = createWrapper({ currentPage: 1, totalPages: 10, totalItems: 100 })

    const prev = wrapper.find('.grid-pagination-prev')
    expect(prev.classes()).toContain('grid-pagination-disabled')
  })

  it('disables next when currentPage equals totalPages', () => {
    const wrapper = createWrapper({ currentPage: 10, totalPages: 10, totalItems: 100 })

    const next = wrapper.find('.grid-pagination-next')
    expect(next.classes()).toContain('grid-pagination-disabled')
  })

  it('emits pageChange when page link clicked', async () => {
    const wrapper = createWrapper({ currentPage: 1, totalPages: 10, totalItems: 100 })

    const pageLinks = wrapper.findAll('.grid-pagination-page-number')
    // Click page 3
    await pageLinks.find(link => link.text() === '3')!.trigger('click')

    expect(wrapper.emitted('pageChange')).toHaveLength(1)
    expect(wrapper.emitted('pageChange')![0]).toEqual([3])
  })

  it('emits pageChange when next clicked', async () => {
    const wrapper = createWrapper({ currentPage: 3, totalPages: 10, totalItems: 100 })

    await wrapper.find('.grid-pagination-next').trigger('click')

    expect(wrapper.emitted('pageChange')).toHaveLength(1)
    expect(wrapper.emitted('pageChange')![0]).toEqual([4])
  })

  it('emits pageChange when prev clicked', async () => {
    const wrapper = createWrapper({ currentPage: 3, totalPages: 10, totalItems: 100 })

    await wrapper.find('.grid-pagination-prev').trigger('click')

    expect(wrapper.emitted('pageChange')).toHaveLength(1)
    expect(wrapper.emitted('pageChange')![0]).toEqual([2])
  })

  it('does not emit for disabled prev click', async () => {
    const wrapper = createWrapper({ currentPage: 1, totalPages: 10, totalItems: 100 })

    await wrapper.find('.grid-pagination-prev').trigger('click')

    expect(wrapper.emitted('pageChange')).toBeUndefined()
  })

  it('does not emit for disabled next click', async () => {
    const wrapper = createWrapper({ currentPage: 10, totalPages: 10, totalItems: 100 })

    await wrapper.find('.grid-pagination-next').trigger('click')

    expect(wrapper.emitted('pageChange')).toBeUndefined()
  })

  it('does not emit when clicking current page', async () => {
    const wrapper = createWrapper({ currentPage: 3, totalPages: 10, totalItems: 100 })

    const activeLink = wrapper.find('.grid-pagination-active')
    await activeLink.trigger('click')

    expect(wrapper.emitted('pageChange')).toBeUndefined()
  })

  it('shows summary text when showSummary is true', () => {
    const wrapper = createWrapper({ currentPage: 1, totalPages: 10, totalItems: 100, showSummary: true })

    const summary = wrapper.find('.grid-pagination-summary')
    expect(summary.exists()).toBe(true)
    expect(summary.text()).toBe('Showing 1-10 of 100 items')
  })

  it('hides summary text when showSummary is false', () => {
    const wrapper = createWrapper({ currentPage: 1, totalPages: 10, totalItems: 100, showSummary: false })

    expect(wrapper.find('.grid-pagination-summary').exists()).toBe(false)
  })

  it('shows maxVisiblePages page numbers (default 5)', () => {
    const wrapper = createWrapper({ currentPage: 5, totalPages: 20, totalItems: 200 })

    const pageNumbers = wrapper.findAll('.grid-pagination-page-number')
    expect(pageNumbers).toHaveLength(5)
  })

  it('adjusts window when near end of range', () => {
    const wrapper = createWrapper({ currentPage: 10, totalPages: 10, totalItems: 100 })

    const pageNumbers = wrapper.findAll('.grid-pagination-page-number')
    expect(pageNumbers).toHaveLength(5)
    // Should show pages 6,7,8,9,10 (sliding window adjusted to end)
    const texts = pageNumbers.map(el => el.text())
    expect(texts).toEqual(['6', '7', '8', '9', '10'])
  })
})

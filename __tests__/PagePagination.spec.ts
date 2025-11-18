import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PagePagination from '../src/PagePagination.vue'
import type { Pagination } from '../src/types'

describe('PagePagination', () => {
  const createMockPagination = (currentPage: number, pageCount: number, totalCount: number = 100, pageSize: number = 10): Pagination => ({
    getTotalCount: () => totalCount,
    getPageCount: () => pageCount,
    getCurrentPage: () => currentPage,
    getPageSize: () => pageSize,
    getNextToken: () => null,
    hasMore: () => currentPage < pageCount
  })

  it('should render pagination with page numbers', () => {
    const pagination = createMockPagination(1, 5)
    const wrapper = mount(PagePagination, {
      props: { pagination }
    })

    const pageButtons = wrapper.findAll('.grid-pagination-page-number')
    expect(pageButtons.length).toBeGreaterThan(0)
  })

  it('should show pagination summary', () => {
    const pagination = createMockPagination(1, 5, 50, 10)
    const wrapper = mount(PagePagination, {
      props: {
        pagination,
        showSummary: true
      }
    })

    const summary = wrapper.find('.grid-pagination-summary')
    expect(summary.exists()).toBe(true)
    expect(summary.text()).toContain('1')
    expect(summary.text()).toContain('10')
    expect(summary.text()).toContain('50')
  })

  it('should hide summary when showSummary is false', () => {
    const pagination = createMockPagination(1, 5, 50, 10)
    const wrapper = mount(PagePagination, {
      props: {
        pagination,
        showSummary: false
      }
    })

    expect(wrapper.find('.grid-pagination-summary').exists()).toBe(false)
  })

  it('should highlight current page', () => {
    const pagination = createMockPagination(3, 5)
    const wrapper = mount(PagePagination, {
      props: { pagination }
    })

    const activePage = wrapper.find('li.active')
    expect(activePage.exists()).toBe(true)
    expect(activePage.find('button').text()).toBe('3')
  })

  it('should emit pageChange when page button clicked', async () => {
    const pagination = createMockPagination(1, 5)
    const wrapper = mount(PagePagination, {
      props: { pagination }
    })

    const pageButtons = wrapper.findAll('.grid-pagination-page-number')
    await pageButtons[1].trigger('click')

    expect(wrapper.emitted('pageChange')).toBeTruthy()
    expect(wrapper.emitted('pageChange')![0]).toEqual([2])
  })

  it('should emit pageChange for previous button', async () => {
    const pagination = createMockPagination(3, 5)
    const wrapper = mount(PagePagination, {
      props: { pagination }
    })

    const prevButton = wrapper.find('.grid-pagination-previous')
    await prevButton.trigger('click')

    expect(wrapper.emitted('pageChange')).toBeTruthy()
    expect(wrapper.emitted('pageChange')![0]).toEqual([2])
  })

  it('should emit pageChange for next button', async () => {
    const pagination = createMockPagination(2, 5)
    const wrapper = mount(PagePagination, {
      props: { pagination }
    })

    const nextButton = wrapper.find('.grid-pagination-next')
    await nextButton.trigger('click')

    expect(wrapper.emitted('pageChange')).toBeTruthy()
    expect(wrapper.emitted('pageChange')![0]).toEqual([3])
  })

  it('should disable previous button on first page', () => {
    const pagination = createMockPagination(1, 5)
    const wrapper = mount(PagePagination, {
      props: {
        pagination,
        hidePrevNextOnEdge: false
      }
    })

    const prevButton = wrapper.find('.grid-pagination-previous')
    expect(prevButton.attributes('disabled')).toBeDefined()
  })

  it('should disable next button on last page', () => {
    const pagination = createMockPagination(5, 5)
    const wrapper = mount(PagePagination, {
      props: {
        pagination,
        hidePrevNextOnEdge: false
      }
    })

    const nextButton = wrapper.find('.grid-pagination-next')
    expect(nextButton.attributes('disabled')).toBeDefined()
  })

  it('should hide prev/next buttons on edges when hidePrevNextOnEdge is true', () => {
    const pagination = createMockPagination(1, 5)
    const wrapper = mount(PagePagination, {
      props: {
        pagination,
        hidePrevNextOnEdge: true
      }
    })

    expect(wrapper.find('.grid-pagination-previous').exists()).toBe(false)
  })

  it('should limit visible pages based on maxVisiblePages', () => {
    const pagination = createMockPagination(5, 10)
    const wrapper = mount(PagePagination, {
      props: {
        pagination,
        maxVisiblePages: 5
      }
    })

    const pageButtons = wrapper.findAll('.grid-pagination-page-number')
    expect(pageButtons.length).toBeLessThanOrEqual(5)
  })

  it('should render nothing when pagination is null', () => {
    const wrapper = mount(PagePagination, {
      props: {
        pagination: null
      }
    })

    expect(wrapper.find('.pagination').exists()).toBe(false)
  })

  it('should use custom slot for previous text', () => {
    const pagination = createMockPagination(2, 5)
    const wrapper = mount(PagePagination, {
      props: {
        pagination,
        hidePrevNextOnEdge: false
      },
      slots: {
        'previous-text': 'Prev'
      }
    })

    const prevButton = wrapper.find('.grid-pagination-previous')
    expect(prevButton.text()).toBe('Prev')
  })

  it('should use custom slot for next text', () => {
    const pagination = createMockPagination(2, 5)
    const wrapper = mount(PagePagination, {
      props: {
        pagination,
        hidePrevNextOnEdge: false
      },
      slots: {
        'next-text': 'Next'
      }
    })

    const nextButton = wrapper.find('.grid-pagination-next')
    expect(nextButton.text()).toBe('Next')
  })

  it('should not render pagination when pageCount is 1', () => {
    const pagination = createMockPagination(1, 1)
    const wrapper = mount(PagePagination, {
      props: { pagination }
    })

    expect(wrapper.find('.pagination').exists()).toBe(false)
  })
})

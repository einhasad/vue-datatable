import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import GridPagination from '../src/GridPagination.vue'
import type { PagePaginationData, CursorPaginationData } from '../src/types'

describe('GridPagination', () => {
  describe('Cursor Pagination Mode', () => {
    it('should render load more button when hasMore is true', () => {
      const wrapper = mount(GridPagination, {
        props: {
          mode: 'cursor',
          hasMore: true,
          loading: false
        }
      })

      expect(wrapper.find('.grid-load-more-button').exists()).toBe(true)
      expect(wrapper.find('.grid-load-more-button').text()).toBe('Load More')
    })

    it('should show loading text when loading', () => {
      const wrapper = mount(GridPagination, {
        props: {
          mode: 'cursor',
          hasMore: true,
          loading: true
        }
      })

      expect(wrapper.find('.grid-load-more-button').text()).toBe('Loading...')
      expect((wrapper.find('.grid-load-more-button').element as HTMLButtonElement).disabled).toBe(true)
    })

    it('should show no more results when hasMore is false', () => {
      const wrapper = mount(GridPagination, {
        props: {
          mode: 'cursor',
          hasMore: false,
          loading: false
        }
      })

      expect(wrapper.find('.grid-no-more').exists()).toBe(true)
      expect(wrapper.find('.grid-no-more').text()).toBe('No more results')
    })

    it('should emit loadMore event when button clicked', async () => {
      const wrapper = mount(GridPagination, {
        props: {
          mode: 'cursor',
          hasMore: true,
          loading: false
        }
      })

      await wrapper.find('.grid-load-more-button').trigger('click')

      expect(wrapper.emitted('loadMore')).toBeTruthy()
      expect(wrapper.emitted('loadMore')).toHaveLength(1)
    })

    it('should call onLoadMore prop when provided', async () => {
      const onLoadMore = vi.fn()
      const wrapper = mount(GridPagination, {
        props: {
          mode: 'cursor',
          hasMore: true,
          loading: false,
          onLoadMore
        }
      })

      await wrapper.find('.grid-load-more-button').trigger('click')

      expect(onLoadMore).toHaveBeenCalled()
    })
  })

  describe('Page Pagination Mode', () => {
    const pagePaginationData: PagePaginationData = {
      currentPage: 2,
      pageCount: 5,
      perPage: 10,
      totalCount: 50
    }

    it('should render page numbers', () => {
      const wrapper = mount(GridPagination, {
        props: {
          mode: 'page',
          pagination: pagePaginationData,
          loading: false
        }
      })

      const pageButtons = wrapper.findAll('.grid-pagination-page-number')
      expect(pageButtons.length).toBeGreaterThan(0)
    })

    it('should highlight current page', () => {
      const wrapper = mount(GridPagination, {
        props: {
          mode: 'page',
          pagination: pagePaginationData,
          loading: false
        }
      })

      const activeItem = wrapper.find('.active')
      expect(activeItem.exists()).toBe(true)
      expect(activeItem.find('.grid-pagination-page-number').text()).toBe('2')
    })

    it('should emit pageChange event when page clicked', async () => {
      const wrapper = mount(GridPagination, {
        props: {
          mode: 'page',
          pagination: pagePaginationData,
          loading: false
        }
      })

      const pageButtons = wrapper.findAll('.grid-pagination-page-number')
      await pageButtons[0].trigger('click')

      expect(wrapper.emitted('pageChange')).toBeTruthy()
      expect(wrapper.emitted('pageChange')?.[0]).toBeDefined()
    })

    it('should call onPageChange prop when provided', async () => {
      const onPageChange = vi.fn()
      const wrapper = mount(GridPagination, {
        props: {
          mode: 'page',
          pagination: pagePaginationData,
          loading: false,
          onPageChange
        }
      })

      const pageButtons = wrapper.findAll('.grid-pagination-page-number')
      await pageButtons[0].trigger('click')

      expect(onPageChange).toHaveBeenCalled()
    })

    it('should show pagination summary', () => {
      const wrapper = mount(GridPagination, {
        props: {
          mode: 'page',
          pagination: pagePaginationData,
          loading: false,
          showSummary: true
        }
      })

      expect(wrapper.find('.grid-pagination-summary').exists()).toBe(true)
      expect(wrapper.find('.grid-pagination-summary').text()).toContain('Showing')
    })

    it('should hide pagination summary when showSummary is false', () => {
      const wrapper = mount(GridPagination, {
        props: {
          mode: 'page',
          pagination: pagePaginationData,
          loading: false,
          showSummary: false
        }
      })

      expect(wrapper.find('.grid-pagination-summary').exists()).toBe(false)
    })

    it('should render previous button', () => {
      const wrapper = mount(GridPagination, {
        props: {
          mode: 'page',
          pagination: pagePaginationData,
          loading: false
        }
      })

      expect(wrapper.find('.grid-pagination-previous').exists()).toBe(true)
    })

    it('should render next button', () => {
      const wrapper = mount(GridPagination, {
        props: {
          mode: 'page',
          pagination: pagePaginationData,
          loading: false
        }
      })

      expect(wrapper.find('.grid-pagination-next').exists()).toBe(true)
    })

    it('should disable previous button on first page', () => {
      const firstPageData: PagePaginationData = {
        currentPage: 1,
        pageCount: 5,
        perPage: 10,
        totalCount: 50
      }

      const wrapper = mount(GridPagination, {
        props: {
          mode: 'page',
          pagination: firstPageData,
          loading: false,
          hidePrevNextOnEdge: false
        }
      })

      expect((wrapper.find('.grid-pagination-previous').element as HTMLButtonElement).disabled).toBe(true)
    })

    it('should disable next button on last page', () => {
      const lastPageData: PagePaginationData = {
        currentPage: 5,
        pageCount: 5,
        perPage: 10,
        totalCount: 50
      }

      const wrapper = mount(GridPagination, {
        props: {
          mode: 'page',
          pagination: lastPageData,
          loading: false,
          hidePrevNextOnEdge: false
        }
      })

      expect((wrapper.find('.grid-pagination-next').element as HTMLButtonElement).disabled).toBe(true)
    })

    it('should go to previous page when previous button clicked', async () => {
      const wrapper = mount(GridPagination, {
        props: {
          mode: 'page',
          pagination: pagePaginationData,
          loading: false
        }
      })

      await wrapper.find('.grid-pagination-previous').trigger('click')

      expect(wrapper.emitted('pageChange')).toBeTruthy()
      expect(wrapper.emitted('pageChange')?.[0]).toEqual([1])
    })

    it('should go to next page when next button clicked', async () => {
      const wrapper = mount(GridPagination, {
        props: {
          mode: 'page',
          pagination: pagePaginationData,
          loading: false
        }
      })

      await wrapper.find('.grid-pagination-next').trigger('click')

      expect(wrapper.emitted('pageChange')).toBeTruthy()
      expect(wrapper.emitted('pageChange')?.[0]).toEqual([3])
    })

    it('should limit visible pages based on maxVisiblePages', () => {
      const manyPagesData: PagePaginationData = {
        currentPage: 5,
        pageCount: 20,
        perPage: 10,
        totalCount: 200
      }

      const wrapper = mount(GridPagination, {
        props: {
          mode: 'page',
          pagination: manyPagesData,
          loading: false,
          maxVisiblePages: 5
        }
      })

      const pageButtons = wrapper.findAll('.grid-pagination-page-number')
      expect(pageButtons.length).toBeLessThanOrEqual(5)
    })

    it('should disable all buttons when loading', () => {
      const wrapper = mount(GridPagination, {
        props: {
          mode: 'page',
          pagination: pagePaginationData,
          loading: true
        }
      })

      const allButtons = wrapper.findAll('.grid-pagination-button')
      allButtons.forEach(button => {
        expect((button.element as HTMLButtonElement).disabled).toBe(true)
      })
    })

    it('should hide prev/next on edges when hidePrevNextOnEdge is true', () => {
      const firstPageData: PagePaginationData = {
        currentPage: 1,
        pageCount: 5,
        perPage: 10,
        totalCount: 50
      }

      const wrapper = mount(GridPagination, {
        props: {
          mode: 'page',
          pagination: firstPageData,
          loading: false,
          hidePrevNextOnEdge: true
        }
      })

      expect(wrapper.find('.grid-pagination-previous').exists()).toBe(false)
    })

    it('should not render pagination for single page', () => {
      const singlePageData: PagePaginationData = {
        currentPage: 1,
        pageCount: 1,
        perPage: 10,
        totalCount: 5
      }

      const wrapper = mount(GridPagination, {
        props: {
          mode: 'page',
          pagination: singlePageData,
          loading: false
        }
      })

      expect(wrapper.find('.pagination').exists()).toBe(false)
    })
  })

  describe('Edge Cases', () => {
    it('should render empty when mode is cursor but no hasMore prop', () => {
      const wrapper = mount(GridPagination, {
        props: {
          mode: 'cursor',
          loading: false
        }
      })

      expect(wrapper.find('.grid-load-more-button').exists()).toBe(false)
      expect(wrapper.find('.grid-no-more').exists()).toBe(true)
    })

    it('should handle null pagination gracefully', () => {
      const wrapper = mount(GridPagination, {
        props: {
          mode: 'page',
          pagination: null,
          loading: false
        }
      })

      expect(wrapper.find('.pagination').exists()).toBe(false)
    })

    it('should handle cursor pagination data in page mode', () => {
      const cursorData: CursorPaginationData = {
        nextCursor: 'abc',
        hasMore: true
      }

      const wrapper = mount(GridPagination, {
        props: {
          mode: 'page',
          pagination: cursorData as any,
          loading: false
        }
      })

      expect(wrapper.find('.pagination').exists()).toBe(false)
    })
  })

  describe('Custom Slots', () => {
    it('should render custom load-more-text slot', () => {
      const wrapper = mount(GridPagination, {
        props: {
          mode: 'cursor',
          hasMore: true,
          loading: false
        },
        slots: {
          'load-more-text': 'Custom Load More'
        }
      })

      expect(wrapper.find('.grid-load-more-button').text()).toBe('Custom Load More')
    })

    it('should render custom no-more-text slot', () => {
      const wrapper = mount(GridPagination, {
        props: {
          mode: 'cursor',
          hasMore: false,
          loading: false
        },
        slots: {
          'no-more-text': 'Custom No More'
        }
      })

      expect(wrapper.find('.grid-no-more').text()).toBe('Custom No More')
    })
  })
})

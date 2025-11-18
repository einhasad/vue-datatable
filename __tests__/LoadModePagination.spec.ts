import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LoadModePagination from '../src/LoadModePagination.vue'
import type { Pagination } from '../src/types'

describe('LoadModePagination', () => {
  const createMockPagination = (hasMore: boolean): Pagination => ({
    getTotalCount: () => null,
    getPageCount: () => null,
    getCurrentPage: () => null,
    getPageSize: () => null,
    getNextToken: () => 'next-token',
    hasMore: () => hasMore
  })

  it('should render load more button when hasMore is true', () => {
    const pagination = createMockPagination(true)
    const wrapper = mount(LoadModePagination, {
      props: {
        pagination,
        loading: false
      }
    })

    const button = wrapper.find('.grid-load-more-button')
    expect(button.exists()).toBe(true)
    expect(button.text()).toBe('Load More')
  })

  it('should show loading text when loading', () => {
    const pagination = createMockPagination(true)
    const wrapper = mount(LoadModePagination, {
      props: {
        pagination,
        loading: true
      }
    })

    const button = wrapper.find('.grid-load-more-button')
    expect(button.text()).toBe('Loading...')
    expect(button.attributes('disabled')).toBeDefined()
  })

  it('should show no more results when hasMore is false', () => {
    const pagination = createMockPagination(false)
    const wrapper = mount(LoadModePagination, {
      props: {
        pagination,
        loading: false
      }
    })

    expect(wrapper.find('.grid-load-more-button').exists()).toBe(false)
    expect(wrapper.find('.grid-no-more').text()).toBe('No more results')
  })

  it('should emit loadMore event when button clicked', async () => {
    const pagination = createMockPagination(true)
    const wrapper = mount(LoadModePagination, {
      props: {
        pagination,
        loading: false
      }
    })

    await wrapper.find('.grid-load-more-button').trigger('click')
    expect(wrapper.emitted('loadMore')).toHaveLength(1)
  })

  it('should render nothing when pagination is null', () => {
    const wrapper = mount(LoadModePagination, {
      props: {
        pagination: null,
        loading: false
      }
    })

    expect(wrapper.find('.grid-load-more-button').exists()).toBe(false)
    expect(wrapper.find('.grid-no-more').exists()).toBe(false)
  })

  it('should use custom slot content for load-more-text', () => {
    const pagination = createMockPagination(true)
    const wrapper = mount(LoadModePagination, {
      props: {
        pagination,
        loading: false
      },
      slots: {
        'load-more-text': 'Custom Load More'
      }
    })

    expect(wrapper.find('.grid-load-more-button').text()).toBe('Custom Load More')
  })

  it('should use custom slot content for no-more-text', () => {
    const pagination = createMockPagination(false)
    const wrapper = mount(LoadModePagination, {
      props: {
        pagination,
        loading: false
      },
      slots: {
        'no-more-text': 'All items loaded'
      }
    })

    expect(wrapper.find('.grid-no-more').text()).toBe('All items loaded')
  })
})

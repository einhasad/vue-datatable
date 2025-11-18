import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ScrollPagination from '../src/ScrollPagination.vue'
import type { Pagination } from '../src/types'

describe('ScrollPagination', () => {
  let intersectionObserverCallback: IntersectionObserverCallback
  let observeMock: ReturnType<typeof vi.fn>
  let unobserveMock: ReturnType<typeof vi.fn>
  let disconnectMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    observeMock = vi.fn()
    unobserveMock = vi.fn()
    disconnectMock = vi.fn()

    // Mock IntersectionObserver
    global.IntersectionObserver = vi.fn().mockImplementation((callback) => {
      intersectionObserverCallback = callback
      return {
        observe: observeMock,
        unobserve: unobserveMock,
        disconnect: disconnectMock,
        root: null,
        rootMargin: '',
        thresholds: []
      }
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const createMockPagination = (hasMore: boolean): Pagination => ({
    getTotalCount: () => null,
    getPageCount: () => null,
    getCurrentPage: () => null,
    getPageSize: () => null,
    getNextToken: () => 'next-token',
    hasMore: () => hasMore
  })

  it('should render loading text when loading', () => {
    const pagination = createMockPagination(true)
    const wrapper = mount(ScrollPagination, {
      props: {
        pagination,
        loading: true
      }
    })

    expect(wrapper.find('.grid-scroll-loading').exists()).toBe(true)
    expect(wrapper.find('.grid-scroll-loading').text()).toContain('Loading')
  })

  it('should show end text when no more items', () => {
    const pagination = createMockPagination(false)
    const wrapper = mount(ScrollPagination, {
      props: {
        pagination,
        loading: false
      }
    })

    expect(wrapper.find('.grid-scroll-end').exists()).toBe(true)
    expect(wrapper.find('.grid-scroll-end').text()).toContain('All items loaded')
  })

  it('should create IntersectionObserver on mount', () => {
    const pagination = createMockPagination(true)
    mount(ScrollPagination, {
      props: { pagination }
    })

    expect(global.IntersectionObserver).toHaveBeenCalled()
    expect(observeMock).toHaveBeenCalled()
  })

  it('should emit loadMore when sentinel intersects and hasMore is true', async () => {
    const pagination = createMockPagination(true)
    const wrapper = mount(ScrollPagination, {
      props: {
        pagination,
        loading: false
      }
    })

    // Simulate intersection
    const entries: IntersectionObserverEntry[] = [{
      isIntersecting: true,
      target: wrapper.element,
      boundingClientRect: {} as DOMRectReadOnly,
      intersectionRatio: 1,
      intersectionRect: {} as DOMRectReadOnly,
      rootBounds: null,
      time: Date.now()
    }]

    intersectionObserverCallback(entries, {} as IntersectionObserver)

    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('loadMore')).toHaveLength(1)
  })

  it('should not emit loadMore when already loading', () => {
    const pagination = createMockPagination(true)
    const wrapper = mount(ScrollPagination, {
      props: {
        pagination,
        loading: true
      }
    })

    const entries: IntersectionObserverEntry[] = [{
      isIntersecting: true,
      target: wrapper.element,
      boundingClientRect: {} as DOMRectReadOnly,
      intersectionRatio: 1,
      intersectionRect: {} as DOMRectReadOnly,
      rootBounds: null,
      time: Date.now()
    }]

    intersectionObserverCallback(entries, {} as IntersectionObserver)

    expect(wrapper.emitted('loadMore')).toBeFalsy()
  })

  it('should not emit loadMore when hasMore is false', () => {
    const pagination = createMockPagination(false)
    const wrapper = mount(ScrollPagination, {
      props: {
        pagination,
        loading: false
      }
    })

    const entries: IntersectionObserverEntry[] = [{
      isIntersecting: true,
      target: wrapper.element,
      boundingClientRect: {} as DOMRectReadOnly,
      intersectionRatio: 1,
      intersectionRect: {} as DOMRectReadOnly,
      rootBounds: null,
      time: Date.now()
    }]

    intersectionObserverCallback(entries, {} as IntersectionObserver)

    expect(wrapper.emitted('loadMore')).toBeFalsy()
  })

  it('should disconnect observer on unmount', () => {
    const pagination = createMockPagination(true)
    const wrapper = mount(ScrollPagination, {
      props: { pagination }
    })

    wrapper.unmount()

    expect(disconnectMock).toHaveBeenCalled()
  })

  it('should use custom threshold', () => {
    const pagination = createMockPagination(true)
    mount(ScrollPagination, {
      props: {
        pagination,
        threshold: 200
      }
    })

    expect(global.IntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        rootMargin: '200px'
      })
    )
  })

  it('should use custom slot for loading text', () => {
    const pagination = createMockPagination(true)
    const wrapper = mount(ScrollPagination, {
      props: {
        pagination,
        loading: true
      },
      slots: {
        'loading-text': 'Please wait...'
      }
    })

    expect(wrapper.find('.grid-scroll-loading').text()).toBe('Please wait...')
  })

  it('should use custom slot for end text', () => {
    const pagination = createMockPagination(false)
    const wrapper = mount(ScrollPagination, {
      props: {
        pagination,
        loading: false
      },
      slots: {
        'end-text': 'No more data'
      }
    })

    expect(wrapper.find('.grid-scroll-end').text()).toBe('No more data')
  })

  it('should not emit when not intersecting', () => {
    const pagination = createMockPagination(true)
    const wrapper = mount(ScrollPagination, {
      props: {
        pagination,
        loading: false
      }
    })

    const entries: IntersectionObserverEntry[] = [{
      isIntersecting: false,
      target: wrapper.element,
      boundingClientRect: {} as DOMRectReadOnly,
      intersectionRatio: 0,
      intersectionRect: {} as DOMRectReadOnly,
      rootBounds: null,
      time: Date.now()
    }]

    intersectionObserverCallback(entries, {} as IntersectionObserver)

    expect(wrapper.emitted('loadMore')).toBeFalsy()
  })
})

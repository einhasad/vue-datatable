import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ScrollPagination from '../src/ScrollPagination.vue'
import type { ScrollPaginationInfo } from '../src/ScrollPagination.vue'

function createPagination(hasMoreValue: boolean): ScrollPaginationInfo {
  return { hasMore: () => hasMoreValue }
}

describe('ScrollPagination', () => {
  it('renders sentinel when hasMore returns true', () => {
    const wrapper = mount(ScrollPagination, {
      props: { pagination: createPagination(true) }
    })

    expect(wrapper.find('.grid-scroll-sentinel').exists()).toBe(true)
    expect(wrapper.find('.grid-scroll-end').exists()).toBe(false)
  })

  it('does not render sentinel when hasMore returns false', () => {
    const wrapper = mount(ScrollPagination, {
      props: { pagination: createPagination(false) }
    })

    expect(wrapper.find('.grid-scroll-sentinel').exists()).toBe(false)
  })

  it('shows loading text when loading prop is true', () => {
    const wrapper = mount(ScrollPagination, {
      props: { pagination: createPagination(true), loading: true }
    })

    expect(wrapper.find('.grid-scroll-loading').exists()).toBe(true)
    expect(wrapper.find('.grid-scroll-loading').text()).toBe('Loading more...')
  })

  it('shows end text when hasMore is false and not loading', () => {
    const wrapper = mount(ScrollPagination, {
      props: { pagination: createPagination(false), loading: false }
    })

    expect(wrapper.find('.grid-scroll-end').exists()).toBe(true)
    expect(wrapper.find('.grid-scroll-end').text()).toBe('No more items')
  })

  it('shows custom loading-text slot content', () => {
    const wrapper = mount(ScrollPagination, {
      props: { pagination: createPagination(true), loading: true },
      slots: { 'loading-text': 'Please wait...' }
    })

    expect(wrapper.find('.grid-scroll-loading').text()).toBe('Please wait...')
  })

  it('shows custom end-text slot content', () => {
    const wrapper = mount(ScrollPagination, {
      props: { pagination: createPagination(false), loading: false },
      slots: { 'end-text': 'All done!' }
    })

    expect(wrapper.find('.grid-scroll-end').text()).toBe('All done!')
  })

  it('shows end text when pagination is null', () => {
    const wrapper = mount(ScrollPagination, {
      props: { pagination: null, loading: false }
    })

    expect(wrapper.find('.grid-scroll-sentinel').exists()).toBe(false)
    expect(wrapper.find('.grid-scroll-end').exists()).toBe(true)
    expect(wrapper.find('.grid-scroll-end').text()).toBe('No more items')
  })

  it('emits loadMore when sentinel intersects', async () => {
    let observerCallback: (entries: IntersectionObserverEntry[]) => void
    const observe = vi.fn()
    const disconnect = vi.fn()

    vi.stubGlobal('IntersectionObserver', vi.fn().mockImplementation((cb) => {
      observerCallback = cb
      return { observe, disconnect }
    }))

    const wrapper = mount(ScrollPagination, {
      props: { pagination: createPagination(true), loading: false }
    })

    observerCallback!([{ isIntersecting: true } as IntersectionObserverEntry])
    await new Promise(r => setTimeout(r, 0))

    expect(wrapper.emitted('loadMore')).toBeTruthy()

    vi.restoreAllMocks()
  })

  it('does not emit loadMore when entry is not intersecting', async () => {
    let observerCallback: (entries: IntersectionObserverEntry[]) => void
    const observe = vi.fn()
    const disconnect = vi.fn()

    vi.stubGlobal('IntersectionObserver', vi.fn().mockImplementation((cb) => {
      observerCallback = cb
      return { observe, disconnect }
    }))

    const wrapper = mount(ScrollPagination, {
      props: { pagination: createPagination(true), loading: false }
    })

    observerCallback!([{ isIntersecting: false } as IntersectionObserverEntry])
    await new Promise(r => setTimeout(r, 0))

    expect(wrapper.emitted('loadMore')).toBeFalsy()

    vi.restoreAllMocks()
  })

  it('disconnects observer on unmount', () => {
    const observe = vi.fn()
    const disconnect = vi.fn()

    vi.stubGlobal('IntersectionObserver', vi.fn().mockImplementation(() => ({
      observe,
      disconnect
    })))

    const wrapper = mount(ScrollPagination, {
      props: { pagination: createPagination(true) }
    })

    wrapper.unmount()
    expect(disconnect).toHaveBeenCalled()

    vi.restoreAllMocks()
  })
})

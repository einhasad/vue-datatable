import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ScrollPagination from '../src/ScrollPagination.vue'
import type { ScrollPaginationInfo } from '../src/ScrollPagination.vue'

function createPagination(hasMoreValue: boolean, hasEarlierValue = false): ScrollPaginationInfo {
  return {
    hasMore: () => hasMoreValue,
    hasEarlier: () => hasEarlierValue
  }
}

describe('ScrollPagination', () => {
  afterEach(() => {
    // vi.restoreAllMocks() does NOT undo vi.stubGlobal — stubs from one test
    // leak into the next and cause flaky failures (e.g. a leftover mock that
    // returns a stale observer object). Force a clean global slate every test.
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

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

  it('renders the loading text inside a polite live region that exists before loading starts', async () => {
    const wrapper = mount(ScrollPagination, {
      props: { pagination: createPagination(true), loading: false }
    })

    const region = wrapper.find('[role="status"]')
    expect(region.exists()).toBe(true)
    expect(region.attributes('aria-live')).toBe('polite')

    await wrapper.setProps({ loading: true })

    expect(wrapper.find('[role="status"] .grid-scroll-loading').text()).toBe('Loading more...')
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

  it('re-checks the sentinel after loading ends so a sentinel that stayed in view loads again', async () => {
    let observerCallback: (entries: IntersectionObserverEntry[]) => void
    const observe = vi.fn((target: Element) => {
      queueMicrotask(() => observerCallback([{ isIntersecting: true, target } as unknown as IntersectionObserverEntry]))
    })
    const unobserve = vi.fn()
    const disconnect = vi.fn()

    vi.stubGlobal('IntersectionObserver', vi.fn().mockImplementation((cb) => {
      observerCallback = cb
      return { observe, unobserve, disconnect }
    }))

    const wrapper = mount(ScrollPagination, {
      props: { pagination: createPagination(true), loading: true }
    })
    await new Promise(r => setTimeout(r, 0))
    expect(wrapper.emitted('loadMore')).toBeFalsy()
    const observeCallsWhileLoading = observe.mock.calls.length

    await wrapper.setProps({ loading: false })
    await new Promise(r => setTimeout(r, 0))

    expect(unobserve).toHaveBeenCalledTimes(1)
    expect(observe).toHaveBeenCalledTimes(observeCallsWhileLoading + 1)
    expect(wrapper.emitted('loadMore')).toHaveLength(1)
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

  describe('position="top"', () => {
    it('does not render sentinel when hasEarlier returns false', () => {
      const wrapper = mount(ScrollPagination, {
        props: { pagination: createPagination(true, false), position: 'top' }
      })

      expect(wrapper.find('.grid-scroll-sentinel').exists()).toBe(false)
    })

    it('renders sentinel when hasEarlier returns true', () => {
      const wrapper = mount(ScrollPagination, {
        props: { pagination: createPagination(true, true), position: 'top' }
      })

      expect(wrapper.find('.grid-scroll-sentinel').exists()).toBe(true)
    })

    it('does not render end-text for top position when no earlier items', () => {
      // The "no more items" affordance only makes sense at the bottom of a list.
      const wrapper = mount(ScrollPagination, {
        props: { pagination: createPagination(true, false), position: 'top', loading: false }
      })

      expect(wrapper.find('.grid-scroll-end').exists()).toBe(false)
    })

    it('emits loadEarlier (not loadMore) when sentinel intersects', async () => {
      let observerCallback: (entries: IntersectionObserverEntry[]) => void
      vi.stubGlobal('IntersectionObserver', vi.fn().mockImplementation((cb) => {
        observerCallback = cb
        return { observe: vi.fn(), disconnect: vi.fn() }
      }))

      const wrapper = mount(ScrollPagination, {
        props: { pagination: createPagination(true, true), position: 'top', loading: false }
      })

      observerCallback!([{ isIntersecting: true } as IntersectionObserverEntry])
      await new Promise(r => setTimeout(r, 0))

      expect(wrapper.emitted('loadEarlier')).toBeTruthy()
      expect(wrapper.emitted('loadMore')).toBeFalsy()

      vi.restoreAllMocks()
    })

    it('does not fire when loading is true (debounce gate)', async () => {
      let observerCallback: (entries: IntersectionObserverEntry[]) => void
      vi.stubGlobal('IntersectionObserver', vi.fn().mockImplementation((cb) => {
        observerCallback = cb
        return { observe: vi.fn(), disconnect: vi.fn() }
      }))

      const wrapper = mount(ScrollPagination, {
        props: { pagination: createPagination(true, true), position: 'top', loading: true }
      })

      observerCallback!([{ isIntersecting: true } as IntersectionObserverEntry])
      await new Promise(r => setTimeout(r, 0))

      expect(wrapper.emitted('loadEarlier')).toBeFalsy()

      vi.restoreAllMocks()
    })
  })

  describe('observer lifecycle when sentinel toggles', () => {
    it('attaches observer when sentinel appears (canLoad flips true)', async () => {
      const observe = vi.fn()
      const disconnect = vi.fn()
      const ctor = vi.fn().mockImplementation(() => ({ observe, disconnect }))
      vi.stubGlobal('IntersectionObserver', ctor)

      // Start with hasEarlier=false → sentinel not rendered → no observer.
      const wrapper = mount(ScrollPagination, {
        props: { pagination: createPagination(true, false), position: 'top' }
      })
      expect(ctor).not.toHaveBeenCalled()

      // Flip to hasEarlier=true → sentinel renders → observer attaches.
      // This was the bug: without the watch, the top sentinel never got
      // observed because canLoad starts false on every fresh mount.
      await wrapper.setProps({
        pagination: createPagination(true, true),
        position: 'top'
      })

      expect(ctor).toHaveBeenCalledTimes(1)
      expect(observe).toHaveBeenCalledTimes(1)

      vi.restoreAllMocks()
    })

    it('detaches observer when sentinel disappears (canLoad flips false)', async () => {
      const observe = vi.fn()
      const disconnect = vi.fn()
      vi.stubGlobal('IntersectionObserver', vi.fn().mockImplementation(() => ({
        observe,
        disconnect
      })))

      const wrapper = mount(ScrollPagination, {
        props: { pagination: createPagination(true, true), position: 'top' }
      })
      expect(observe).toHaveBeenCalledTimes(1)

      // hasEarlier flips to false (window reached the start).
      await wrapper.setProps({
        pagination: createPagination(true, false),
        position: 'top'
      })

      expect(disconnect).toHaveBeenCalled()

      vi.restoreAllMocks()
    })
  })
})

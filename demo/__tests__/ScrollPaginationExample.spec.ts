import { describe, it, expect, afterEach } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import ScrollPaginationExample from '../components/ScrollPaginationExample.vue'
import {
  mountExample,
  installIntersectionObserverMock,
  triggerIntersection,
  resetObserverInstances
} from './helpers'

installIntersectionObserverMock()

describe('ScrollPaginationExample', () => {
  afterEach(() => {
    resetObserverInstances()
  })

  it('shows initial 50 rows and grows the buffer as the sentinel intersects', async () => {
    const { wrapper } = mountExample(ScrollPaginationExample)
    await flushPromises()

    const getRowIds = () =>
      wrapper.findAll('tbody tr.grid-row').map((row) => parseInt(row.find('td').text(), 10))

    const fireSentinel = () => {
      // Scope to the bottom sentinel — there are now two ScrollPagination
      // instances (top + bottom), so the bare `.grid-scroll-sentinel` query
      // would resolve to whichever is in the DOM first (the top one once it
      // appears) and trigger loadEarlier instead of loadMore.
      const sentinel = wrapper.find('.grid-scroll-pagination--bottom .grid-scroll-sentinel')
      if (sentinel.exists()) triggerIntersection(sentinel.element, true)
    }

    let rows = wrapper.findAll('tbody tr.grid-row')
    expect(rows.length).toBe(50)
    let ids = getRowIds()
    expect(ids[0]).toBe(1)
    expect(ids[ids.length - 1]).toBe(50)

    fireSentinel()
    await flushPromises()
    await new Promise((resolve) => setTimeout(resolve, 50))

    rows = wrapper.findAll('tbody tr.grid-row')
    expect(rows.length).toBe(100)
    ids = getRowIds()
    expect(ids[0]).toBe(1)
    expect(ids[ids.length - 1]).toBe(100)

    fireSentinel()
    await flushPromises()
    await new Promise((resolve) => setTimeout(resolve, 50))

    rows = wrapper.findAll('tbody tr.grid-row')
    ids = getRowIds()
    expect(ids).not.toContain(1)
    expect(ids[0]).toBeGreaterThanOrEqual(50)
    expect(ids[ids.length - 1]).toBe(150)
    expect(rows.length).toBeLessThanOrEqual(100)

    fireSentinel()
    await flushPromises()
    await new Promise((resolve) => setTimeout(resolve, 50))

    rows = wrapper.findAll('tbody tr.grid-row')
    ids = getRowIds()
    expect(ids).not.toContain(1)
    expect(ids).not.toContain(50)
    expect(ids[0]).toBeGreaterThanOrEqual(100)
    expect(ids[ids.length - 1]).toBe(200)
    expect(rows.length).toBeLessThanOrEqual(100)
  })

  it('shifts window backward when the top sentinel intersects', async () => {
    const { wrapper } = mountExample(ScrollPaginationExample)
    await flushPromises()

    const getRowIds = () =>
      wrapper.findAll('tbody tr.grid-row').map((row) => parseInt(row.find('td').text(), 10))

    const fireBottomSentinel = () => {
      const sentinel = wrapper.find('.grid-scroll-pagination--bottom .grid-scroll-sentinel')
      if (sentinel.exists()) triggerIntersection(sentinel.element, true)
    }

    const fireTopSentinel = () => {
      const sentinel = wrapper.find('.grid-scroll-pagination--top .grid-scroll-sentinel')
      if (sentinel.exists()) triggerIntersection(sentinel.element, true)
    }

    expect(wrapper.findAll('tbody tr.grid-row').length).toBe(50)

    // Slide forward enough cycles to push windowStart well past 0.
    for (let i = 0; i < 9; i++) {
      fireBottomSentinel()
      await flushPromises()
    }

    const idsBefore = getRowIds()
    expect(idsBefore[0]).toBeGreaterThanOrEqual(390)
    expect(idsBefore[idsBefore.length - 1]).toBeGreaterThanOrEqual(490)

    // Top sentinel only renders once windowStart > 0 (hasEarlier === true).
    expect(wrapper.find('.grid-scroll-pagination--top .grid-scroll-sentinel').exists()).toBe(true)

    // Drive the new sentinel-based load-earlier path. This replaces the old
    // scrollTop heuristic which left users "stuck at the top" — once
    // scrollTop hit 0 the trigger could never re-fire.
    fireTopSentinel()
    await flushPromises()
    await new Promise((resolve) => setTimeout(resolve, 50))

    const idsAfter = getRowIds()
    expect(idsAfter[0]).toBeLessThan(idsBefore[0])
    expect(idsAfter[0]).toBeGreaterThan(1)
    expect(idsAfter).not.toContain(1)
  }, 10000)
})

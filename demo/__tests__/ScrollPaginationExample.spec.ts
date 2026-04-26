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
      const sentinel = wrapper.find('.grid-scroll-sentinel')
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

  it('shifts window backward when scrolling near the top', async () => {
    const { wrapper } = mountExample(ScrollPaginationExample)
    await flushPromises()

    const getRowIds = () =>
      wrapper.findAll('tbody tr.grid-row').map((row) => parseInt(row.find('td').text(), 10))

    const fireSentinel = () => {
      const sentinel = wrapper.find('.grid-scroll-sentinel')
      if (sentinel.exists()) triggerIntersection(sentinel.element, true)
    }

    expect(wrapper.findAll('tbody tr.grid-row').length).toBe(50)

    for (let i = 0; i < 9; i++) {
      fireSentinel()
      await flushPromises()
    }

    let ids = getRowIds()
    expect(ids[0]).toBeGreaterThanOrEqual(390)
    expect(ids[ids.length - 1]).toBeGreaterThanOrEqual(490)

    const scrollContainer = wrapper.find('.scroll-container')
    const scrollEl = scrollContainer.element as HTMLElement

    Object.defineProperty(scrollEl, 'scrollTop', { value: 500, writable: true })
    Object.defineProperty(scrollEl, 'scrollHeight', { value: 3000, writable: true })
    Object.defineProperty(scrollEl, 'clientHeight', { value: 500, writable: true })
    await scrollContainer.trigger('scroll')
    await flushPromises()

    Object.defineProperty(scrollEl, 'scrollTop', { value: 50, writable: true })
    Object.defineProperty(scrollEl, 'scrollHeight', { value: 3000, writable: true })
    Object.defineProperty(scrollEl, 'clientHeight', { value: 500, writable: true })
    await scrollContainer.trigger('scroll')
    await flushPromises()

    ids = getRowIds()
    expect(ids[0]).toBeLessThan(400)
    expect(ids[0]).toBeGreaterThan(1)
    expect(ids).not.toContain(1)
  }, 10000)
})

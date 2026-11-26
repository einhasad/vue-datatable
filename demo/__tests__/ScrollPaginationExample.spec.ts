import { describe, it, expect, afterEach } from 'vitest'
import { flushPromises, type VueWrapper } from '@vue/test-utils'
import ScrollPaginationExample from '../components/ScrollPaginationExample.vue'
import { createProductCatalog } from '../data/products'
import {
  makeRouter,
  mountExample,
  installIntersectionObserverMock,
  triggerIntersection,
  resetObserverInstances
} from './helpers'

installIntersectionObserverMock()

const catalog = createProductCatalog(10_000)
const allProducts = catalog.query({ search: '', sortOrder: null })

function cellTexts(wrapper: VueWrapper, column: number): string[] {
  return wrapper.findAll('tbody tr.grid-row').map((row) => row.findAll('td')[column].text())
}

function prices(wrapper: VueWrapper): number[] {
  return cellTexts(wrapper, 3).map((text) => Number(text.slice(1)))
}

function sortButton(wrapper: VueWrapper, label: string) {
  const button = wrapper.findAll('button.grid-sort-link').find((b) => b.text() === label)
  if (!button) throw new Error(`no sort button ${label}`)
  return button
}

function fireBottomSentinel(wrapper: VueWrapper): void {
  const sentinel = wrapper.find('.grid-scroll-pagination--bottom .grid-scroll-sentinel')
  if (sentinel.exists()) triggerIntersection(sentinel.element, true)
}

function channels(colour: string): number[] {
  const hex = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(colour)
  if (hex) return hex.slice(1).map((pair) => parseInt(pair, 16))
  return (colour.match(/\d+/g) ?? []).map(Number)
}

function relativeLuminance(colour: string): number {
  const [r, g, b] = channels(colour).map((channel) => {
    const value = channel / 255
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(foreground: string, background: string): number {
  const [light, dark] = [relativeLuminance(foreground), relativeLuminance(background)].sort((a, b) => b - a)
  return (light + 0.05) / (dark + 0.05)
}

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

  it('searches name, category and SKU without turning the term into a field filter', async () => {
    const { wrapper, router } = mountExample(ScrollPaginationExample)
    await flushPromises()

    await wrapper.find('#scroll-search-main').setValue('Widget')
    await new Promise((resolve) => setTimeout(resolve, 350))
    await flushPromises()

    const expected = catalog.query({ search: 'Widget', sortOrder: null })
    const names = cellTexts(wrapper, 1)
    expect(names.length).toBe(Math.min(50, expected.length))
    expect(names.every((name) => name.includes('Widget'))).toBe(true)
    expect(wrapper.find('[role="status"]').text()).toBe(`Total: ${expected.length.toLocaleString('en-US')} products`)
    expect(router.currentRoute.value.query['scroll-q']).toBe('Widget')
  })

  it('commits the search immediately on Enter', async () => {
    const { wrapper } = mountExample(ScrollPaginationExample)
    await flushPromises()

    const input = wrapper.find('#scroll-search-main')
    await input.setValue('sku-000123')
    await input.trigger('keydown', { key: 'Enter' })
    await flushPromises()

    expect(cellTexts(wrapper, 0)).toEqual(['123'])
  })

  it('sorts the whole catalog from the Sort by select and marks the header', async () => {
    const { wrapper, router } = mountExample(ScrollPaginationExample)
    await flushPromises()

    await wrapper.find('#scroll-sort-main').setValue('-price')
    await flushPromises()

    const byPriceDesc = [...allProducts].sort((a, b) => b.price - a.price || a.id - b.id)
    expect(prices(wrapper)).toEqual(byPriceDesc.slice(0, 50).map((p) => p.price))
    expect(sortButton(wrapper, 'Price').classes()).toContain('desc')
    expect(router.currentRoute.value.query['scroll-sort']).toBe('-price')

    await wrapper.find('#scroll-sort-main').setValue('name')
    await flushPromises()

    const names = cellTexts(wrapper, 1)
    expect(names).toEqual([...names].sort())
    expect(names[0]).toBe([...allProducts].map((p) => p.name).sort()[0])
    expect(sortButton(wrapper, 'Product Name').classes()).toContain('asc')
    expect(sortButton(wrapper, 'Price').classes()).not.toContain('desc')

    await wrapper.find('#scroll-sort-main').setValue('')
    await flushPromises()
    expect(cellTexts(wrapper, 0)[0]).toBe('1')
    expect(router.currentRoute.value.query['scroll-sort']).toBeUndefined()
  })

  it('updates the Sort by select when a column header is clicked', async () => {
    const { wrapper } = mountExample(ScrollPaginationExample)
    await flushPromises()

    await sortButton(wrapper, 'Rating').trigger('click')
    await flushPromises()

    const select = wrapper.find('#scroll-sort-main').element as HTMLSelectElement
    expect(select.value).toBe('rating')
    const minRating = Math.min(...allProducts.map((p) => p.rating))
    expect(cellTexts(wrapper, 4)[0]).toBe(minRating.toFixed(1))

    await sortButton(wrapper, 'Rating').trigger('click')
    await flushPromises()
    expect(select.value).toBe('-rating')
  })

  it('restarts the scroll window at the top when the sort changes', async () => {
    const { wrapper } = mountExample(ScrollPaginationExample)
    await flushPromises()

    for (let i = 0; i < 3; i++) {
      fireBottomSentinel(wrapper)
      await flushPromises()
    }
    expect(cellTexts(wrapper, 0)[0]).not.toBe('1')

    await wrapper.find('#scroll-sort-main').setValue('-price')
    await flushPromises()

    expect(wrapper.findAll('tbody tr.grid-row')).toHaveLength(50)
    expect(prices(wrapper)[0]).toBe(Math.max(...allProducts.map((p) => p.price)))
    expect(wrapper.find('.grid-scroll-pagination--top .grid-scroll-sentinel').exists()).toBe(false)
  })

  it('restores search and sort from the URL', async () => {
    const router = makeRouter()
    await router.push('/?scroll-q=Gadget&scroll-sort=-price')
    await router.isReady()
    const { wrapper } = mountExample(ScrollPaginationExample, { router })
    await flushPromises()

    expect((wrapper.find('#scroll-search-main').element as HTMLInputElement).value).toBe('Gadget')
    expect((wrapper.find('#scroll-sort-main').element as HTMLSelectElement).value).toBe('-price')
    const expected = catalog.query({ search: 'Gadget', sortField: 'price', sortOrder: 'desc' })
    expect(prices(wrapper)).toEqual(expected.slice(0, 50).map((p) => p.price))
    expect(cellTexts(wrapper, 1).every((name) => name.includes('Gadget'))).toBe(true)
  })

  it('renders rating colours with at least 4.5:1 contrast', async () => {
    const { wrapper } = mountExample(ScrollPaginationExample)
    await flushPromises()

    const colours = new Set(
      wrapper.findAll('tbody tr.grid-row').map((row) => (row.findAll('td')[4].find('span').element as HTMLElement).style.color)
    )
    expect(colours.size).toBeGreaterThan(1)
    for (const colour of colours) {
      expect(contrast(colour, '#FFFFFF')).toBeGreaterThanOrEqual(4.5)
      expect(contrast(colour, '#F3F0E8')).toBeGreaterThanOrEqual(4.5)
    }
  })
})

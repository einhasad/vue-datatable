/**
 * End-to-end perf + memory probes for the scroll-pagination scenario.
 *
 * Mirrors the pattern in examples/src/composables/useScrollPagination.ts:
 *   - one ArrayDataProvider
 *   - "load more" appends to a master array
 *   - a sliding window of size `bufferSize` is pushed to the provider via setAllItems
 *   - Grid re-renders after each window update
 *
 * What this catches that a unit test cannot:
 *   - DOM row count growing unbounded if windowing is wrong
 *   - setAllItems → render time degrading as the master array grows (O(n²) hazard)
 *   - heap retention from old DOM/closures across many cycles
 *
 * Memory tests need: node --expose-gc node_modules/.bin/vitest run \
 *   __tests__/ScrollPagination.scenario.performance.spec.ts
 * Auto-skip when global.gc is unavailable.
 */
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { Grid, ArrayDataProvider } from '../src/index'
import ScrollPagination from '../src/ScrollPagination.vue'
import type { Column } from '../src/types'
import { defineComponent, h, ref } from 'vue'

const HAS_GC = typeof (globalThis as any).gc === 'function'
function forceGc() {
  if (HAS_GC) (globalThis as any).gc()
}
function heapUsed() {
  forceGc()
  return process.memoryUsage().heapUsed
}

interface Product {
  id: number
  name: string
  category: string
  price: number
  rating: number
  stock: number
  sku: string
}

const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Home']

function makeProducts(count: number, offset = 0): Product[] {
  const out: Product[] = new Array(count)
  for (let i = 0; i < count; i++) {
    const id = offset + i + 1
    out[i] = {
      id,
      name: `Product ${id}`,
      category: CATEGORIES[id % CATEGORIES.length],
      price: id * 1.5,
      rating: 3 + (id % 20) / 10,
      stock: id * 7,
      sku: `SKU-${String(id).padStart(6, '0')}`,
    }
  }
  return out
}

const columns: Column<Product>[] = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'category', label: 'Category' },
  { key: 'price', label: 'Price', value: (r: Product) => `$${r.price.toFixed(2)}` },
  { key: 'rating', label: 'Rating' },
  { key: 'stock', label: 'Stock' },
  { key: 'sku', label: 'SKU' },
]

/**
 * Mounts Grid + ScrollPagination wired to one ArrayDataProvider, just like
 * useScrollPagination.ts does. Returns helpers that mimic the consumer code.
 */
function mountScrollScenario(opts: { initial: number; pageSize: number; bufferSize: number }) {
  const { initial, pageSize, bufferSize } = opts

  const master = ref<Product[]>(makeProducts(initial))
  const windowStart = ref(0)
  const windowEnd = ref(initial)
  const hasMore = ref(true)

  const provider = new ArrayDataProvider<Product>({
    items: master.value.slice(0, initial),
    stateProvider: undefined,
  })

  const Wrapper = defineComponent({
    name: 'ScrollScenario',
    setup() {
      const paginationInfo = { hasMore: () => hasMore.value }
      return () =>
        h('div', { class: 'scroll-container' }, [
          h(Grid as any, { dataProvider: provider, columns }),
          h(ScrollPagination as any, { pagination: paginationInfo, loading: false }),
        ])
    },
  })

  const wrapper = mount(Wrapper)

  function syncWindow() {
    provider.setAllItems(master.value.slice(windowStart.value, windowEnd.value))
  }

  async function loadMore() {
    const nextEnd = master.value.length + pageSize
    master.value = master.value.concat(makeProducts(pageSize, master.value.length))
    if (master.value.length > bufferSize) {
      windowStart.value += pageSize
      windowEnd.value = Math.min(windowStart.value + bufferSize, master.value.length)
    } else {
      windowEnd.value = master.value.length
    }
    syncWindow()
    await flushPromises()
    return nextEnd
  }

  function rowCount() {
    return wrapper.findAll('.grid-row').length
  }

  return { wrapper, master, loadMore, rowCount, provider }
}

describe('ScrollPagination scenario — performance', () => {
  beforeEach(() => {
    // setup.ts already stubs IntersectionObserver as a no-op; that's enough here
    // since we drive loadMore() directly rather than via observer callbacks.
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('initial render scales reasonably with row count', async () => {
    const sizes = [50, 200, 1000]
    const timings: Record<number, number> = {}

    for (const size of sizes) {
      const t0 = performance.now()
      const { wrapper, rowCount } = mountScrollScenario({
        initial: size,
        pageSize: 50,
        bufferSize: 100,
      })
      await flushPromises()
      const elapsed = performance.now() - t0
      timings[size] = elapsed
      expect(rowCount()).toBe(size)
      wrapper.unmount()
    }

    // eslint-disable-next-line no-console
    console.log('[initial render]', timings)

    // 20× rows should NOT cost 20× time if rendering is sane (caching, etc).
    // We allow up to 30× as a loose ceiling — anything above suggests trouble.
    const ratio = timings[1000] / timings[50]
    expect(ratio).toBeLessThan(30)
  })

  it('keeps DOM rows bounded by bufferSize across 50 loadMore cycles', async () => {
    const bufferSize = 100
    const pageSize = 50
    const { wrapper, loadMore, rowCount } = mountScrollScenario({
      initial: pageSize,
      pageSize,
      bufferSize,
    })
    await flushPromises()
    expect(rowCount()).toBe(pageSize)

    const observed: number[] = []
    for (let i = 0; i < 50; i++) {
      await loadMore()
      observed.push(rowCount())
    }

    const max = Math.max(...observed)
    const final = observed[observed.length - 1]

    // eslint-disable-next-line no-console
    console.log(
      `[bounded rows] final=${final} max=${max} samples=${observed.slice(0, 5).join(',')}…${observed.slice(-3).join(',')}`,
    )

    // The whole point of windowing: DOM size must NOT grow with cycle count.
    // If this fails, the window isn't being applied to the provider correctly.
    expect(max).toBeLessThanOrEqual(bufferSize)
    expect(final).toBeLessThanOrEqual(bufferSize)

    wrapper.unmount()
  })

  it('per-cycle update time stays roughly constant across 100 cycles', async () => {
    const { wrapper, loadMore } = mountScrollScenario({
      initial: 50,
      pageSize: 50,
      bufferSize: 100,
    })
    await flushPromises()

    // Warmup
    for (let i = 0; i < 5; i++) await loadMore()

    const N = 100
    const samples: number[] = []
    for (let i = 0; i < N; i++) {
      const t0 = performance.now()
      await loadMore()
      samples.push(performance.now() - t0)
    }

    const earlyAvg = samples.slice(0, 10).reduce((a, b) => a + b, 0) / 10
    const lateAvg = samples.slice(-10).reduce((a, b) => a + b, 0) / 10
    const maxSample = Math.max(...samples)

    // eslint-disable-next-line no-console
    console.log(
      `[per-cycle] early-avg=${earlyAvg.toFixed(2)}ms late-avg=${lateAvg.toFixed(2)}ms max=${maxSample.toFixed(2)}ms`,
    )

    // If the master array or provider state causes O(n) per update, late
    // cycles will drag. Allow 3× regression before we call it a smell.
    expect(lateAvg).toBeLessThan(earlyAvg * 3 + 5)

    wrapper.unmount()
  })

  it.skipIf(!HAS_GC)('heap growth bounded across 200 loadMore cycles', async () => {
    const { wrapper, loadMore, master } = mountScrollScenario({
      initial: 50,
      pageSize: 50,
      bufferSize: 100,
    })
    await flushPromises()

    // Warmup so JIT/codegen settles before the measurement window.
    for (let i = 0; i < 20; i++) await loadMore()

    const before = heapUsed()
    for (let i = 0; i < 200; i++) await loadMore()
    const after = heapUsed()

    const masterSize = master.value.length
    const deltaMb = (after - before) / 1024 / 1024

    // eslint-disable-next-line no-console
    console.log(
      `[heap scenario] before=${(before / 1024 / 1024).toFixed(2)}MB after=${(after / 1024 / 1024).toFixed(2)}MB delta=${deltaMb.toFixed(2)}MB master.length=${masterSize}`,
    )

    // Master array WILL grow (200 × 50 = 10k Product objects ≈ ~2-3MB).
    // The expectation is "linear in master, NOT in cycle count squared".
    // If delta blows past 30MB, something is retaining DOM/closures per cycle.
    expect(deltaMb).toBeLessThan(30)

    wrapper.unmount()
  })

  it.skipIf(!HAS_GC)('Grid releases old row DOM after window slides forward', async () => {
    const bufferSize = 100
    const { wrapper, loadMore } = mountScrollScenario({
      initial: 50,
      pageSize: 50,
      bufferSize,
    })
    await flushPromises()

    // Slide the window deep so the head is fully evicted.
    for (let i = 0; i < 30; i++) await loadMore()
    await flushPromises()

    const before = heapUsed()

    // Slide further — DOM nodes for old rows should be replaced, not added.
    for (let i = 0; i < 100; i++) await loadMore()
    await flushPromises()

    const after = heapUsed()
    const deltaMb = (after - before) / 1024 / 1024
    const rows = wrapper.findAll('.grid-row').length

    // eslint-disable-next-line no-console
    console.log(`[heap window slide] delta=${deltaMb.toFixed(2)}MB rows=${rows}`)

    expect(rows).toBeLessThanOrEqual(bufferSize)
    // 100 cycles past warmup should be largely flat — generous 15MB ceiling.
    expect(deltaMb).toBeLessThan(15)

    wrapper.unmount()
  })
})

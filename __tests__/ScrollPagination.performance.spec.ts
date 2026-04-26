/**
 * Performance + memory probes for ScrollPagination.vue (the lib component).
 *
 * These tests are not pass/fail benchmarks — they log measurements and assert
 * only on stability (no observer leaks, no time-per-callback regression).
 *
 * Memory tests require the GC to be exposed:
 *   node --expose-gc node_modules/.bin/vitest run __tests__/ScrollPagination.performance.spec.ts
 * They are auto-skipped when `global.gc` is unavailable.
 */
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ScrollPagination from '../src/ScrollPagination.vue'
import type { ScrollPaginationInfo } from '../src/ScrollPagination.vue'

const HAS_GC = typeof (globalThis as any).gc === 'function'

function forceGc() {
  if (HAS_GC) (globalThis as any).gc()
}

function heapUsed(): number {
  forceGc()
  return process.memoryUsage().heapUsed
}

function pagination(hasMore: boolean): ScrollPaginationInfo {
  return { hasMore: () => hasMore }
}

interface ObserverHandle {
  cb: (entries: IntersectionObserverEntry[]) => void
  observe: ReturnType<typeof vi.fn>
  unobserve: ReturnType<typeof vi.fn>
  disconnect: ReturnType<typeof vi.fn>
}

function stubObserver(): { handles: ObserverHandle[]; restore: () => void } {
  const handles: ObserverHandle[] = []
  const ctor = vi.fn().mockImplementation((cb) => {
    const h: ObserverHandle = {
      cb,
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }
    handles.push(h)
    return { observe: h.observe, unobserve: h.unobserve, disconnect: h.disconnect }
  })
  vi.stubGlobal('IntersectionObserver', ctor)
  return { handles, restore: () => vi.unstubAllGlobals() }
}

describe('ScrollPagination — performance', () => {
  let stub: ReturnType<typeof stubObserver>

  beforeEach(() => {
    stub = stubObserver()
  })

  afterEach(() => {
    stub.restore()
  })

  it('mount/unmount cycle time stays flat across 1000 iterations', () => {
    const N = 1000
    const samples: number[] = []

    // warmup
    for (let i = 0; i < 50; i++) {
      const w = mount(ScrollPagination, { props: { pagination: pagination(true) } })
      w.unmount()
    }

    const batchSize = 100
    for (let batch = 0; batch < N / batchSize; batch++) {
      const t0 = performance.now()
      for (let i = 0; i < batchSize; i++) {
        const w = mount(ScrollPagination, { props: { pagination: pagination(true) } })
        w.unmount()
      }
      samples.push((performance.now() - t0) / batchSize)
    }

    const first = samples[0]
    const last = samples[samples.length - 1]
    const max = Math.max(...samples)
    const avg = samples.reduce((a, b) => a + b, 0) / samples.length

    // eslint-disable-next-line no-console
    console.log(
      `[mount/unmount] avg=${avg.toFixed(3)}ms first=${first.toFixed(3)}ms last=${last.toFixed(3)}ms max=${max.toFixed(3)}ms`,
    )

    // Degradation guard: last batch shouldn't be >5x slower than the first.
    // Catches O(n²) listener leaks or accumulating retained closures.
    expect(last).toBeLessThan(first * 5 + 1)
  })

  it('does not leak IntersectionObserver instances across mount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const w = mount(ScrollPagination, { props: { pagination: pagination(true) } })
      w.unmount()
    }

    // 100 mounts → 100 ctors → each must have been disconnected.
    expect(stub.handles).toHaveLength(100)
    for (const h of stub.handles) {
      expect(h.disconnect).toHaveBeenCalledTimes(1)
    }
  })

  it('intersection callback handler is cheap and stable across 10k calls', () => {
    const onLoadMore = vi.fn()
    mount(ScrollPagination, {
      props: { pagination: pagination(true), loading: false, onLoadMore },
    })

    const handle = stub.handles[0]
    expect(handle).toBeDefined()

    const N = 10_000
    const t0 = performance.now()
    for (let i = 0; i < N; i++) {
      handle.cb([{ isIntersecting: true } as IntersectionObserverEntry])
    }
    const total = performance.now() - t0
    const perCall = total / N

    // eslint-disable-next-line no-console
    console.log(`[intersect cb] total=${total.toFixed(2)}ms per-call=${perCall.toFixed(4)}ms × ${N}`)

    // Each true intersection emits loadMore — verifies no debouncing was added.
    expect(onLoadMore).toHaveBeenCalledTimes(N)
    // Sanity: per-call should be sub-millisecond on any machine.
    expect(perCall).toBeLessThan(1)
  })

  it.skipIf(!HAS_GC)('heap stays bounded across 500 mount/unmount cycles', () => {
    // Warmup — let JIT settle and lazy modules load.
    for (let i = 0; i < 100; i++) {
      const w = mount(ScrollPagination, { props: { pagination: pagination(true) } })
      w.unmount()
    }

    const before = heapUsed()

    for (let i = 0; i < 500; i++) {
      const w = mount(ScrollPagination, { props: { pagination: pagination(true) } })
      w.unmount()
    }

    const after = heapUsed()
    const deltaMb = (after - before) / 1024 / 1024

    // eslint-disable-next-line no-console
    console.log(
      `[heap mount cycle] before=${(before / 1024 / 1024).toFixed(2)}MB after=${(after / 1024 / 1024).toFixed(2)}MB delta=${deltaMb.toFixed(2)}MB`,
    )

    // happy-dom retains a fair amount of DOM bookkeeping per cycle (~100KB),
    // so 500 cycles produce tens of MB even with a clean component. The
    // useful signal is "is growth roughly linear and bounded" — a real
    // exponential leak would blow past 100MB easily. Tighten this if you
    // establish a tighter baseline on your machine.
    expect(deltaMb).toBeLessThan(75)
  })
})

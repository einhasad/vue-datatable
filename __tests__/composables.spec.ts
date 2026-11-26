import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, computed } from 'vue'
import { InMemoryStateProvider } from '../src/state/InMemoryStateProvider'
import { useFilterField } from '../src/composables/useFilterField'
import { useGridState } from '../src/composables/useGridState'
import { CallbackDataProvider, ArrayDataProvider } from '../src/index'
import type { DataProvider, SortState } from '../src/types'

// --- Helper: mount a composable inside a host component ---

function mountComposable<T>(composableFn: () => T) {
  const wrapper = mount(defineComponent({
    setup() { return composableFn() },
    template: '<div/>'
  }))
  return wrapper
}

// ============================================================
// useFilterField
// ============================================================

describe('useFilterField', () => {
  it('initializes currentValue from stateProvider filter', () => {
    const sp = new InMemoryStateProvider()
    sp.setFilter('search', 'hello')

    const wrapper = mountComposable(() =>
      useFilterField({ stateProvider: sp, filterName: 'search' })
    )

    expect(wrapper.vm.currentValue).toBe('hello')
  })

  it('uses defaultValue when stateProvider has no value', () => {
    const sp = new InMemoryStateProvider()

    const wrapper = mountComposable(() =>
      useFilterField({ stateProvider: sp, filterName: 'q', defaultValue: 'fallback' })
    )

    expect(wrapper.vm.currentValue).toBe('fallback')
  })

  it('commits defaultValue to stateProvider on init', () => {
    const sp = new InMemoryStateProvider()

    mountComposable(() =>
      useFilterField({ stateProvider: sp, filterName: 'q', defaultValue: 'fallback' })
    )

    expect(sp.getFilter('q')).toBe('fallback')
  })

  it('setFilter updates currentValue and stateProvider', () => {
    const sp = new InMemoryStateProvider()

    const wrapper = mountComposable(() =>
      useFilterField({ stateProvider: sp, filterName: 'q' })
    )

    wrapper.vm.setFilter('new-value')

    expect(wrapper.vm.currentValue).toBe('new-value')
    expect(sp.getFilter('q')).toBe('new-value')
  })

  it('clearFilter resets currentValue and clears stateProvider', () => {
    const sp = new InMemoryStateProvider()
    sp.setFilter('q', 'exists')

    const wrapper = mountComposable(() =>
      useFilterField({ stateProvider: sp, filterName: 'q' })
    )

    wrapper.vm.clearFilter()

    expect(wrapper.vm.currentValue).toBe('')
    expect(sp.getFilter('q')).toBeNull()
  })

  it('commit syncs currentValue to stateProvider', () => {
    const sp = new InMemoryStateProvider()

    const wrapper = mountComposable(() =>
      useFilterField({ stateProvider: sp, filterName: 'q' })
    )

    // Set localValue which updates currentValue but not stateProvider
    wrapper.vm.localValue = 'committed'
    expect(sp.getFilter('q')).toBeNull()

    wrapper.vm.commit()
    expect(sp.getFilter('q')).toBe('committed')
  })

  it('commit clears filter when value is whitespace-only', () => {
    const sp = new InMemoryStateProvider()
    sp.setFilter('q', 'old')

    const wrapper = mountComposable(() =>
      useFilterField({ stateProvider: sp, filterName: 'q' })
    )

    wrapper.vm.localValue = '   '
    wrapper.vm.commit()

    expect(sp.getFilter('q')).toBeNull()
    expect(wrapper.vm.currentValue).toBe('   ')
  })

  it('localValue get returns currentValue', () => {
    const sp = new InMemoryStateProvider()
    sp.setFilter('q', 'test-val')

    const wrapper = mountComposable(() =>
      useFilterField({ stateProvider: sp, filterName: 'q' })
    )

    expect(wrapper.vm.localValue).toBe('test-val')
  })

  it('localValue set updates currentValue only (not stateProvider)', () => {
    const sp = new InMemoryStateProvider()

    const wrapper = mountComposable(() =>
      useFilterField({ stateProvider: sp, filterName: 'q' })
    )

    wrapper.vm.localValue = 'only-local'

    expect(wrapper.vm.currentValue).toBe('only-local')
    expect(sp.getFilter('q')).toBeNull()
  })

  it('watches stateProvider for external changes', async () => {
    const sp = new InMemoryStateProvider()

    const wrapper = mountComposable(() =>
      useFilterField({ stateProvider: sp, filterName: 'q' })
    )

    expect(wrapper.vm.currentValue).toBe('')

    // Externally update the state provider
    sp.setFilter('q', 'external-change')
    await flushPromises()

    expect(wrapper.vm.currentValue).toBe('external-change')
  })

  it('does NOT re-apply defaultValue when the filter is cleared after initialization', async () => {
    const sp = new InMemoryStateProvider()

    const wrapper = mountComposable(() =>
      useFilterField({ stateProvider: sp, filterName: 'q', defaultValue: 'alice' })
    )

    expect(wrapper.vm.currentValue).toBe('alice')
    expect(sp.getFilter('q')).toBe('alice')

    wrapper.vm.clearFilter()
    await flushPromises()

    expect(wrapper.vm.currentValue).toBe('')
    expect(sp.getFilter('q')).toBeNull()
  })
})

// ============================================================
// useGridState
// ============================================================

describe('useGridState', () => {
  function makeEmit() {
    const loaded = vi.fn()
    const error = vi.fn()
    const emit = ((e: string, _error?: Error) => {
      if (e === 'loaded') loaded()
      if (e === 'error') error(_error!)
    }) as {
      (e: 'loaded'): void
      (e: 'error', error: Error): void
    }
    return { emit, loaded, error }
  }

  it('refreshes when stateProvider filters change', async () => {
    const sp = new InMemoryStateProvider()
    const loadFn = vi.fn(async () => ({ items: [{ id: 1, name: 'Test' }] }))
    const provider = new CallbackDataProvider({
      loadFn,
      offsetPaginationFn: () => {}
    })
    provider.setOffsetPagination({ page: 1, pageSize: 20 })

    const spRef = computed(() => sp)

    const emit = ((e: string, _error?: Error) => {}) as {
      (e: 'loaded'): void
      (e: 'error', error: Error): void
    }

    const wrapper = mount(defineComponent({
      setup() {
        useGridState({
          dataProvider: provider,
          stateProvider: spRef,
          autoLoad: true,
          emit
        })
        return {}
      },
      template: '<div/>'
    }))

    await flushPromises()
    const initialCallCount = loadFn.mock.calls.length

    // Change a filter — this should trigger the watch and cause refresh
    sp.setFilter('name', 'Alice')
    await flushPromises()

    // The watch should have triggered a refresh
    expect(loadFn.mock.calls.length).toBeGreaterThan(initialCallCount)

    wrapper.unmount()
  })

  it('handleSort with valid order calls stateProvider.setSort', async () => {
    const sp = new InMemoryStateProvider()
    const loadFn = vi.fn(async () => ({ items: [] }))
    const provider = new CallbackDataProvider({
      loadFn,
      offsetPaginationFn: () => {}
    })
    provider.setOffsetPagination({ page: 1, pageSize: 20 })

    const spRef = computed(() => sp)
    const { emit } = makeEmit()

    const wrapper = mount(defineComponent({
      setup() {
        return useGridState({
          dataProvider: provider,
          stateProvider: spRef,
          autoLoad: false,
          emit
        })
      },
      template: '<div/>'
    }))

    await flushPromises()

    wrapper.vm.handleSort('name', 'asc')
    await flushPromises()

    expect(sp.getSort()).toEqual({ field: 'name', order: 'asc' })
    wrapper.unmount()
  })

  it('handleSort with falsy order calls stateProvider.clearSort', async () => {
    const sp = new InMemoryStateProvider()
    sp.setSort('name', 'asc')
    const loadFn = vi.fn(async () => ({ items: [] }))
    const provider = new CallbackDataProvider({
      loadFn,
      offsetPaginationFn: () => {}
    })
    provider.setOffsetPagination({ page: 1, pageSize: 20 })

    const spRef = computed(() => sp)
    const { emit } = makeEmit()

    const wrapper = mount(defineComponent({
      setup() {
        return useGridState({
          dataProvider: provider,
          stateProvider: spRef,
          autoLoad: false,
          emit
        })
      },
      template: '<div/>'
    }))

    await flushPromises()

    wrapper.vm.handleSort('name', null as any)
    await flushPromises()

    expect(sp.getSort()).toBeNull()
    wrapper.unmount()
  })

  it('handleSetPage calls stateProvider.setValue with page', async () => {
    const sp = new InMemoryStateProvider()
    const loadFn = vi.fn(async () => ({ items: [] }))
    const provider = new CallbackDataProvider({
      loadFn,
      offsetPaginationFn: () => {}
    })
    provider.setOffsetPagination({ page: 1, pageSize: 20 })

    const spRef = computed(() => sp)
    const { emit } = makeEmit()

    const wrapper = mount(defineComponent({
      setup() {
        return useGridState({
          dataProvider: provider,
          stateProvider: spRef,
          autoLoad: false,
          emit
        })
      },
      template: '<div/>'
    }))

    await flushPromises()

    await wrapper.vm.handleSetPage(3)
    await flushPromises()

    expect(sp.getValue('page')).toBe('3')
    wrapper.unmount()
  })

  it('safeGetOffsetPagination handles throwing provider gracefully', async () => {
    const sp = new InMemoryStateProvider()
    const loadFn = vi.fn(async () => ({ items: [] }))
    // No offsetPaginationFn — getOffsetPagination() will throw
    const provider = new CallbackDataProvider({
      loadFn
    })

    const spRef = computed(() => sp)
    const { emit } = makeEmit()

    const wrapper = mount(defineComponent({
      setup() {
        return useGridState({
          dataProvider: provider,
          stateProvider: spRef,
          autoLoad: false,
          emit
        })
      },
      template: '<div/>'
    }))

    await flushPromises()

    // handleSort triggers refresh -> syncAfterRefresh -> safeGetOffsetPagination catches the throw
    wrapper.vm.handleSort('name', 'asc')
    await flushPromises()

    // paginationState should be null (not thrown)
    expect(wrapper.vm.paginationState).toBeNull()
    wrapper.unmount()
  })

  describe('sort sync with the state provider', () => {
    type Row = { id: number; name: string }
    const rows: Row[] = [{ id: 1, name: 'Bob' }, { id: 2, name: 'Alice' }, { id: 3, name: 'Carol' }]
    const noopEmit = (() => {}) as { (e: 'loaded'): void; (e: 'error', error: Error): void }

    function mountState<T>(dataProvider: DataProvider<T>, sp: InMemoryStateProvider, autoLoad = true) {
      const spRef = computed(() => sp)
      return mount(defineComponent({
        setup() {
          return useGridState<T>({ dataProvider, stateProvider: spRef, autoLoad, emit: noopEmit })
        },
        template: '<div/>'
      }))
    }

    function createManualSortProvider(loadFn: (sort: SortState | null) => void): DataProvider<Row> {
      let sort: SortState | null = null
      const provider = new CallbackDataProvider<Row>({ loadFn: async () => ({ items: rows }) })
      return Object.assign(provider, {
        setSort(s: SortState) { sort = s },
        getSort() { return sort },
        refresh: async () => { loadFn(sort); return { items: rows } },
      })
    }

    it('applies a sort set on the state provider to the data provider and reloads', async () => {
      const sp = new InMemoryStateProvider()
      const provider = new ArrayDataProvider<Row>({ items: rows, stateProvider: sp })
      const wrapper = mountState(provider, sp)
      await flushPromises()
      expect(provider.getCurrentItems().map(r => r.id)).toEqual([1, 2, 3])

      sp.setSort('name', 'asc')
      await flushPromises()

      expect(provider.getSort()).toEqual({ field: 'name', order: 'asc' })
      expect(provider.getCurrentItems().map(r => r.id)).toEqual([2, 1, 3])
      expect(wrapper.vm.sortState).toEqual({ field: 'name', order: 'asc' })

      sp.clearSort()
      await flushPromises()

      expect(provider.getSort()?.order ?? null).toBeNull()
      expect(provider.getCurrentItems().map(r => r.id)).toEqual([1, 2, 3])
      expect(wrapper.vm.sortState?.order ?? null).toBeNull()
      wrapper.unmount()
    })

    it('applies a sort restored in the state provider before the first load', async () => {
      const sp = new InMemoryStateProvider()
      sp.setSort('name', 'desc')
      const loads: Array<SortState | null> = []
      const provider = createManualSortProvider(sort => loads.push(sort))

      const wrapper = mountState(provider, sp)
      await flushPromises()

      expect(provider.getSort()).toEqual({ field: 'name', order: 'desc' })
      expect(loads).toEqual([{ field: 'name', order: 'desc' }])
      expect(wrapper.vm.sortState).toEqual({ field: 'name', order: 'desc' })
      wrapper.unmount()
    })

    it('reloads once when the grid itself sorts', async () => {
      const sp = new InMemoryStateProvider()
      const loads: Array<SortState | null> = []
      const provider = createManualSortProvider(sort => loads.push(sort))
      const wrapper = mountState(provider, sp)
      await flushPromises()
      loads.length = 0

      wrapper.vm.handleSort('name', 'asc')
      await flushPromises()

      expect(loads).toEqual([{ field: 'name', order: 'asc' }])
      wrapper.unmount()
    })

    it('sortState follows a sort set directly on the data provider', async () => {
      const sp = new InMemoryStateProvider()
      const provider = new ArrayDataProvider<Row>({ items: rows, stateProvider: sp })
      const wrapper = mountState(provider, sp)
      await flushPromises()
      expect(wrapper.vm.sortState).toBeNull()

      provider.setSort({ field: 'position', order: 'desc' })
      await flushPromises()

      expect(wrapper.vm.sortState).toEqual({ field: 'position', order: 'desc' })
      wrapper.unmount()
    })
  })
})

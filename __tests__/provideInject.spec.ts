import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { flushPromises } from '@vue/test-utils'
import Grid from '../src/Grid.vue'
import ResetButton from '../src/ResetButton.vue'
import { provideGridDataProvider, useGridDataProvider } from '../src/dataProvider'
import { provideGridState, useGridState } from '../src/gridState'
import { InMemoryStateProvider } from '../src/state/InMemoryStateProvider'
import { ArrayDataProvider } from '../src/providers/ArrayDataProvider'

describe('provide/inject helpers', () => {
  describe('dataProvider provide/inject', () => {
    it('provides and injects DataProvider', () => {
      const provider = new ArrayDataProvider({ items: [{ id: 1 }] })
      let injected: typeof provider | undefined

      const Child = defineComponent({
        setup() {
          injected = useGridDataProvider<typeof provider>()
        },
        template: '<div/>'
      })

      const Parent = defineComponent({
        setup() {
          provideGridDataProvider(provider)
        },
        components: { Child },
        template: '<Child/>'
      })

      mount(Parent)
      expect(injected).toBe(provider)
    })

    it('returns undefined when no provider in ancestors', () => {
      let injected: unknown

      const Child = defineComponent({
        setup() {
          injected = useGridDataProvider()
        },
        template: '<div/>'
      })

      mount(Child)
      expect(injected).toBeUndefined()
    })
  })

  describe('gridState provide/inject', () => {
    it('provides and injects StateProvider', () => {
      const sp = new InMemoryStateProvider()
      let injected: typeof sp | undefined

      const Child = defineComponent({
        setup() {
          injected = useGridState()
        },
        template: '<div/>'
      })

      const Parent = defineComponent({
        setup() {
          provideGridState(sp)
        },
        components: { Child },
        template: '<Child/>'
      })

      mount(Parent)
      expect(injected).toBe(sp)
    })

    it('returns undefined when no provider in ancestors', () => {
      let injected: unknown

      const Child = defineComponent({
        setup() {
          injected = useGridState()
        },
        template: '<div/>'
      })

      mount(Child)
      expect(injected).toBeUndefined()
    })

    it('handles undefined state provider', () => {
      let injected: unknown

      const Child = defineComponent({
        setup() {
          injected = useGridState()
        },
        template: '<div/>'
      })

      const Parent = defineComponent({
        setup() {
          provideGridState(undefined)
        },
        components: { Child },
        template: '<Child/>'
      })

      mount(Parent)
      expect(injected).toBeUndefined()
    })
  })

  describe('Grid provides its providers', () => {
    interface Row { id: number; name: string }
    const rows: Row[] = [{ id: 1, name: 'Bob' }, { id: 2, name: 'Alice' }, { id: 3, name: 'Carol' }]
    const columns = [
      { key: 'id', label: 'ID', sort: 'id' },
      { key: 'name', label: 'Name', sort: 'name', filter: { name: 'name' } },
    ]

    it('exposes its DataProvider and StateProvider to descendants', () => {
      const sp = new InMemoryStateProvider()
      const provider = new ArrayDataProvider<Row>({ items: rows, stateProvider: sp })
      let injectedProvider: unknown
      let injectedState: unknown

      const Probe = defineComponent({
        setup() {
          injectedProvider = useGridDataProvider()
          injectedState = useGridState()
          return () => h('span')
        },
      })

      mount(Grid as any, {
        props: { dataProvider: provider, columns },
        slots: { toolbar: () => h(Probe) },
      })

      expect(injectedProvider).toBe(provider)
      expect(injectedState).toBe(sp)
    })

    it('ResetButton inside Grid clears filters and sort and reloads', async () => {
      const sp = new InMemoryStateProvider()
      sp.setFilter('name', 'o')
      sp.setSort('name', 'desc')
      const provider = new ArrayDataProvider<Row>({ items: rows, stateProvider: sp })

      const wrapper = mount(Grid as any, {
        props: { dataProvider: provider, columns },
        slots: {
          toolbar: () => h(ResetButton, null, {
            default: ({ reset, hasActiveFilters }: { reset: () => void; hasActiveFilters: boolean }) =>
              h('button', { 'data-qa': 'reset', 'data-active': String(hasActiveFilters), onClick: reset }, 'Reset'),
          }),
        },
      })
      await flushPromises()

      expect(provider.getCurrentItems().map(r => r.id)).toEqual([3, 1])
      expect(wrapper.find('[data-qa="reset"]').attributes('data-active')).toBe('true')

      await wrapper.find('[data-qa="reset"]').trigger('click')
      await flushPromises()

      expect(sp.getAllFilters()).toEqual({})
      expect(sp.getSort()).toBeNull()
      expect(provider.getSort()?.order ?? null).toBeNull()
      expect(provider.getCurrentItems().map(r => r.id)).toEqual([1, 2, 3])
      expect(wrapper.find('[data-qa="reset"]').attributes('data-active')).toBe('false')
    })
  })
})

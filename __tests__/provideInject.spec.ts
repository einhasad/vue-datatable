import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
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
})

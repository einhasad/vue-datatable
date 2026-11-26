import { describe, it, expect, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import { InMemoryStateProvider } from '../../src/state/InMemoryStateProvider'
import { useFilterField } from '../../src/composables/useFilterField'

describe('useFilterField', () => {
  let stateProvider: InMemoryStateProvider

  beforeEach(() => {
    stateProvider = new InMemoryStateProvider()
  })

  it('reads the initial value from the state provider', () => {
    stateProvider.setFilter('name', 'alice')
    const field = useFilterField({ stateProvider, filterName: 'name' })
    expect(field.currentValue.value).toBe('alice')
  })

  it('writes the default value to the state provider when it has none', () => {
    const field = useFilterField({ stateProvider, filterName: 'role', defaultValue: 'admin' })
    expect(field.currentValue.value).toBe('admin')
    expect(stateProvider.getFilter('role')).toBe('admin')
  })

  it('follows external state changes', async () => {
    const field = useFilterField({ stateProvider, filterName: 'name' })
    stateProvider.setFilter('name', 'bob')
    await nextTick()
    expect(field.currentValue.value).toBe('bob')
  })

  it('setFilter and clearFilter write through immediately', () => {
    const field = useFilterField({ stateProvider, filterName: 'name' })
    field.setFilter('carol')
    expect(stateProvider.getFilter('name')).toBe('carol')
    field.clearFilter()
    expect(stateProvider.getFilter('name')).toBeNull()
    expect(field.currentValue.value).toBe('')
  })

  describe('lazy (default)', () => {
    it('keeps localValue edits local until commit()', () => {
      const field = useFilterField({ stateProvider, filterName: 'name' })
      field.localValue.value = 'dave'
      expect(stateProvider.getFilter('name')).toBeNull()
      field.commit()
      expect(stateProvider.getFilter('name')).toBe('dave')
    })

    it('behaves the same with lazy: true', () => {
      const field = useFilterField({ stateProvider, filterName: 'name', lazy: true })
      field.localValue.value = 'dave'
      expect(stateProvider.getFilter('name')).toBeNull()
    })

    it('commit() of a blank value clears the filter', () => {
      stateProvider.setFilter('name', 'erin')
      const field = useFilterField({ stateProvider, filterName: 'name' })
      field.localValue.value = '   '
      field.commit()
      expect(stateProvider.getFilter('name')).toBeNull()
    })
  })

  describe('lazy: false', () => {
    it('commits every localValue edit to the state provider', () => {
      const field = useFilterField({ stateProvider, filterName: 'name', lazy: false })
      field.localValue.value = 'frank'
      expect(stateProvider.getFilter('name')).toBe('frank')
      expect(field.currentValue.value).toBe('frank')
    })

    it('clears the filter when localValue is set to a blank value', () => {
      stateProvider.setFilter('name', 'grace')
      const field = useFilterField({ stateProvider, filterName: 'name', lazy: false })
      field.localValue.value = ''
      expect(stateProvider.getFilter('name')).toBeNull()
    })
  })
})

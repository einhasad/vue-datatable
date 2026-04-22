import { reactive } from 'vue'
import type { ReactiveState } from './StateProvider'
import type { SortState } from '../types'

export interface StateCore {
  state: ReactiveState
  getFilter(key: string): string | null
  setFilterValue(key: string, value: string): void
  clearFilterValue(key: string): void
  getAllFilters(): Record<string, string>
  getSort(): SortState | null
  setSortValue(field: string, order: 'asc' | 'desc'): void
  clearSortValue(): void
  clearAllValues(): void
}

export function createStateCore(): StateCore {
  const state: ReactiveState = reactive({
    filters: {} as Record<string, string>,
    sort: null as SortState | null,
  })

  return {
    state,

    getFilter(key: string): string | null {
      return state.filters[key] || null
    },

    setFilterValue(key: string, value: string): void {
      if (!value) {
        delete state.filters[key]
      } else {
        state.filters[key] = value
      }
    },

    clearFilterValue(key: string): void {
      delete state.filters[key]
    },

    getAllFilters(): Record<string, string> {
      return { ...state.filters }
    },

    getSort(): SortState | null {
      return state.sort
    },

    setSortValue(field: string, order: 'asc' | 'desc'): void {
      state.sort = { field, order }
    },

    clearSortValue(): void {
      state.sort = null
    },

    clearAllValues(): void {
      Object.keys(state.filters).forEach(key => delete state.filters[key])
      state.sort = null
    },
  }
}

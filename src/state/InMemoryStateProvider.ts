import type { StateProvider, ReactiveState } from './StateProvider'
import type { SortState } from '../types'
import { createStateCore } from './stateCore'

export class InMemoryStateProvider implements StateProvider {
  private readonly core = createStateCore()
  readonly state: ReactiveState = this.core.state

  getValue(key: string): string | null { return this.core.getFilter(key) }
  setValue(key: string, value: string): void { this.core.setFilterValue(key, value) }
  deleteValue(key: string): void { this.core.clearFilterValue(key) }
  getAllValues(): Record<string, string> { return this.core.getAllFilters() }

  getFilter(key: string): string | null { return this.core.getFilter(key) }
  getAllFilters(): Record<string, string> { return this.core.getAllFilters() }

  setFilter(key: string, value: string): void {
    this.core.setFilterValue(key, value)
  }

  clearFilter(key: string): void {
    this.core.clearFilterValue(key)
  }

  getSort(): SortState | null { return this.core.getSort() }

  setSort(field: string, order: 'asc' | 'desc'): void {
    this.core.setSortValue(field, order)
  }

  clearSort(): void {
    this.core.clearSortValue()
  }

  clear(): void {
    this.core.clearAllValues()
  }
}

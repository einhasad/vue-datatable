import type { StateProvider, ReactiveState } from './StateProvider'
import type { SortState } from '../types'
import { createStateCore } from './stateCore'

export interface LocalStorageStateProviderConfig {
  storageKey?: string
}

interface StoredState {
  filters?: Record<string, string>
  sort?: SortState
}

export class LocalStorageStateProvider implements StateProvider {
  private readonly core = createStateCore()
  private readonly storageKey: string
  readonly state: ReactiveState = this.core.state

  constructor(config: LocalStorageStateProviderConfig = {}) {
    this.storageKey = config.storageKey ?? 'grid-state'
    const stored = this.readStorage()
    Object.assign(this.core.state.filters, stored.filters ?? {})
    this.core.state.sort = stored.sort ?? null
  }

  private readStorage(): StoredState {
    const stored = localStorage.getItem(this.storageKey)
    return stored ? JSON.parse(stored) : {}
  }

  private persist(): void {
    localStorage.setItem(this.storageKey, JSON.stringify({
      filters: { ...this.core.state.filters },
      sort: this.core.state.sort ?? undefined,
    }))
  }

  getValue(key: string): string | null { return this.core.getFilter(key) }
  setValue(key: string, value: string): void { this.core.setFilterValue(key, value); this.persist() }
  deleteValue(key: string): void { this.core.clearFilterValue(key); this.persist() }
  getAllValues(): Record<string, string> { return this.core.getAllFilters() }

  getFilter(key: string): string | null { return this.core.getFilter(key) }
  getAllFilters(): Record<string, string> { return this.core.getAllFilters() }

  setFilter(key: string, value: string): void {
    this.core.setFilterValue(key, value)
    this.persist()
  }

  clearFilter(key: string): void {
    this.core.clearFilterValue(key)
    this.persist()
  }

  getSort(): SortState | null { return this.core.getSort() }

  setSort(field: string, order: 'asc' | 'desc'): void {
    this.core.setSortValue(field, order)
    this.persist()
  }

  clearSort(): void {
    this.core.clearSortValue()
    this.persist()
  }

  clear(): void {
    this.core.clearAllValues()
    localStorage.removeItem(this.storageKey)
  }
}

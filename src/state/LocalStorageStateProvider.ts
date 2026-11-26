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

const SORT_ORDERS: readonly unknown[] = ['asc', 'desc', null]

function withStorage<T>(action: (storage: Storage) => T): T | null {
  try {
    return typeof localStorage === 'undefined' ? null : action(localStorage)
  } catch {
    return null
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function toFilters(value: unknown): Record<string, string> | undefined {
  if (!isPlainObject(value)) return undefined
  const filters: Record<string, string> = {}
  for (const [key, filter] of Object.entries(value)) {
    if (typeof filter === 'string' && filter !== '') filters[key] = filter
  }
  return filters
}

function toSort(value: unknown): SortState | undefined {
  if (!isPlainObject(value) || typeof value.field !== 'string' || !SORT_ORDERS.includes(value.order)) {
    return undefined
  }
  return { field: value.field, order: value.order as SortState['order'] }
}

function toStoredState(value: unknown): StoredState {
  if (!isPlainObject(value)) return {}
  return { filters: toFilters(value.filters), sort: toSort(value.sort) }
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
    const raw = withStorage(storage => storage.getItem(this.storageKey))
    if (!raw) return {}
    try {
      return toStoredState(JSON.parse(raw))
    } catch {
      return {}
    }
  }

  private persist(): void {
    const serialized = JSON.stringify({
      filters: { ...this.core.state.filters },
      sort: this.core.state.sort ?? undefined,
    })
    withStorage(storage => storage.setItem(this.storageKey, serialized))
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
    withStorage(storage => storage.removeItem(this.storageKey))
  }
}

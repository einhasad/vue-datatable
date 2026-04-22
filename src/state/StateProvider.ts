import type { SortState } from '../types'

/**
 * Reactive state object shared by all StateProvider implementations.
 * Vue tracks this automatically — no version counters needed.
 */
export interface ReactiveState {
  filters: Record<string, string>
  sort: SortState | null
}

/**
 * StateProvider interface for managing grid state (filters, sorting)
 * This separates state persistence from data fetching logic
 */
export interface StateProvider {
  getValue(key: string): string | null
  setValue(key: string, value: string): void
  deleteValue(key: string): void
  getAllValues(): Record<string, string>

  /**
   * Filter management
   */
  getFilter(key: string): string | null
  setFilter(key: string, value: string): void
  clearFilter(key: string): void
  getAllFilters(): Record<string, string>

  /**
   * Sort management
   */
  getSort(): SortState | null
  setSort(field: string, order: 'asc' | 'desc'): void
  clearSort(): void

  /**
   * Clear all state
   */
  clear(): void

  /**
   * Reactive state object — Vue tracks mutations automatically.
   * Grid.vue and consumers can watch/computed from this.
   */
  readonly state: ReactiveState
}

import type { SortState } from '../types'

/**
 * StateProvider interface for managing grid state (filters, sorting, pagination)
 * This separates state persistence from data fetching logic
 */
export interface StateProvider {
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
   * Pagination management (for page-based pagination)
   */
  getPage(): number | null
  setPage(page: number): void
  clearPage(): void

  /**
   * Cursor management (for cursor-based pagination)
   */
  getCursor(): string | null
  setCursor(cursor: string): void
  clearCursor(): void

  /**
   * Clear all state
   */
  clear(): void
}

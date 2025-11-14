import type { StateProvider } from './StateProvider'
import type { SortState } from '../types'

/**
 * InMemoryStateProvider - stores state in memory
 * State is lost on page refresh
 * Useful for temporary filtering/sorting or testing
 */
export class InMemoryStateProvider implements StateProvider {
  private filters: Record<string, string> = {}
  private sortState: SortState | null = null
  private page: number | null = null
  private cursor: string | null = null

  /**
   * Filter management
   */
  getFilter(key: string): string | null {
    return this.filters[key] || null
  }

  setFilter(key: string, value: string): void {
    if (value === '' || value === null || value === undefined) {
      delete this.filters[key]
    } else {
      this.filters[key] = value
    }
  }

  clearFilter(key: string): void {
    delete this.filters[key]
  }

  getAllFilters(): Record<string, string> {
    return { ...this.filters }
  }

  /**
   * Sort management
   */
  getSort(): SortState | null {
    return this.sortState
  }

  setSort(field: string, order: 'asc' | 'desc'): void {
    this.sortState = { field, order }
  }

  clearSort(): void {
    this.sortState = null
  }

  /**
   * Pagination management
   */
  getPage(): number | null {
    return this.page
  }

  setPage(page: number): void {
    this.page = page
  }

  clearPage(): void {
    this.page = null
  }

  /**
   * Cursor management
   */
  getCursor(): string | null {
    return this.cursor
  }

  setCursor(cursor: string): void {
    this.cursor = cursor
  }

  clearCursor(): void {
    this.cursor = null
  }

  /**
   * Clear all state
   */
  clear(): void {
    this.filters = {}
    this.sortState = null
    this.page = null
    this.cursor = null
  }
}

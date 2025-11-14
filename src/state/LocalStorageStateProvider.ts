import type { StateProvider } from './StateProvider'
import type { SortState } from '../types'

/**
 * Configuration for LocalStorageStateProvider
 */
export interface LocalStorageStateProviderConfig {
  storageKey?: string
}

/**
 * LocalStorageStateProvider - stores state in browser localStorage
 * State persists across page refreshes and browser sessions
 * Useful for preserving user preferences
 * Default storage key: 'grid-state'
 */
export class LocalStorageStateProvider implements StateProvider {
  private storageKey: string

  constructor(config: LocalStorageStateProviderConfig = {}) {
    this.storageKey = config.storageKey || 'grid-state'
  }

  /**
   * Get state from localStorage
   */
  private getState(): any {
    try {
      const stored = localStorage.getItem(this.storageKey)
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      console.error('Failed to read from localStorage:', error)
      return {}
    }
  }

  /**
   * Save state to localStorage
   */
  private setState(state: any): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(state))
    } catch (error) {
      console.error('Failed to write to localStorage:', error)
    }
  }

  /**
   * Filter management
   */
  getFilter(key: string): string | null {
    const state = this.getState()
    return state.filters?.[key] || null
  }

  setFilter(key: string, value: string): void {
    const state = this.getState()
    if (!state.filters) {
      state.filters = {}
    }

    if (value === '' || value === null || value === undefined) {
      delete state.filters[key]
    } else {
      state.filters[key] = value
    }

    this.setState(state)
  }

  clearFilter(key: string): void {
    const state = this.getState()
    if (state.filters) {
      delete state.filters[key]
      this.setState(state)
    }
  }

  getAllFilters(): Record<string, string> {
    const state = this.getState()
    return state.filters || {}
  }

  /**
   * Sort management
   */
  getSort(): SortState | null {
    const state = this.getState()
    return state.sort || null
  }

  setSort(field: string, order: 'asc' | 'desc'): void {
    const state = this.getState()
    state.sort = { field, order }
    this.setState(state)
  }

  clearSort(): void {
    const state = this.getState()
    delete state.sort
    this.setState(state)
  }

  /**
   * Pagination management
   */
  getPage(): number | null {
    const state = this.getState()
    return state.page || null
  }

  setPage(page: number): void {
    const state = this.getState()
    state.page = page
    this.setState(state)
  }

  clearPage(): void {
    const state = this.getState()
    delete state.page
    this.setState(state)
  }

  /**
   * Cursor management
   */
  getCursor(): string | null {
    const state = this.getState()
    return state.cursor || null
  }

  setCursor(cursor: string): void {
    const state = this.getState()
    state.cursor = cursor
    this.setState(state)
  }

  clearCursor(): void {
    const state = this.getState()
    delete state.cursor
    this.setState(state)
  }

  /**
   * Clear all state
   */
  clear(): void {
    try {
      localStorage.removeItem(this.storageKey)
    } catch (error) {
      console.error('Failed to clear localStorage:', error)
    }
  }
}

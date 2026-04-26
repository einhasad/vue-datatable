import {ref} from 'vue'
import type {
  DataProvider,
  DataProviderConfig,
  LoadOptions,
  LoadResult,
  SortState,
  KeysetPaginationState,
  OffsetPaginationState
} from '../types'
import type { StateProvider } from '../state/StateProvider'

/**
 * Configuration for ArrayDataProvider
 */
interface ArrayDataProviderConfig<T = unknown> extends DataProviderConfig {
  items: T[]
  stateProvider?: StateProvider
}

/**
 * ArrayDataProvider implementation
 * Client-side data provider for working with in-memory arrays.
 * Handles sorting internally, no StateProvider dependency.
 */
export class ArrayDataProvider<T = unknown> implements DataProvider<T> {
  private loading = ref(false)
  private allItems: T[]
  private displayedItems = ref<T[]>([])
  private sortState: SortState | null = null
  private keysetPaginationState: KeysetPaginationState | null = null
  private offsetPaginationState: OffsetPaginationState | null = null
  private readonly stateProvider: StateProvider | null

  constructor(config: ArrayDataProviderConfig<T>) {
    this.allItems = [...config.items]
    this.displayedItems.value = [...this.allItems]
    this.stateProvider = config.stateProvider ?? null
  }

  /**
   * Sort items based on current sort state
   */
  private sortItems(items: T[]): T[] {
    if (!this.sortState?.order) return items

    const { field, order } = this.sortState

    return [...items].sort((a, b) => {
      const aValue = (a as Record<string, unknown>)[field]
      const bValue = (b as Record<string, unknown>)[field]

      if (aValue === bValue) return 0

      let comparison = 0
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue)
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue
      } else {
        comparison = String(aValue).localeCompare(String(bValue))
      }

      return order === 'asc' ? comparison : -comparison
    })
  }

  /**
   * Load data with optional sorting
   */
  private filterItems(items: T[]): T[] {
    if (!this.stateProvider) return items

    const filters = this.stateProvider.getAllFilters()
    const activeFilters = Object.entries(filters).filter(([, v]) => v !== '')
    if (activeFilters.length === 0) return items

    return items.filter(item => {
      return activeFilters.every(([key, value]) => {
        const fieldValue = (item as Record<string, string|null>)[key]
        if (fieldValue == null) return false
        return String(fieldValue).toLowerCase().includes(value.toLowerCase())
      })
    })
  }

  private applyState(): T[] {
    const filtered = this.filterItems([...this.allItems])
    const sorted = this.sortItems(filtered)

    if (this.offsetPaginationState && this.offsetPaginationState.page >= 1 && this.offsetPaginationState.pageSize > 0) {
      const { page, pageSize } = this.offsetPaginationState
      this.displayedItems.value = sorted.slice((page - 1) * pageSize, page * pageSize)
    } else {
      this.displayedItems.value = sorted
    }

    return this.displayedItems.value as T[]
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async load(options: LoadOptions = { sortOrder: null }): Promise<LoadResult<T>> {
    this.loading.value = true

    try {
      if (options.sortField && options.sortOrder) {
        this.sortState = { field: options.sortField, order: options.sortOrder }
      }

      return {
        items: this.applyState()
      }
    } finally {
      this.loading.value = false
    }
  }

  /**
   * Refresh data (re-process from current state)
   */
  async refresh(): Promise<LoadResult<T>> {
    return this.load()
  }

  /**
   * Check if loading
   */
  isLoading(): boolean {
    return this.loading.value
  }

  /**
   * Get current items
   */
  getCurrentItems(): T[] {
    return this.displayedItems.value as T[]
  }

  /**
   * Set sort
   */
  setSort(sort: SortState): void {
    this.sortState = sort
    this.applyState()
  }

  /**
   * Set all items (replace the entire dataset)
   */
  setAllItems(items: T[]): void {
    this.allItems = [...items]
    this.applyState()
  }

  /**
   * Get all items
   */
  getAllItems(): T[] {
    return [...this.allItems]
  }

  /**
   * Get sort state
   */
  getSort(): SortState | null {
    return this.sortState
  }

  /**
   * Get state provider
   */
  getStateProvider(_key: string): StateProvider | null {
    return this.stateProvider
  }

  // --- Keyset pagination (supported by default) ---

  setKeysetPagination(state: KeysetPaginationState): void {
    this.keysetPaginationState = state
  }

  getKeysetPagination(): KeysetPaginationState | null {
    return this.keysetPaginationState
  }

  // --- Offset pagination (supported by default) ---

  setOffsetPagination(state: OffsetPaginationState): void {
    this.offsetPaginationState = state
    this.applyState()
  }

  getOffsetPagination(): OffsetPaginationState | null {
    if (!this.offsetPaginationState) return null
    return {
      ...this.offsetPaginationState,
      totalItems: this.allItems.length,
      totalPages: Math.ceil(this.allItems.length / this.offsetPaginationState.pageSize)
    }
  }
}

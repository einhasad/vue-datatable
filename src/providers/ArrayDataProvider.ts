import { ref, shallowRef, toRaw, type Ref, type ShallowRef } from 'vue'
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
import { InMemoryStateProvider } from '../state/InMemoryStateProvider'

const RESERVED_STATE_KEYS = new Set(['page'])

/**
 * Configuration for ArrayDataProvider
 */
export interface ArrayDataProviderConfig<T = unknown> extends DataProviderConfig {
  items: T[]
  stateProvider?: StateProvider
}

/**
 * ArrayDataProvider implementation
 * Client-side data provider for working with in-memory arrays.
 */
export class ArrayDataProvider<T = unknown> implements DataProvider<T> {
  private loading = ref(false)
  private readonly allItems: ShallowRef<T[]>
  private readonly filteredCount = ref(0)
  private displayedItems = ref<T[]>([])
  private readonly sortState: ShallowRef<SortState | null> = shallowRef(null)
  private keysetPaginationState: KeysetPaginationState | null = null
  // Reactive so consumers (e.g. useGridState) can observe pagination changes.
  private offsetPaginationState: Ref<OffsetPaginationState | null> = ref(null)
  private readonly stateProvider: StateProvider

  constructor(config: ArrayDataProviderConfig<T>) {
    this.allItems = shallowRef([...config.items])
    this.stateProvider = config.stateProvider ?? new InMemoryStateProvider()
    const initialSort = this.stateProvider.getSort()
    this.sortState.value = initialSort ? { ...initialSort } : null
    this.applyState()
  }

  /**
   * Sort items based on current sort state
   */
  private sortItems(items: T[]): T[] {
    const sort = this.sortState.value
    if (!sort?.order) return items

    const { field, order } = sort

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

  private filterItems(items: T[]): T[] {
    const filters = this.stateProvider.getAllFilters()
    const activeFilters = Object.entries(filters).filter(([key, v]) => v !== '' && !RESERVED_STATE_KEYS.has(key))
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
    const filtered = this.filterItems([...this.allItems.value])
    const sorted = this.sortItems(filtered)
    this.filteredCount.value = sorted.length

    const offset = this.offsetPaginationState.value
    if (offset && offset.pageSize > 0) {
      const page = this.clampPage(offset.page, offset.pageSize)
      if (page !== offset.page) {
        this.offsetPaginationState.value = { ...offset, page }
      }
      this.displayedItems.value = sorted.slice((page - 1) * offset.pageSize, page * offset.pageSize)
    } else {
      this.displayedItems.value = sorted
    }

    return this.displayedItems.value as T[]
  }

  private clampPage(page: number, pageSize: number): number {
    const lastPage = Math.max(1, Math.ceil(this.filteredCount.value / pageSize))
    return Math.min(Math.max(1, Math.floor(page) || 1), lastPage)
  }

  private claimIndices(rows: T[]): number[] {
    const all = this.allItems.value
    const claimed = new Set<number>()
    for (const row of rows) {
      const raw = toRaw(row)
      const index = all.findIndex((item, i) => !claimed.has(i) && toRaw(item) === raw)
      if (index !== -1) claimed.add(index)
    }
    return [...claimed].sort((a, b) => a - b)
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async load(options: LoadOptions = { sortOrder: null }): Promise<LoadResult<T>> {
    this.loading.value = true

    try {
      if (options.sortField && options.sortOrder) {
        this.sortState.value = { field: options.sortField, order: options.sortOrder }
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
    this.sortState.value = sort
    this.applyState()
  }

  /**
   * Set all items (replace the entire dataset)
   */
  setAllItems(items: T[]): void {
    this.allItems.value = [...items]
    this.applyState()
  }

  /**
   * Replace the currently displayed rows without going through load().
   * Rows outside the current page stay in the dataset; displayed rows left out
   * of `newRows` are removed from it.
   * Used by consumers to attach children after handling <Grid>'s `expand` event.
   * Does not change sort, pagination, or loading state.
   */
  setRows(newRows: T[]): void {
    const rawRows = newRows.map(row => toRaw(row))
    const replaced = this.claimIndices(this.displayedItems.value as T[])
    const replacedSet = new Set(replaced)
    const kept = this.allItems.value.filter((_, i) => !replacedSet.has(i))
    const insertAt = replaced.length > 0 ? replaced[0] : kept.length
    this.allItems.value = [...kept.slice(0, insertAt), ...rawRows, ...kept.slice(insertAt)]
    this.filteredCount.value += rawRows.length - replaced.length
    this.displayedItems.value = rawRows
  }

  /**
   * Get all items
   */
  getAllItems(): T[] {
    return [...this.allItems.value]
  }

  /**
   * Get sort state
   */
  getSort(): SortState | null {
    return this.sortState.value
  }

  /**
   * Get state provider
   */
  getStateProvider(_key: string): StateProvider {
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
    this.offsetPaginationState.value = state
    this.applyState()
  }

  getOffsetPagination(): OffsetPaginationState | null {
    const offset = this.offsetPaginationState.value
    if (!offset) return null
    const totalItems = this.filteredCount.value
    return {
      ...offset,
      totalItems,
      totalPages: Math.ceil(totalItems / offset.pageSize)
    }
  }
}

import { ref, type Ref } from 'vue'
import type {
  DataProvider,
  DataProviderConfig,
  LoadOptions,
  LoadResult,
  PaginationInfo,
  SortState,
  KeysetPaginationState,
  OffsetPaginationState
} from '../types'
import type { StateProvider } from '../state/StateProvider'
import { InMemoryStateProvider } from '../state/InMemoryStateProvider'

export type CallbackLoadFn<T> = (
  options: LoadOptions,
  keysetPagination: KeysetPaginationState | null,
  offsetPagination: OffsetPaginationState | null
) => Promise<LoadResult<T>>

export type CallbackSortFn = (sort: SortState) => void
export type CallbackKeysetPaginationFn = (state: KeysetPaginationState) => void
export type CallbackOffsetPaginationFn = (state: OffsetPaginationState) => void

const PAGE_STATE_KEY = 'page'

export interface CallbackDataProviderConfig<T = unknown> extends DataProviderConfig {
  /**
   * Required: loads data. Receives the current sort (`sortField`/`sortOrder`), the non-empty
   * filters of the state provider (`searchParams`) and the current pagination states.
   * A returned `pagination` updates the offset pagination state (when enabled).
   */
  loadFn: CallbackLoadFn<T>
  /** Optional: custom sort handler. Sort state is always stored internally as well. */
  sortFn?: CallbackSortFn
  /**
   * Optional: enable keyset pagination.
   * If not provided → setKeysetPagination() / getKeysetPagination() throw.
   */
  keysetPaginationFn?: CallbackKeysetPaginationFn
  /**
   * Optional: enable offset pagination.
   * If not provided → setOffsetPagination() / getOffsetPagination() throw.
   */
  offsetPaginationFn?: CallbackOffsetPaginationFn
  /** Optional: holds filters and sort. Defaults to a new InMemoryStateProvider. */
  stateProvider?: StateProvider
}

/**
 * CallbackDataProvider — fully configurable via callbacks.
 *
 * Pagination is opt-in:
 * - No `keysetPaginationFn` in config → setKeysetPagination() / getKeysetPagination() throw
 * - No `offsetPaginationFn` in config → setOffsetPagination() / getOffsetPagination() throw
 *
 * Only the most recent load() updates items, pagination and the loading flag;
 * responses of superseded requests are returned to their caller but otherwise ignored.
 */
export class CallbackDataProvider<T = unknown> implements DataProvider<T> {
  private readonly config: CallbackDataProviderConfig<T>
  private readonly stateProvider: StateProvider
  private loading = ref(false)
  private items = ref<T[]>([])
  private sortState: SortState | null = null
  private keysetState: KeysetPaginationState | null = null
  private offsetState: Ref<OffsetPaginationState | null> = ref(null)
  private latestRequestId = 0

  constructor(config: CallbackDataProviderConfig<T>) {
    this.config = config
    this.stateProvider = config.stateProvider ?? new InMemoryStateProvider()
  }

  async load(options?: LoadOptions): Promise<LoadResult<T>> {
    const requestId = ++this.latestRequestId
    this.loading.value = true
    try {
      const result = await this.config.loadFn(
        options ?? this.currentLoadOptions(),
        this.keysetState,
        this.offsetState.value
      )
      if (requestId === this.latestRequestId) {
        this.items.value = result.items
        this.applyReturnedPagination(result.pagination, result.items.length)
      }
      return result
    } finally {
      if (requestId === this.latestRequestId) {
        this.loading.value = false
      }
    }
  }

  async refresh(): Promise<LoadResult<T>> {
    return this.load()
  }

  isLoading(): boolean { return this.loading.value }
  getCurrentItems(): T[] { return this.items.value as T[] }

  setSort(sort: SortState): void {
    this.sortState = sort
    if (this.config.sortFn) { this.config.sortFn(sort) }
  }

  getSort(): SortState | null { return this.sortState ?? this.stateProvider.getSort() }
  getStateProvider(_key: string): StateProvider | null { return this.stateProvider }

  // --- Keyset pagination (THROWS if not configured) ---
  setKeysetPagination(state: KeysetPaginationState): void {
    if (!this.config.keysetPaginationFn) {
      throw new Error(
        'CallbackDataProvider: keyset pagination is not configured. ' +
        'Provide `keysetPaginationFn` in config to enable it.'
      )
    }
    this.keysetState = state
    this.config.keysetPaginationFn(state)
  }

  getKeysetPagination(): KeysetPaginationState | null {
    if (!this.config.keysetPaginationFn) {
      throw new Error(
        'CallbackDataProvider: keyset pagination is not configured. ' +
        'Provide `keysetPaginationFn` in config to enable it.'
      )
    }
    return this.keysetState
  }

  // --- Offset pagination (THROWS if not configured) ---
  setOffsetPagination(state: OffsetPaginationState): void {
    if (!this.config.offsetPaginationFn) {
      throw new Error(
        'CallbackDataProvider: offset pagination is not configured. ' +
        'Provide `offsetPaginationFn` in config to enable it.'
      )
    }
    this.offsetState.value = state
    this.config.offsetPaginationFn(state)
  }

  getOffsetPagination(): OffsetPaginationState | null {
    if (!this.config.offsetPaginationFn) {
      throw new Error(
        'CallbackDataProvider: offset pagination is not configured. ' +
        'Provide `offsetPaginationFn` in config to enable it.'
      )
    }
    return this.offsetState.value
  }

  /**
   * Replace current items reactively without invoking the load callback.
   * Does not change sort, pagination, or loading state.
   */
  setRows(newRows: T[]): void {
    this.items.value = newRows
  }

  private currentLoadOptions(): LoadOptions {
    const sort = this.getSort()
    const options: LoadOptions = sort?.order
      ? { sortField: sort.field, sortOrder: sort.order }
      : { sortOrder: null }
    const searchParams = this.activeFilters()
    if (Object.keys(searchParams).length > 0) {
      options.searchParams = searchParams
    }
    return options
  }

  private activeFilters(): Record<string, string> {
    return Object.fromEntries(
      Object.entries(this.stateProvider.getAllFilters())
        .filter(([key, value]) => key !== PAGE_STATE_KEY && value !== '')
    )
  }

  private applyReturnedPagination(pagination: Partial<PaginationInfo> | undefined, itemCount: number): void {
    if (!pagination || !this.config.offsetPaginationFn) return
    const current = this.offsetState.value
    const pageSize = pagination.pageSize ?? current?.pageSize ?? itemCount
    if (pageSize <= 0) return
    const next: OffsetPaginationState = {
      ...current,
      page: pagination.currentPage ?? current?.page ?? 1,
      pageSize,
    }
    if (pagination.totalItems !== undefined) {
      next.totalItems = pagination.totalItems
      delete next.totalPages
    }
    if (pagination.totalPages !== undefined) next.totalPages = pagination.totalPages
    this.offsetState.value = next
  }
}

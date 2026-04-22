import { ref } from 'vue'
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

export type CallbackLoadFn<T> = (
  options: LoadOptions,
  keysetPagination: KeysetPaginationState | null,
  offsetPagination: OffsetPaginationState | null
) => Promise<LoadResult<T>>

export type CallbackSortFn = (sort: SortState) => void
export type CallbackKeysetPaginationFn = (state: KeysetPaginationState) => void
export type CallbackOffsetPaginationFn = (state: OffsetPaginationState) => void

export interface CallbackDataProviderConfig<T = unknown> extends DataProviderConfig {
  /** Required: function that loads data */
  loadFn: CallbackLoadFn<T>
  /** Optional: custom sort handler. If not provided, sort state is stored internally. */
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
}

/**
 * CallbackDataProvider — fully configurable via callbacks.
 *
 * Pagination is opt-in:
 * - No `keysetPaginationFn` in config → setKeysetPagination() / getKeysetPagination() throw
 * - No `offsetPaginationFn` in config → setOffsetPagination() / getOffsetPagination() throw
 * - ElasticsearchDataProvider and ArrayDataProvider support both by default (no config needed)
 */
export class CallbackDataProvider<T = unknown> implements DataProvider<T> {
  private readonly config: CallbackDataProviderConfig<T>
  private loading = ref(false)
  private items = ref<T[]>([])
  private sortState: SortState | null = null
  private keysetState: KeysetPaginationState | null = null
  private offsetState: OffsetPaginationState | null = null

  constructor(config: CallbackDataProviderConfig<T>) {
    this.config = config
  }

  async load(options?: LoadOptions): Promise<LoadResult<T>> {
    this.loading.value = true
    try {
      const result = await this.config.loadFn(
        options ?? { sortOrder: null },
        this.keysetState,
        this.offsetState
      )
      this.items.value = result.items
      return result
    } finally {
      this.loading.value = false
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

  getSort(): SortState | null { return this.sortState }
  getStateProvider(_key: string): StateProvider | null { return null }

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
    this.offsetState = state
    this.config.offsetPaginationFn(state)
  }

  getOffsetPagination(): OffsetPaginationState | null {
    if (!this.config.offsetPaginationFn) {
      throw new Error(
        'CallbackDataProvider: offset pagination is not configured. ' +
        'Provide `offsetPaginationFn` in config to enable it.'
      )
    }
    return this.offsetState
  }
}

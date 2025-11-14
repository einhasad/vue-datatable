import { ref, Ref } from 'vue'
import type {
  DataProvider,
  DataProviderConfig,
  LoadOptions,
  LoadResult,
  PaginationData,
  CursorPaginationData,
  PagePaginationData,
  ResponseAdapter,
  SortState
} from '../types'
import { DefaultResponseAdapter } from '../types'
import type { StateProvider } from '../state/StateProvider'
import { QueryParamsStateProvider } from '../state/QueryParamsStateProvider'
import { InMemoryStateProvider } from '../state/InMemoryStateProvider'

/**
 * HTTP client function type
 */
export type HttpClient = (url: string, options?: RequestInit) => Promise<any>

/**
 * Configuration for HttpDataProvider
 */
export interface HttpDataProviderConfig extends DataProviderConfig {
  url: string
  pageSize?: number
  httpClient?: HttpClient
  responseAdapter?: ResponseAdapter
  headers?: Record<string, string>
  stateProvider?: StateProvider
  router?: any // For backward compatibility - creates QueryParamsStateProvider if provided
}

/**
 * HttpDataProvider implementation supporting both cursor and page-based pagination
 * Framework-agnostic HTTP data provider with configurable HTTP client and response adapter
 * Uses StateProvider for state management (filters, sorting, pagination)
 */
export class HttpDataProvider<T = any> implements DataProvider<T> {
  public config: HttpDataProviderConfig
  private stateProvider: StateProvider
  private loading: Ref<boolean>
  private items: Ref<T[]>
  public paginationData: Ref<PaginationData | null>
  private httpClient: HttpClient
  private responseAdapter: ResponseAdapter<T>
  private currentPage = 1

  constructor(config: HttpDataProviderConfig) {
    this.config = {
      pageSize: 20,
      ...config,
      paginationMode: config.paginationMode || 'cursor'
    }

    // Initialize StateProvider
    if (config.stateProvider) {
      this.stateProvider = config.stateProvider
    } else if (config.router) {
      // Backward compatibility: create QueryParamsStateProvider if router is provided
      this.stateProvider = new QueryParamsStateProvider({
        router: config.router,
        prefix: 'search'
      })
    } else {
      // Default to InMemoryStateProvider for backward compatibility
      this.stateProvider = new InMemoryStateProvider()
    }

    this.loading = ref(false)
    this.items = ref([]) as Ref<T[]>
    this.paginationData = ref<PaginationData | null>(null)

    this.httpClient = config.httpClient || this.defaultHttpClient
    this.responseAdapter = config.responseAdapter || new DefaultResponseAdapter<T>()
  }

  /**
   * Default HTTP client using fetch API
   */
  private async defaultHttpClient(url: string, options?: RequestInit): Promise<any> {
    const headers = {
      'Content-Type': 'application/json',
      ...this.config.headers,
      ...options?.headers
    }

    const response = await fetch(url, {
      ...options,
      headers
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  /**
   * Build URL with query parameters from state
   */
  private buildUrl(options: LoadOptions = {}): string {
    const filters = { ...this.stateProvider.getAllFilters(), ...options.searchParams }
    const params = new URLSearchParams()

    // Add filter parameters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, value)
      }
    })

    // Handle sort
    let sortField = options.sortField
    let sortOrder = options.sortOrder

    if (sortField) {
      this.stateProvider.setSort(sortField, sortOrder!)
    } else {
      const sortState = this.stateProvider.getSort()
      if (sortState) {
        sortField = sortState.field
        sortOrder = sortState.order
      }
    }

    if (sortField) {
      const sortValue = sortOrder === 'desc' ? `-${sortField}` : sortField
      params.append('sort', sortValue)
    }

    // Handle pagination
    if (this.config.pagination) {
      if (this.config.paginationMode === 'cursor') {
        if (options.cursor) {
          params.append('pagination.cursor', options.cursor)
        }
        params.append('pagination.page_size', (options.pageSize || this.config.pageSize || 20).toString())
      } else {
        const page = options.page || this.currentPage
        params.append('page', page.toString())
        params.append('per-page', (options.pageSize || this.config.pageSize || 20).toString())
      }
    }

    const finalUrl = `${this.config.url}?${params.toString()}`
    return finalUrl
  }

  /**
   * Load data from API
   */
  async load(options: LoadOptions = {}): Promise<LoadResult<T>> {
    this.loading.value = true

    try {
      // Update state with search params
      if (options.searchParams) {
        Object.entries(options.searchParams).forEach(([key, value]) => {
          this.stateProvider.setFilter(key, value)
        })
      }

      const url = this.buildUrl(options)
      const response = await this.httpClient(url)

      if (this.responseAdapter.isSuccess && !this.responseAdapter.isSuccess(response)) {
        const errorMessage = this.responseAdapter.getErrorMessage
          ? this.responseAdapter.getErrorMessage(response)
          : 'Request failed'
        throw new Error(errorMessage)
      }

      const items = this.responseAdapter.extractItems(response)
      const pagination = this.responseAdapter.extractPagination(response)

      if (this.config.paginationMode === 'cursor') {
        if (!options.cursor) {
          this.items.value = items
        } else {
          this.items.value.push(...items)
        }
      } else {
        this.items.value = items
        if (options.page) {
          this.currentPage = options.page
          this.stateProvider.setPage(options.page)
        }
      }

      this.paginationData.value = pagination || null
      this.loading.value = false

      return {
        items: this.items.value,
        pagination: pagination || undefined
      }
    } catch (error) {
      this.loading.value = false
      throw error
    }
  }

  /**
   * Load more data (for cursor pagination)
   */
  async loadMore(): Promise<LoadResult<T>> {
    if (!this.hasMore()) {
      return {
        items: this.items.value,
        pagination: this.paginationData.value || undefined
      }
    }

    if (this.config.paginationMode === 'cursor') {
      const cursorData = this.paginationData.value as CursorPaginationData
      return this.load({
        cursor: cursorData.nextCursor
      })
    } else {
      return this.setPage!(this.currentPage + 1)
    }
  }

  /**
   * Refresh data (reload from beginning)
   */
  async refresh(): Promise<LoadResult<T>> {
    this.items.value = []
    this.paginationData.value = null
    this.currentPage = 1
    this.stateProvider.clearPage()
    this.stateProvider.clearCursor()
    return this.load()
  }

  /**
   * Set page (for page-based pagination)
   */
  async setPage(page: number): Promise<LoadResult<T>> {
    if (this.config.paginationMode !== 'page') {
      console.warn('setPage() is only available for page-based pagination')
      return { items: this.items.value }
    }

    this.currentPage = page
    return this.load({ page })
  }

  /**
   * Get current page (for page-based pagination)
   */
  getCurrentPage(): number {
    return this.currentPage
  }

  /**
   * Check if loading
   */
  isLoading(): boolean {
    return this.loading.value
  }

  /**
   * Check if more data available
   */
  hasMore(): boolean {
    if (!this.config.pagination || !this.paginationData.value) {
      return false
    }

    if (this.config.paginationMode === 'cursor') {
      const cursorData = this.paginationData.value as CursorPaginationData
      return cursorData.hasMore === true
    } else {
      const pageData = this.paginationData.value as PagePaginationData
      return this.currentPage < pageData.pageCount
    }
  }

  /**
   * Get current items
   */
  getCurrentItems(): T[] {
    return this.items.value
  }

  /**
   * Get current pagination data
   */
  getCurrentPagination(): PaginationData | null {
    return this.paginationData.value
  }

  /**
   * Set sort (delegates to StateProvider)
   */
  setSort(field: string, order: 'asc' | 'desc'): void {
    this.stateProvider.setSort(field, order)
  }

  /**
   * Get sort (delegates to StateProvider)
   */
  getSort(): SortState | null {
    return this.stateProvider.getSort()
  }
}

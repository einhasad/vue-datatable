import { ref, Ref } from 'vue'
import type {
  DataProvider,
  DataProviderConfig,
  LoadOptions,
  LoadResult,
  PaginationData,
  CursorPaginationData,
  PagePaginationData,
  SortState,
  ResponseAdapter
} from '../types'
import { DefaultResponseAdapter } from '../types'

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
}

/**
 * HttpDataProvider implementation supporting both cursor and page-based pagination
 * Framework-agnostic HTTP data provider with configurable HTTP client and response adapter
 */
export class HttpDataProvider<T = any> implements DataProvider<T> {
  public config: HttpDataProviderConfig
  public router?: any
  private loading: Ref<boolean>
  private items: Ref<T[]>
  public paginationData: Ref<PaginationData | null>
  private sortState: SortState | null = null
  private httpClient: HttpClient
  private responseAdapter: ResponseAdapter<T>
  private currentPage = 1

  constructor(config: HttpDataProviderConfig, router?: any) {
    this.config = {
      pageSize: 20,
      ...config,
      paginationMode: config.paginationMode || 'cursor',
      searchPrefix: config.searchPrefix || 'search'
    }
    this.router = router
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
   * Query parameter management with search prefix isolation
   */
  setQueryParam(key: string, value: string): void {
    if (!this.router) {
      console.warn('Router not provided. Query parameters will not be persisted to URL.')
      return
    }

    const paramName = this.normalizeParamName(key)
    const currentQuery = { ...this.router.currentRoute.value.query }

    if (value === '' || value === null || value === undefined) {
      delete currentQuery[paramName]
    } else {
      currentQuery[paramName] = value
    }

    this.router.replace({
      query: currentQuery,
      hash: this.router.currentRoute.value.hash
    })
  }

  clearQueryParam(key: string): void {
    this.setQueryParam(key, '')
  }

  getRawQueryParam(key: string): string | null {
    if (!this.router) {
      return null
    }

    const paramName = this.normalizeParamName(key)
    const value = this.router.currentRoute.value.query[paramName]
    return Array.isArray(value) ? (value[0] || null) : (value || null)
  }

  /**
   * Sort management
   */
  setSort(field: string, order: 'asc' | 'desc'): void {
    this.sortState = { field, order }
    const sortValue = order === 'desc' ? `-${field}` : field
    this.setQueryParam('sort', sortValue)
  }

  getSort(): SortState | null {
    if (this.router) {
      const urlSort = this.getRawQueryParam('sort')
      if (urlSort) {
        if (urlSort.startsWith('-')) {
          return {
            field: urlSort.substring(1),
            order: 'desc'
          }
        } else {
          return {
            field: urlSort,
            order: 'asc'
          }
        }
      }
    }

    return this.sortState
  }

  /**
   * Normalize parameter name with search prefix
   */
  private normalizeParamName(param: string): string {
    if (this.config.searchPrefix) {
      return `${this.config.searchPrefix}-${param}`
    }
    return param
  }

  /**
   * Get search parameters from router
   */
  private getSearchParams(): Record<string, string> {
    if (!this.router || !this.config.searchPrefix) {
      return {}
    }

    const searchParams: Record<string, string> = {}
    const query = this.router.currentRoute.value.query

    Object.keys(query).forEach(key => {
      if (key.startsWith(`${this.config.searchPrefix!}-`)) {
        const originalKey = key.substring(this.config.searchPrefix!.length + 1)
        const value = query[key]
        searchParams[originalKey] = Array.isArray(value) ? (value[0] || '') : (value || '')
      }
    })

    return searchParams
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(options: LoadOptions = {}): string {
    const searchParams = { ...this.getSearchParams(), ...options.searchParams }
    const params = new URLSearchParams()

    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '' && key !== 'sort') {
        params.append(key, value)
      }
    })

    let sortField = options.sortField
    let sortOrder = options.sortOrder

    if (sortField) {
      const sortValue = sortOrder === 'desc' ? `-${sortField}` : sortField
      this.setQueryParam('sort', sortValue)
    } else if (this.router) {
      const urlSort = this.getRawQueryParam('sort')
      if (urlSort) {
        if (urlSort.startsWith('-')) {
          sortField = urlSort.substring(1)
          sortOrder = 'desc'
        } else {
          sortField = urlSort
          sortOrder = 'asc'
        }
      }
    }

    if (sortField) {
      const sortValue = sortOrder === 'desc' ? `-${sortField}` : sortField
      params.append('sort', sortValue)
    }

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
}

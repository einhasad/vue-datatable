import type { Component } from 'vue'

/**
 * Component rendering options for dynamic components
 */
export interface ComponentOptions {
  is: string | Component
  content?: string
  props?: object
  children?: ComponentOptions[]
}

/**
 * Pagination mode types
 */
export type PaginationMode = 'cursor' | 'page'

/**
 * Cursor-based pagination data (for infinite scroll / load more)
 */
export interface CursorPaginationData {
  nextCursor: string
  hasMore: boolean
}

/**
 * Page-based pagination data (for traditional page navigation)
 */
export interface PagePaginationData {
  currentPage: number
  pageCount: number
  perPage: number
  totalCount: number
}

/**
 * Combined pagination data (supports both modes)
 */
export type PaginationData = CursorPaginationData | PagePaginationData

/**
 * Helper type guards for pagination data
 */
export function isCursorPagination(data: PaginationData): data is CursorPaginationData {
  return 'nextCursor' in data && 'hasMore' in data
}

export function isPagePagination(data: PaginationData): data is PagePaginationData {
  return 'currentPage' in data && 'pageCount' in data
}

/**
 * Data provider configuration
 */
export interface DataProviderConfig {
  pagination: boolean
  paginationMode: PaginationMode
  searchPrefix?: string
  url?: string
}

/**
 * Options for loading data
 */
export interface LoadOptions {
  cursor?: string
  page?: number
  pageSize?: number
  searchParams?: Record<string, string>
  sortField?: string
  sortOrder?: 'asc' | 'desc'
}

/**
 * Result of load operation
 */
export interface LoadResult<T = any> {
  items: T[]
  pagination?: PaginationData
}

/**
 * Sort state
 */
export interface SortState {
  field: string
  order: 'asc' | 'desc'
}

/**
 * Core DataProvider interface
 * Supports both cursor and page-based pagination
 * Designed for extensibility (DSLElasticDataProvider, etc.)
 */
export interface DataProvider<T = any> {
  config: DataProviderConfig
  router?: any

  // Data loading
  load(options?: LoadOptions): Promise<LoadResult<T>>
  loadMore(): Promise<LoadResult<T>>
  refresh(): Promise<LoadResult<T>>

  // Query parameter management
  setQueryParam(key: string, value: string): void
  getRawQueryParam(key: string): string | null
  clearQueryParam(key: string): void

  // Sort management
  setSort(field: string, order: 'asc' | 'desc'): void
  getSort(): SortState | null

  // State management
  isLoading(): boolean
  hasMore(): boolean
  getCurrentItems(): T[]
  getCurrentPagination(): PaginationData | null

  // Page-based pagination methods (for page mode)
  getCurrentPage?(): number
  setPage?(page: number): Promise<LoadResult<T>>
}

/**
 * Column definition for grid
 */
export interface Column {
  key: string
  label?: string | Function
  labelComponent?: ComponentOptions
  value?: (_model: any, _key: number) => string
  show?: (_model: any) => boolean
  showColumn?: boolean | (() => boolean)
  component?: (_model: any, _key: number) => ComponentOptions
  footer?: Function
  footerOptions?: Function
  action?: (_model: any) => void
  sort?: string
  options?: Function
  filter?: Filter
}

/**
 * Filter configuration (project-specific, but kept for type safety)
 * Projects should extend this interface for their own filter types
 */
export interface Filter {
  name: string
  type?: string
  [key: string]: any
}

/**
 * Row options result (classes, styles, attributes)
 */
export interface RowOptions {
  class?: string | string[] | Record<string, boolean>
  style?: string | Record<string, string>
  [key: string]: any
}

/**
 * Response adapter interface for different API formats
 */
export interface ResponseAdapter<T = any> {
  /**
   * Extract items from API response
   */
  extractItems(response: any): T[]

  /**
   * Extract pagination data from API response
   */
  extractPagination(response: any): PaginationData | undefined

  /**
   * Check if response indicates success
   */
  isSuccess?(response: any): boolean

  /**
   * Extract error message from response
   */
  getErrorMessage?(response: any): string | undefined
}

/**
 * Default response adapter (for current AlmaWord API format)
 */
export class DefaultResponseAdapter<T = any> implements ResponseAdapter<T> {
  extractItems(response: any): T[] {
    return response.items || response.data || []
  }

  extractPagination(response: any): PaginationData | undefined {
    if (response.nextCursor !== undefined) {
      return {
        nextCursor: response.nextCursor,
        hasMore: response.hasMore || false
      }
    }

    if (response.pagination) {
      return {
        currentPage: response.pagination.currentPage || 1,
        pageCount: response.pagination.pageCount || 1,
        perPage: response.pagination.perPage || 10,
        totalCount: response.pagination.totalCount || 0
      }
    }

    return undefined
  }

  isSuccess(response: any): boolean {
    return response.code === undefined || response.code === 200
  }

  getErrorMessage(response: any): string | undefined {
    return response.message
  }
}

/**
 * Old-grid response adapter (for legacy API format with _meta)
 */
export class LegacyResponseAdapter<T = any> implements ResponseAdapter<T> {
  extractItems(response: any): T[] {
    return response.result || []
  }

  extractPagination(response: any): PaginationData | undefined {
    if (response._meta?.pagination) {
      const p = response._meta.pagination
      return {
        currentPage: p.currentPage,
        pageCount: p.pageCount,
        perPage: p.perPage,
        totalCount: p.totalCount
      }
    }
    return undefined
  }

  isSuccess(response: any): boolean {
    return response.code === 200
  }

  getErrorMessage(response: any): string | undefined {
    return response.message
  }
}

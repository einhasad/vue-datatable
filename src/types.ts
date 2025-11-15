import type { Component } from 'vue'

/**
 * Minimal router interface for state providers
 * Compatible with Vue Router and similar routing libraries
 */
export interface RouterLike {
  currentRoute: {
    value: {
      query: Record<string, string | string[]>
      hash: string
    }
  }
  replace: (location: { query?: Record<string, string | string[]>; hash?: string }) => void
}

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
export interface LoadResult<T = unknown> {
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
 * State management is delegated to StateProvider
 */
export interface DataProvider<T = unknown> {
  config: DataProviderConfig

  // Data loading
  load(options?: LoadOptions): Promise<LoadResult<T>>
  loadMore(): Promise<LoadResult<T>>
  refresh(): Promise<LoadResult<T>>

  // Sort management (delegates to StateProvider)
  setSort(field: string, order: 'asc' | 'desc'): void
  getSort(): SortState | null

  // State queries
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
export interface Column<T = unknown> {
  key: string
  label?: string | ((models: T[]) => string)
  labelComponent?: ComponentOptions
  value?: (model: T, key: number) => string
  show?: (model: T) => boolean
  showColumn?: boolean | (() => boolean)
  component?: (model: T, key: number) => ComponentOptions
  footer?: (models: T[]) => string
  footerOptions?: (models: T[]) => Record<string, unknown>
  action?: (model: T) => void
  sort?: string
  options?: (model: T) => Record<string, unknown>
  filter?: Filter
}

/**
 * Filter configuration (project-specific, but kept for type safety)
 * Projects should extend this interface for their own filter types
 */
export interface Filter {
  name: string
  type?: string
  [key: string]: unknown
}

/**
 * Row options result (classes, styles, attributes)
 */
export interface RowOptions {
  class?: string | string[] | Record<string, boolean>
  style?: string | Record<string, string>
  [key: string]: unknown
}

/**
 * Response adapter interface for different API formats
 */
export interface ResponseAdapter<T = unknown> {
  /**
   * Extract items from API response
   */
  extractItems(response: unknown): T[]

  /**
   * Extract pagination data from API response
   */
  extractPagination(response: unknown): PaginationData | undefined

  /**
   * Check if response indicates success
   */
  isSuccess?(response: unknown): boolean

  /**
   * Extract error message from response
   */
  getErrorMessage?(response: unknown): string | undefined
}

/**
 * Default response adapter (for current AlmaWord API format)
 */
export class DefaultResponseAdapter<T = unknown> implements ResponseAdapter<T> {
  extractItems(response: unknown): T[] {
    const resp = response as Record<string, unknown>
    return (resp.items || resp.data || []) as T[]
  }

  extractPagination(response: unknown): PaginationData | undefined {
    const resp = response as Record<string, unknown>
    if (resp.nextCursor !== undefined) {
      return {
        nextCursor: resp.nextCursor as string,
        hasMore: (resp.hasMore as boolean) || false
      }
    }

    if (resp.pagination) {
      const p = resp.pagination as Record<string, unknown>
      return {
        currentPage: (p.currentPage as number) || 1,
        pageCount: (p.pageCount as number) || 1,
        perPage: (p.perPage as number) || 10,
        totalCount: (p.totalCount as number) || 0
      }
    }

    return undefined
  }

  isSuccess(response: unknown): boolean {
    const resp = response as Record<string, unknown>
    return resp.code === undefined || resp.code === 200
  }

  getErrorMessage(response: unknown): string | undefined {
    const resp = response as Record<string, unknown>
    return resp.message as string | undefined
  }
}

/**
 * Old-grid response adapter (for legacy API format with _meta)
 */
export class LegacyResponseAdapter<T = unknown> implements ResponseAdapter<T> {
  extractItems(response: unknown): T[] {
    const resp = response as Record<string, unknown>
    return (resp.result || []) as T[]
  }

  extractPagination(response: unknown): PaginationData | undefined {
    const resp = response as Record<string, unknown>
    const meta = resp._meta as Record<string, unknown> | undefined
    if (meta?.pagination) {
      const p = meta.pagination as Record<string, unknown>
      return {
        currentPage: p.currentPage as number,
        pageCount: p.pageCount as number,
        perPage: p.perPage as number,
        totalCount: p.totalCount as number
      }
    }
    return undefined
  }

  isSuccess(response: unknown): boolean {
    const resp = response as Record<string, unknown>
    return resp.code === 200
  }

  getErrorMessage(response: unknown): string | undefined {
    const resp = response as Record<string, unknown>
    return resp.message as string | undefined
  }
}

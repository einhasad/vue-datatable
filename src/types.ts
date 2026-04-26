import type { Component } from 'vue'
import type { StateProvider } from './state/StateProvider'

/**
 * Extract props type from a Vue component.
 * Works with DefineComponent (class-style) and functional components.
 */
type ExtractComponentProps<C extends Component> =
  C extends new (...args: never[]) => { $props: infer P }
    ? P
    : C extends (props: infer P, ...args: never[]) => never
      ? P
      : Record<string, unknown>

/**
 * Route location for router navigation
 */
export interface RouteLocation {
  path: string
  query: Record<string, string | string[] | undefined>
  hash?: string
}

/**
 * Minimal router interface for state providers
 * Compatible with Vue Router and similar routing libraries
 */
export interface RouterLike {
  currentRoute: {
    value: {
      path: string
      query: Record<string, string | string[]>
      hash: string
    }
  }
  replace: (location: RouteLocation) => void
}

/**
 * Component rendering options for dynamic components.
 * Generic parameter drives prop type inference from the `is` field.
 */
export interface ComponentOptions<T extends string | Component = string | Component> {
  is: T
  content?: string
  props?: T extends Component
    ? Partial<ExtractComponentProps<T>> & { key?: string | number }
    : Record<string, unknown> & { key?: string | number }
  events?: Record<string, (...args: any[]) => void> // eslint-disable-line @typescript-eslint/no-explicit-any
  children?: ComponentOptions[]
}

/**
 * Data provider configuration
 */
export interface DataProviderConfig {
  url?: string
}

/**
 * Options for loading data
 */

export type SortOrder =  'asc' | 'desc' | null;

export interface LoadOptions {
  searchParams?: Record<string, string>
  sortField?: string
  sortOrder: SortOrder
}

/**
 * Result of load operation
 */
export interface LoadResult<T = unknown> {
  items: T[]
  pagination?: Partial<PaginationInfo>
}

/**
 * Sort state
 */
export interface SortState {
  field: string
  order: SortOrder
}


/**
 * Keyset (cursor-based) pagination state.
 * Uses values from the last item as a cursor to fetch next page.
 */
export interface KeysetPaginationState {
  /** Cursor values from the last item of previous page (e.g. ["value1", 123]) */
  cursor: unknown[] | null
  /** Number of items per page */
  pageSize: number
  /** Whether there are more items after current page */
  hasNextPage: boolean
}

/**
 * Offset (page-based) pagination state.
 * Uses page number + page size.
 */
export interface OffsetPaginationState {
  /** Current page number (1-based) */
  page: number
  /** Number of items per page */
  pageSize: number
  /** Total number of items (if known) */
  totalItems?: number
  /** Total number of pages (if known) */
  totalPages?: number
}

export interface DataProvider<T = unknown> {
  load(options?: LoadOptions): Promise<LoadResult<T>>
  refresh(): Promise<LoadResult<T>>
  isLoading(): boolean
  getCurrentItems(): T[]
  setSort(sort: SortState): void
  getSort(): SortState|null
  getStateProvider(key: string): StateProvider|null

  // --- Keyset (cursor) pagination ---
  /** Set keyset pagination cursor + pageSize. Throws if provider doesn't support it. */
  setKeysetPagination(state: KeysetPaginationState): void
  /** Get current keyset pagination state. Returns null if not active. */
  getKeysetPagination(): KeysetPaginationState | null

  // --- Offset (page) pagination ---
  /** Set offset pagination page + pageSize. Throws if provider doesn't support it. */
  setOffsetPagination(state: OffsetPaginationState): void
  /** Get current offset pagination state. Returns null if not active. */
  getOffsetPagination(): OffsetPaginationState | null
}

/**
 * Column definition for grid
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Column<T = any> {
  key?: string
  label?: string | ((models: T[]) => string)
  labelComponent?: ComponentOptions
  value?: (model: T, key: number) => string | number | boolean | null | undefined
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
 * Pagination info for grid
 */
export interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
}

/**
 * Stable identifier for a row. Used by RowStateProvider to key per-row flags
 * (expansion, selection, etc.) so they survive pagination, sort, and filter changes.
 */
export type RowKey = string | number

/**
 * RowStateProvider — generic per-row reactive flag store.
 * Flag-agnostic: the provider does not know about 'expanded' or 'selected';
 * those are string keys agreed on between the library and consumers.
 */
export interface RowStateProvider {
  get(rowKey: RowKey, flag: string): unknown
  set(rowKey: RowKey, flag: string, value: unknown): void
  toggle(rowKey: RowKey, flag: string): void
  delete(rowKey: RowKey, flag: string): void
  entries(flag: string): RowKey[]
  clear(flag: string): void
  readonly state: Readonly<Record<RowKey, Record<string, unknown>>>
}

/**
 * Item-bound subset of RowStateProvider. Passed via RowContext so custom
 * column.component implementations can drive any flag without re-resolving rowKey.
 */
export interface RowStateScoped {
  get(flag: string): unknown
  set(flag: string, value: unknown): void
  toggle(flag: string): void
  delete(flag: string): void
}

/**
 * Per-row context exposed to column.component(model, index, rowContext).
 * Backward-compatible: existing two-arg components ignore the third parameter.
 */
export interface RowContext {
  depth: number
  rowKey: RowKey
  isExpanded: boolean
  isExpandable: boolean
  toggle: () => void
  rowState: RowStateScoped
}

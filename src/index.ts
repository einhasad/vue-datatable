/**
 * Grid - Framework-agnostic Vue 3 Grid Library
 *
 * A flexible, configurable grid component library for Vue 3 applications
 * Supports both cursor and page-based pagination, custom data providers, and extensive customization
 *
 * @example
 * ```ts
 * import { Grid, HttpDataProvider } from './lib'
 * import './lib/styles.css'
 *
 * const provider = new HttpDataProvider({
 *   url: '/api/users',
 *   pagination: true,
 *   paginationMode: 'page'
 * }, router)
 * ```
 */

// Components
export { default as Grid } from './Grid.vue'
export { default as GridTable } from './GridTable.vue'
export { default as DynamicComponent } from './DynamicComponent.vue'

// Pagination Components
export { default as LoadModePagination } from './LoadModePagination.vue'
export { default as PagePagination } from './PagePagination.vue'
export { default as ScrollPagination } from './ScrollPagination.vue'

/**
 * @deprecated GridPagination is deprecated - use LoadModePagination, PagePagination, or ScrollPagination instead
 */
export { default as GridPagination } from './GridPagination.vue'

// Data Providers
export { HttpDataProvider } from './providers/HttpDataProvider'
export { ArrayDataProvider } from './providers/ArrayDataProvider'
// Note: DSTElasticDataProvider is not exported because it has project-specific dependencies
// See /doc/DSTElasticDataProvider.md for reference implementation

// State Providers
export type { StateProvider } from './state'
export {
  InMemoryStateProvider,
  QueryParamsStateProvider,
  LocalStorageStateProvider,
  HashStateProvider
} from './state'
export type {
  QueryParamsStateProviderConfig,
  LocalStorageStateProviderConfig,
  HashStateProviderConfig
} from './state'

// Types and Interfaces
export type {
  DataProvider,
  DataProviderConfig,
  LoadOptions,
  LoadResult,
  SortState,
  Column,
  ComponentOptions,
  Filter,
  RowOptions,
  ResponseAdapter,
  // New pagination interface
  Pagination
} from './types'

export {
  DefaultResponseAdapter,
  LegacyResponseAdapter,
  PaginationRequest
} from './types'

// Pagination implementations
export { CursorPagination, PageBasedPagination } from './pagination-impl'

/**
 * @deprecated Legacy pagination types - use Pagination interface instead
 */
export type {
  PaginationData,
  CursorPaginationData,
  PagePaginationData,
  PaginationMode
} from './types'

/**
 * @deprecated Legacy type guards - use Pagination interface instead
 */
export {
  isCursorPagination,
  isPagePagination
} from './types'

// Utilities
export {
  getCellValue,
  getColumnLabel,
  shouldShowColumn,
  shouldShowCell,
  getCellComponent,
  getCellOptions,
  getRowOptions,
  getFooterContent,
  getFooterOptions,
  buildAttributes,
  mergeClasses,
  normalizeStyle,
  getPageRange,
  getPaginationSummary
} from './utils'

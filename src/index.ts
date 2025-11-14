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
export { default as GridPagination } from './GridPagination.vue'
export { default as DynamicComponent } from './DynamicComponent.vue'

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
  PaginationData,
  CursorPaginationData,
  PagePaginationData,
  SortState,
  PaginationMode,
  Column,
  ComponentOptions,
  Filter,
  RowOptions,
  ResponseAdapter
} from './types'

export {
  DefaultResponseAdapter,
  LegacyResponseAdapter,
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

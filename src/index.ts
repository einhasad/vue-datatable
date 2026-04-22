/**
 * Grid - Framework-agnostic Vue 3 Grid Library
 *
 * A flexible, configurable grid component library for Vue 3 applications
 * with custom data providers and extensive customization
 */

// Components
export { default as Grid } from './Grid.vue'
export { default as ResetButton } from './ResetButton.vue'
export { default as GridTable } from './GridTable.vue'
export { default as DynamicComponent } from './DynamicComponent.vue'
export { default as GridColumnHeader } from './GridColumnHeader.vue'
export { default as GridSearch } from './GridSearch.vue'
export { default as PagePagination } from './PagePagination.vue'
export { default as ScrollPagination } from './ScrollPagination.vue'
export type { ScrollPaginationInfo } from './ScrollPagination.vue'

// Data Providers
export { CallbackDataProvider } from './providers/CallbackDataProvider'
export type { CallbackDataProviderConfig, CallbackLoadFn, CallbackSortFn, CallbackKeysetPaginationFn, CallbackOffsetPaginationFn } from './providers/CallbackDataProvider'
export { ArrayDataProvider } from './providers/ArrayDataProvider'
export { ElasticSearchDataProvider } from './providers/ElasticSearchDataProvider.ts'
export type {
  ElasticsearchDataProviderConfig,
  ElasticResponseAdapter,
  ElasticQuery,
  ElasticResponse,
  ElasticHttpClient,
  DefaultElasticResponseAdapter
} from './providers/ElasticSearchDataProvider.ts'

// State Providers
export type { StateProvider, ReactiveState } from './state'
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

// Composables
export { useFilterField } from './composables/useFilterField'
export type { UseFilterFieldOptions } from './composables/useFilterField'

// Dependency Injection
export { provideGridState, useGridState } from './gridState'
export { provideGridDataProvider, useGridDataProvider } from './dataProvider'

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
  PaginationInfo,
  KeysetPaginationState,
  OffsetPaginationState
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
  normalizeStyle
} from './utils'

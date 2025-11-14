/**
 * Re-export DataProvider interface and related types from lib/types
 * This file exists for better organization and import paths
 */
export type {
  DataProvider,
  DataProviderConfig,
  LoadOptions,
  LoadResult,
  PaginationData,
  CursorPaginationData,
  PagePaginationData,
  SortState,
  PaginationMode
} from '../types'

export {
  isCursorPagination,
  isPagePagination
} from '../types'

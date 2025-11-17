import type {
  DataProvider,
  DataProviderConfig,
  LoadOptions,
  LoadResult,
  PaginationData,
  CursorPaginationData,
  PagePaginationData,
  SortState,
  Pagination
} from '../types'
import type { StateProvider } from '../state/StateProvider'
import { InMemoryStateProvider } from '../state/InMemoryStateProvider'
import { ArrayPagination } from './ArrayPagination'

/**
 * Configuration for ArrayDataProvider
 */
export interface ArrayDataProviderConfig<T = unknown> extends DataProviderConfig {
  items: T[]
  pageSize?: number
  stateProvider?: StateProvider
}

/**
 * ArrayDataProvider implementation supporting both cursor and page-based pagination
 * Client-side data provider for working with in-memory arrays
 * Uses StateProvider for state management (filters, sorting, pagination)
 */
export class ArrayDataProvider<T = unknown> implements DataProvider<T> {
  public config: ArrayDataProviderConfig<T>
  private stateProvider: StateProvider
  private loading = false
  private allItems: T[]
  private displayedItems: T[] = []
  private currentPage = 1
  private pagination: ArrayPagination

  constructor(config: ArrayDataProviderConfig<T>) {
    this.config = {
      pageSize: 20,
      ...config
    }
    this.allItems = [...config.items]

    // Initialize StateProvider (default to InMemoryStateProvider)
    this.stateProvider = config.stateProvider || new InMemoryStateProvider()

    // Initialize pagination
    this.pagination = new ArrayPagination()
  }

  /**
   * Filter items based on state
   */
  private filterItems(): T[] {
    let filtered = [...this.allItems]
    const filters = this.stateProvider.getAllFilters()

    Object.entries(filters).forEach(([key, value]) => {
      if (value && value.trim()) {
        filtered = filtered.filter(item => {
          const itemValue = (item as Record<string, unknown>)[key]
          if (typeof itemValue === 'string') {
            return itemValue.toLowerCase().includes(value.toLowerCase())
          } else if (typeof itemValue === 'number') {
            return itemValue.toString().includes(value)
          }
          return false
        })
      }
    })

    return filtered
  }

  /**
   * Sort items based on state
   */
  private sortItems(items: T[]): T[] {
    const sortState = this.stateProvider.getSort()
    if (!sortState) return items

    const { field, order } = sortState

    return [...items].sort((a, b) => {
      const aValue = (a as Record<string, unknown>)[field]
      const bValue = (b as Record<string, unknown>)[field]

      if (aValue === bValue) return 0

      let comparison = 0
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue)
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue
      } else {
        comparison = String(aValue).localeCompare(String(bValue))
      }

      return order === 'asc' ? comparison : -comparison
    })
  }

  /**
   * Get cursor index for cursor-based pagination
   */
  private getCursorIndex(cursor: string): number {
    if (!cursor) return 0

    const index = parseInt(cursor, 10)
    return isNaN(index) ? 0 : index
  }

  /**
   * Load data with filtering, sorting, and pagination
   */
  async load(options: LoadOptions = {}): Promise<LoadResult<T>> {
    this.loading = true

    await new Promise(resolve => setTimeout(resolve, 10))

    try {
      // Update state with search params
      if (options.searchParams) {
        Object.entries(options.searchParams).forEach(([key, value]) => {
          this.stateProvider.setFilter(key, value)
        })
      }

      // Update sort state
      if (options.sortField && options.sortOrder) {
        this.stateProvider.setSort(options.sortField, options.sortOrder)
      }

      let processedItems = this.filterItems()
      processedItems = this.sortItems(processedItems)

      const pageSize = options.pageSize || this.config.pageSize || 20

      if (this.config.pagination) {
        // Check if cursor is provided (cursor-based loading)
        if (options.cursor) {
          const startIndex = this.getCursorIndex(options.cursor || '')
          const endIndex = startIndex + pageSize
          const pageItems = processedItems.slice(startIndex, endIndex)

          const hasMore = endIndex < processedItems.length
          const nextCursor = hasMore ? endIndex.toString() : ''

          if (options.cursor && this.displayedItems.length > 0) {
            this.displayedItems.push(...pageItems)
          } else {
            this.displayedItems = [...pageItems]
          }

          const pagination: CursorPaginationData = {
            nextCursor,
            hasMore
          }

          // Update ArrayPagination with cursor-style data
          // For cursor mode, we track current position
          const currentPosition = this.displayedItems.length
          this.pagination.update({
            totalCount: processedItems.length,
            currentPage: Math.ceil(currentPosition / pageSize),
            pageSize
          })

          return {
            items: this.displayedItems,
            pagination
          }
        } else {
          // Page-based loading
          const page = options.page || this.stateProvider.getPage() || 1
          this.currentPage = page
          this.stateProvider.setPage(page)

          const startIndex = (page - 1) * pageSize
          const endIndex = startIndex + pageSize
          const pageItems = processedItems.slice(startIndex, endIndex)

          this.displayedItems = pageItems

          const pagination: PagePaginationData = {
            currentPage: page,
            pageCount: Math.ceil(processedItems.length / pageSize),
            perPage: pageSize,
            totalCount: processedItems.length
          }

          // Update ArrayPagination
          this.pagination.update({
            totalCount: processedItems.length,
            currentPage: page,
            pageSize
          })

          return {
            items: this.displayedItems,
            pagination
          }
        }
      } else {
        this.displayedItems = processedItems

        // Update pagination even when disabled (totalCount is still useful)
        this.pagination.update({
          totalCount: processedItems.length,
          currentPage: 1,
          pageSize: processedItems.length
        })

        return {
          items: this.displayedItems
        }
      }
    } finally {
      this.loading = false
    }
  }

  /**
   * Load more data (for cursor pagination)
   */
  async loadMore(): Promise<LoadResult<T>> {
    if (!this.hasMore()) {
      return {
        items: this.displayedItems,
        pagination: this.getCurrentPagination() || undefined
      }
    }

    if (this.config.paginationMode === 'cursor') {
      let processedItems = this.filterItems()
      processedItems = this.sortItems(processedItems)

      const currentIndex = this.displayedItems.length
      const pageSize = this.config.pageSize || 20
      const endIndex = currentIndex + pageSize
      const moreItems = processedItems.slice(currentIndex, endIndex)

      this.displayedItems.push(...moreItems)

      const hasMore = endIndex < processedItems.length
      const pagination: CursorPaginationData = {
        nextCursor: hasMore ? endIndex.toString() : '',
        hasMore
      }

      return {
        items: this.displayedItems,
        pagination
      }
    } else {
      return this.setPage(this.currentPage + 1)
    }
  }

  /**
   * Refresh data (reload from beginning)
   */
  async refresh(): Promise<LoadResult<T>> {
    this.displayedItems = []
    this.currentPage = 1
    this.pagination.reset()
    this.stateProvider.clearPage()
    this.stateProvider.clearCursor()
    return this.load()
  }

  /**
   * Set page (for page-based pagination)
   */
  async setPage(page: number): Promise<LoadResult<T>> {
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
    return this.loading
  }

  /**
   * Check if more data available
   */
  hasMore(): boolean {
    if (!this.config.pagination) return false
    return this.pagination.hasMore()
  }

  /**
   * Get current items
   */
  getCurrentItems(): T[] {
    return this.displayedItems
  }

  /**
   * Get current pagination data
   * @deprecated Use getPagination() instead
   */
  getCurrentPagination(): PaginationData | null {
    if (!this.config.pagination) return null

    let processedItems = this.filterItems()
    processedItems = this.sortItems(processedItems)

    const pageSize = this.config.pageSize || 20
    return {
      currentPage: this.currentPage,
      pageCount: Math.ceil(processedItems.length / pageSize),
      perPage: pageSize,
      totalCount: processedItems.length
    }
  }

  /**
   * Get pagination interface for UI components
   */
  getPagination(): Pagination | null {
    if (!this.config.pagination) {
      return null
    }
    return this.pagination
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

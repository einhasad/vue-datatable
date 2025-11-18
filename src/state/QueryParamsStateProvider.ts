import type { StateProvider } from './StateProvider'
import type { SortState, RouterLike } from '../types'

/**
 * Configuration for QueryParamsStateProvider
 */
export interface QueryParamsStateProviderConfig {
  router: RouterLike
  prefix?: string
}

/**
 * QueryParamsStateProvider - stores state in URL query parameters
 * State persists across page refreshes and can be shared via URL
 * Uses a prefix to avoid conflicts with other query parameters
 * Default prefix: 'search'
 */
export class QueryParamsStateProvider implements StateProvider {
  private router: RouterLike
  private prefix: string

  constructor(config: QueryParamsStateProviderConfig) {
    this.router = config.router
    this.prefix = config.prefix || 'search'
  }

  /**
   * Normalize parameter name with prefix
   */
  private normalizeParamName(key: string): string {
    return `${this.prefix}-${key}`
  }

  /**
   * Get query parameter value
   */
  private getQueryParam(key: string): string | null {
    const paramName = this.normalizeParamName(key)
    const value = this.router.currentRoute.value.query[paramName]
    return Array.isArray(value) ? (value[0] || null) : (value || null)
  }

  /**
   * Set query parameter value
   */
  private setQueryParam(key: string, value: string | null): void {
    const paramName = this.normalizeParamName(key)
    const currentQuery = { ...this.router.currentRoute.value.query }

    if (value === '' || value === null || value === undefined) {
      delete currentQuery[paramName]
    } else {
      currentQuery[paramName] = value
    }

    this.router.replace({
      path: this.router.currentRoute.value.path,
      query: currentQuery,
      hash: this.router.currentRoute.value.hash
    })
  }

  /**
   * Filter management
   */
  getFilter(key: string): string | null {
    return this.getQueryParam(key)
  }

  setFilter(key: string, value: string): void {
    this.setQueryParam(key, value)
  }

  clearFilter(key: string): void {
    this.setQueryParam(key, null)
  }

  getAllFilters(): Record<string, string> {
    const filters: Record<string, string> = {}
    const query = this.router.currentRoute.value.query
    const prefixWithDash = `${this.prefix}-`

    Object.keys(query).forEach(key => {
      if (key.startsWith(prefixWithDash) && key !== this.normalizeParamName('sort')) {
        const originalKey = key.substring(prefixWithDash.length)
        const value = query[key]
        const stringValue = Array.isArray(value) ? (value[0] || '') : (value || '')
        if (stringValue) {
          filters[originalKey] = stringValue
        }
      }
    })

    return filters
  }

  /**
   * Sort management
   */
  getSort(): SortState | null {
    const sortValue = this.getQueryParam('sort')
    if (!sortValue) return null

    if (sortValue.startsWith('-')) {
      return {
        field: sortValue.substring(1),
        order: 'desc'
      }
    } else {
      return {
        field: sortValue,
        order: 'asc'
      }
    }
  }

  setSort(field: string, order: 'asc' | 'desc'): void {
    const sortValue = order === 'desc' ? `-${field}` : field
    this.setQueryParam('sort', sortValue)
  }

  clearSort(): void {
    this.setQueryParam('sort', null)
  }

  /**
   * Pagination management
   */
  getPage(): number | null {
    const pageValue = this.getQueryParam('page')
    if (!pageValue) return null
    const page = parseInt(pageValue, 10)
    return isNaN(page) ? null : page
  }

  setPage(page: number): void {
    this.setQueryParam('page', page.toString())
  }

  clearPage(): void {
    this.setQueryParam('page', null)
  }

  /**
   * Cursor management
   */
  getCursor(): string | null {
    return this.getQueryParam('cursor')
  }

  setCursor(cursor: string): void {
    this.setQueryParam('cursor', cursor)
  }

  clearCursor(): void {
    this.setQueryParam('cursor', null)
  }

  /**
   * Clear all state
   */
  clear(): void {
    const currentQuery = { ...this.router.currentRoute.value.query }
    const prefixWithDash = `${this.prefix}-`

    // Remove all prefixed parameters
    Object.keys(currentQuery).forEach(key => {
      if (key.startsWith(prefixWithDash)) {
        delete currentQuery[key]
      }
    })

    this.router.replace({
      query: currentQuery,
      hash: this.router.currentRoute.value.hash
    })
  }
}

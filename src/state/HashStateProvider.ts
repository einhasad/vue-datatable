import type { StateProvider } from './StateProvider'
import type { SortState, RouterLike } from '../types'

/**
 * Configuration for HashStateProvider
 */
export interface HashStateProviderConfig {
  router: RouterLike
  prefix?: string
}

/**
 * HashStateProvider - stores state in URL hash
 * State persists across page refreshes and can be shared via URL
 * Uses URL hash format: #key1=value1&key2=value2
 * Uses a prefix to organize parameters
 * Default prefix: 'search'
 */
export class HashStateProvider implements StateProvider {
  private router: RouterLike
  private prefix: string

  constructor(config: HashStateProviderConfig) {
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
   * Parse hash string into key-value pairs
   */
  private parseHash(hash: string): Record<string, string> {
    const params: Record<string, string> = {}
    if (!hash || hash === '#') return params

    const hashContent = hash.startsWith('#') ? hash.substring(1) : hash
    const pairs = hashContent.split('&')

    pairs.forEach(pair => {
      const [key, value] = pair.split('=')
      if (key && value !== undefined) {
        params[decodeURIComponent(key)] = decodeURIComponent(value)
      }
    })

    return params
  }

  /**
   * Build hash string from key-value pairs
   */
  private buildHash(params: Record<string, string>): string {
    const pairs = Object.entries(params)
      .filter(([_, value]) => value !== null && value !== undefined && value !== '')
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)

    return pairs.length > 0 ? `#${pairs.join('&')}` : ''
  }

  /**
   * Get current hash parameters
   */
  private getHashParams(): Record<string, string> {
    const hash = this.router.currentRoute.value.hash
    return this.parseHash(hash)
  }

  /**
   * Set hash parameters
   */
  private setHashParams(params: Record<string, string>): void {
    const newHash = this.buildHash(params)
    // Use type assertion for full route location with path
    this.router.replace({
      path: this.router.currentRoute.value.path,
      query: this.router.currentRoute.value.query,
      hash: newHash
    } as any)
  }

  /**
   * Get hash parameter value
   */
  private getHashParam(key: string): string | null {
    const params = this.getHashParams()
    const paramName = this.normalizeParamName(key)
    return params[paramName] || null
  }

  /**
   * Set hash parameter value
   */
  private setHashParam(key: string, value: string | null): void {
    const params = this.getHashParams()
    const paramName = this.normalizeParamName(key)

    if (value === '' || value === null || value === undefined) {
      delete params[paramName]
    } else {
      params[paramName] = value
    }

    this.setHashParams(params)
  }

  /**
   * Filter management
   */
  getFilter(key: string): string | null {
    return this.getHashParam(key)
  }

  setFilter(key: string, value: string): void {
    this.setHashParam(key, value)
  }

  clearFilter(key: string): void {
    this.setHashParam(key, null)
  }

  getAllFilters(): Record<string, string> {
    const filters: Record<string, string> = {}
    const params = this.getHashParams()
    const prefixWithDash = `${this.prefix}-`

    Object.keys(params).forEach(key => {
      if (key.startsWith(prefixWithDash) && key !== this.normalizeParamName('sort')) {
        const originalKey = key.substring(prefixWithDash.length)
        if (params[key]) {
          filters[originalKey] = params[key]
        }
      }
    })

    return filters
  }

  /**
   * Sort management
   */
  getSort(): SortState | null {
    const sortValue = this.getHashParam('sort')
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
    this.setHashParam('sort', sortValue)
  }

  clearSort(): void {
    this.setHashParam('sort', null)
  }

  /**
   * Pagination management
   */
  getPage(): number | null {
    const pageValue = this.getHashParam('page')
    if (!pageValue) return null
    const page = parseInt(pageValue, 10)
    return isNaN(page) ? null : page
  }

  setPage(page: number): void {
    this.setHashParam('page', page.toString())
  }

  clearPage(): void {
    this.setHashParam('page', null)
  }

  /**
   * Cursor management
   */
  getCursor(): string | null {
    return this.getHashParam('cursor')
  }

  setCursor(cursor: string): void {
    this.setHashParam('cursor', cursor)
  }

  clearCursor(): void {
    this.setHashParam('cursor', null)
  }

  /**
   * Clear all state
   */
  clear(): void {
    const params = this.getHashParams()
    const prefixWithDash = `${this.prefix}-`

    // Remove all prefixed parameters
    Object.keys(params).forEach(key => {
      if (key.startsWith(prefixWithDash)) {
        delete params[key]
      }
    })

    this.setHashParams(params)
  }
}

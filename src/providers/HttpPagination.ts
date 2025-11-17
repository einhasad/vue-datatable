import type { Pagination } from '../types'

/**
 * Configuration for HTTP pagination requests
 * Defines how pagination parameters are sent to the API
 */
export class PaginationRequest {
  next: string = ''
  limit: number = 20
  nextParamName: string = 'page'
  limitParamName: string = 'pageSize'

  constructor(init?: Partial<PaginationRequest>) {
    if (init) {
      Object.assign(this, init)
    }
  }
}

/**
 * HTTP Pagination implementation
 * Supports both cursor-based (next token) and page-based pagination
 */
export class HttpPagination implements Pagination {
  private totalCount: number | null = null
  private pageCount: number | null = null
  private currentPage: number | null = null
  private pageSize: number | null = null
  private nextToken: string | null = null
  private _hasMore: boolean = false

  /**
   * Update pagination state from API response
   */
  update(data: {
    totalCount?: number
    pageCount?: number
    currentPage?: number
    pageSize?: number
    nextToken?: string
    hasMore?: boolean
  }): void {
    if (data.totalCount !== undefined) this.totalCount = data.totalCount
    if (data.pageCount !== undefined) this.pageCount = data.pageCount
    if (data.currentPage !== undefined) this.currentPage = data.currentPage
    if (data.pageSize !== undefined) this.pageSize = data.pageSize
    if (data.nextToken !== undefined) this.nextToken = data.nextToken
    if (data.hasMore !== undefined) this._hasMore = data.hasMore
  }

  /**
   * Reset pagination state
   */
  reset(): void {
    this.totalCount = null
    this.pageCount = null
    this.currentPage = null
    this.pageSize = null
    this.nextToken = null
    this._hasMore = false
  }

  // Pagination interface implementation
  getTotalCount(): number | null {
    return this.totalCount
  }

  getPageCount(): number | null {
    return this.pageCount
  }

  getCurrentPage(): number | null {
    return this.currentPage
  }

  getPageSize(): number | null {
    return this.pageSize
  }

  getNextToken(): string | null {
    return this.nextToken
  }

  hasMore(): boolean {
    return this._hasMore
  }
}

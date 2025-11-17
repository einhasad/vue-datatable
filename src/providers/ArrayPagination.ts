import type { Pagination } from '../types'

/**
 * Array Pagination implementation
 * Client-side pagination for in-memory arrays
 * Always knows total count since all data is local
 */
export class ArrayPagination implements Pagination {
  private totalCount: number = 0
  private pageCount: number = 0
  private currentPage: number = 1
  private pageSize: number = 20
  private _hasMore: boolean = false

  /**
   * Update pagination state
   */
  update(data: {
    totalCount: number
    currentPage: number
    pageSize: number
  }): void {
    this.totalCount = data.totalCount
    this.currentPage = data.currentPage
    this.pageSize = data.pageSize
    this.pageCount = Math.ceil(data.totalCount / data.pageSize)
    this._hasMore = data.currentPage < this.pageCount
  }

  /**
   * Reset pagination state
   */
  reset(): void {
    this.totalCount = 0
    this.pageCount = 0
    this.currentPage = 1
    this.pageSize = 20
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
    // Array pagination doesn't use tokens
    return null
  }

  hasMore(): boolean {
    return this._hasMore
  }
}

import type { Pagination, CursorPaginationData, PagePaginationData } from '../types'

/**
 * ArrayPagination implementation
 * Wraps pagination data for ArrayDataProvider and provides a unified interface for UI components
 */
export class ArrayPagination implements Pagination {
  private data: CursorPaginationData | PagePaginationData | null

  constructor(data: CursorPaginationData | PagePaginationData | null) {
    this.data = data
  }

  getTotalCount(): number | null {
    if (!this.data) return null
    if ('totalCount' in this.data) {
      return this.data.totalCount
    }
    return null
  }

  getPageCount(): number | null {
    if (!this.data) return null
    if ('pageCount' in this.data) {
      return this.data.pageCount
    }
    return null
  }

  getCurrentPage(): number | null {
    if (!this.data) return null
    if ('currentPage' in this.data) {
      return this.data.currentPage
    }
    return null
  }

  getPageSize(): number | null {
    if (!this.data) return null
    if ('perPage' in this.data) {
      return this.data.perPage
    }
    return null
  }

  getNextToken(): string | null {
    if (!this.data) return null
    if ('nextCursor' in this.data) {
      return this.data.nextCursor || null
    }
    return null
  }

  hasMore(): boolean {
    if (!this.data) return false

    // Cursor-based pagination
    if ('hasMore' in this.data) {
      return this.data.hasMore
    }

    // Page-based pagination
    if ('currentPage' in this.data && 'pageCount' in this.data) {
      return this.data.currentPage < this.data.pageCount
    }

    return false
  }
}

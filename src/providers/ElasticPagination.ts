import type { Pagination, CursorPaginationData } from '../types'

/**
 * ElasticPagination implementation
 * Wraps cursor-based pagination data for Elasticsearch provider
 */
export class ElasticPagination implements Pagination {
  private data: CursorPaginationData | null
  private totalHits: number

  constructor(data: CursorPaginationData | null, totalHits: number = 0) {
    this.data = data
    this.totalHits = totalHits
  }

  getTotalCount(): number | null {
    return this.totalHits
  }

  getPageCount(): number | null {
    // Elasticsearch uses cursor-based pagination, no page count
    return null
  }

  getCurrentPage(): number | null {
    // Elasticsearch uses cursor-based pagination, no current page
    return null
  }

  getPageSize(): number | null {
    // Elasticsearch doesn't expose page size in pagination data
    return null
  }

  getNextToken(): string | null {
    if (!this.data) return null
    return this.data.nextCursor || null
  }

  hasMore(): boolean {
    if (!this.data) return false
    return this.data.hasMore
  }
}

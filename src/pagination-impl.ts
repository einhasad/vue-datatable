import type { Pagination, LoadResult } from './types'

/**
 * Cursor-based pagination implementation
 * Used for load more / infinite scroll patterns
 */
export class CursorPagination implements Pagination {
  private nextCursor: string | null = null
  private _hasMore = false
  private _isLoading = false
  private loadCallback: (cursor?: string) => Promise<LoadResult<unknown>>
  private refreshCallback: () => Promise<LoadResult<unknown>>

  constructor(
    loadCallback: (cursor?: string) => Promise<LoadResult<unknown>>,
    refreshCallback: () => Promise<LoadResult<unknown>>
  ) {
    this.loadCallback = loadCallback
    this.refreshCallback = refreshCallback
  }

  /**
   * Update pagination state from load result
   */
  update(nextCursor: string | null, hasMore: boolean): void {
    this.nextCursor = nextCursor
    this._hasMore = hasMore
  }

  hasMore(): boolean {
    return this._hasMore
  }

  async loadMore(): Promise<void> {
    if (!this._hasMore || this._isLoading) {
      return
    }

    this._isLoading = true
    try {
      await this.loadCallback(this.nextCursor || undefined)
    } finally {
      this._isLoading = false
    }
  }

  async refresh(): Promise<void> {
    this._isLoading = true
    this.nextCursor = null
    this._hasMore = false
    try {
      await this.refreshCallback()
    } finally {
      this._isLoading = false
    }
  }

  isLoading(): boolean {
    return this._isLoading
  }

  getNextCursor(): string | null {
    return this.nextCursor
  }

  setLoading(loading: boolean): void {
    this._isLoading = loading
  }
}

/**
 * Page-based pagination implementation
 * Used for traditional page number navigation
 */
export class PageBasedPagination implements Pagination {
  private currentPage = 1
  private totalPages = 1
  private perPage = 20
  private totalCount = 0
  private _isLoading = false
  private loadCallback: (page: number) => Promise<LoadResult<unknown>>
  private refreshCallback: () => Promise<LoadResult<unknown>>

  constructor(
    loadCallback: (page: number) => Promise<LoadResult<unknown>>,
    refreshCallback: () => Promise<LoadResult<unknown>>
  ) {
    this.loadCallback = loadCallback
    this.refreshCallback = refreshCallback
  }

  /**
   * Update pagination state from load result
   */
  update(currentPage: number, totalPages: number, perPage: number, totalCount: number): void {
    this.currentPage = currentPage
    this.totalPages = totalPages
    this.perPage = perPage
    this.totalCount = totalCount
  }

  hasMore(): boolean {
    return this.currentPage < this.totalPages
  }

  async loadMore(): Promise<void> {
    if (!this.hasMore() || this._isLoading) {
      return
    }

    await this.setPage(this.currentPage + 1)
  }

  async refresh(): Promise<void> {
    this._isLoading = true
    this.currentPage = 1
    this.totalPages = 1
    this.totalCount = 0
    try {
      await this.refreshCallback()
    } finally {
      this._isLoading = false
    }
  }

  isLoading(): boolean {
    return this._isLoading
  }

  getCurrentPage(): number {
    return this.currentPage
  }

  getTotalPages(): number {
    return this.totalPages
  }

  getPerPage(): number {
    return this.perPage
  }

  getTotalCount(): number {
    return this.totalCount
  }

  async setPage(page: number): Promise<void> {
    if (page < 1 || page > this.totalPages || this._isLoading) {
      return
    }

    this._isLoading = true
    try {
      await this.loadCallback(page)
    } finally {
      this._isLoading = false
    }
  }

  setLoading(loading: boolean): void {
    this._isLoading = loading
  }
}

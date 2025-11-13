import { ref, Ref } from 'vue'
import {apiClient} from "@src/httpClient";

import type {
  DataProvider,
  DataProviderConfig,
  LoadOptions,
  LoadResult,
  PaginationData,
  CursorPaginationData,
  SortState
} from '../types'
import {useErrorMessage} from "@src/spa/utils/useMessage";

/**
 * Elasticsearch DSL query structure
 */
export interface ElasticQuery {
  query?: any
  post_filter?: any
  sort?: any[]
  aggs?: Record<string, any>
  search_after?: any[]
  size?: number
  _source?: string[] | boolean
  track_total_hits?: boolean
}

/**
 * Elasticsearch response structure
 */
export interface ElasticResponse<T = any> {
  hits: {
    total: {
      value: number
      relation: string
    }
    hits: Array<{
      _id: string
      _source: T
      sort?: any[]
    }>
  }
  aggregations?: Record<string, any>
}

/**
 * Configuration for DSTElasticDataProvider
 */
export interface DSTElasticDataProviderConfig extends DataProviderConfig {
  url: string
  index?: string
  pageSize?: number
  defaultQuery?: any
  defaultSort?: any[]
  aggregations?: Record<string, any>
  sourceFields?: string[]
  trackTotalHits?: boolean
}

/**
 * DataProvider for Elasticsearch DSL queries
 * Supports cursor-based pagination using search_after
 *
 * @example
 * ```typescript
 * const provider = new DSTElasticDataProvider({
 *   url: '/api/elasticsearch/search',
 *   pagination: true,
 *   paginationMode: 'cursor',
 *   pageSize: 20,
 *   defaultSort: [{ timestamp: 'desc' }, { _id: 'desc' }]
 * })
 * ```
 */
export class DSTElasticDataProvider<T = any> implements DataProvider<T> {
  public config: DSTElasticDataProviderConfig
  public router?: any
  private loading: Ref<boolean>
  private items: Ref<T[]>
  public paginationData: Ref<CursorPaginationData | null>
  private sortState: SortState | null = null
  private currentQuery: any = {}
  private currentPostFilter: any = null
  private lastSortValues: any[] | null = null
  private totalHits = 0

  constructor(config: DSTElasticDataProviderConfig, router?: any) {
    this.config = {
      pageSize: 20,
      trackTotalHits: true,
      ...config,
      paginationMode: 'cursor',
      pagination: config.pagination !== false
    }
    this.router = router
    this.loading = ref(false)
    this.items = ref([]) as Ref<T[]>
    this.paginationData = ref<CursorPaginationData | null>(null)

    if (config.defaultQuery) {
      this.currentQuery = config.defaultQuery
    }

    if (config.defaultSort && config.defaultSort.length > 0) {
      const firstSort = config.defaultSort[0]
      const field = Object.keys(firstSort)[0]
      const order = firstSort[field] as 'asc' | 'desc'
      this.sortState = { field, order }
    }
  }

  /**
   * Build Elasticsearch DSL query
   */
  private buildQuery(options: LoadOptions = {}): ElasticQuery {
    const query: ElasticQuery = {
      query: this.currentQuery || { match_all: {} },
      size: options.pageSize || this.config.pageSize || 20
    }

    // Add post_filter for filtering hits without affecting aggregations
    if (this.currentPostFilter) {
      query.post_filter = this.currentPostFilter
    }

    // Add sorting
    const sort = this.buildSort(options)
    if (sort.length > 0) {
      query.sort = sort
    }

    // Add search_after for cursor pagination
    if (options.cursor && this.lastSortValues) {
      try {
        query.search_after = JSON.parse(options.cursor)
      } catch {
        query.search_after = this.lastSortValues
      }
    }

    // Add aggregations - wrap non-global aggregations in filter if post_filter is present
    if (this.config.aggregations) {
      if (this.currentPostFilter) {
        // Wrap each aggregation in a filter to apply post_filter conditions
        // EXCEPT for global aggregations (they should remain unfiltered)
        const filteredAggs: Record<string, any> = {}
        for (const [key, agg] of Object.entries(this.config.aggregations)) {
          // Check if this is a global aggregation
          if (agg.global !== undefined) {
            // Keep global aggregations as-is (they ignore query filters)
            filteredAggs[key] = agg
          } else {
            // Wrap non-global aggregations in filter
            filteredAggs[key] = {
              filter: this.currentPostFilter,
              aggs: {
                [key]: agg
              }
            }
          }
        }
        query.aggs = filteredAggs
      } else {
        query.aggs = this.config.aggregations
      }
    }

    // Add source filtering
    if (this.config.sourceFields) {
      query._source = this.config.sourceFields
    }

    // Add track_total_hits
    if (this.config.trackTotalHits) {
      query.track_total_hits = true
    }

    return query
  }

  /**
   * Build sort array for Elasticsearch
   */
  private buildSort(options: LoadOptions = {}): any[] {
    const sort: any[] = []

    // Add explicit sort from options
    if (options.sortField && options.sortOrder) {
      sort.push({ [options.sortField]: options.sortOrder })
    }
    // Add sort from state
    else if (this.sortState) {
      sort.push({ [this.sortState.field]: this.sortState.order })
    }
    // Add default sort
    else if (this.config.defaultSort) {
      sort.push(...this.config.defaultSort)
    }

    // Always include _id as tiebreaker for cursor pagination
    if (sort.length > 0 && !sort.some(s => '_id' in s)) {
      sort.push({ _id: 'desc' })
    }

    return sort
  }

  /**
   * Query parameter management with router
   */
  setQueryParam(key: string, value: string): void {
    if (!this.router) {
      console.warn('Router not provided. Query parameters will not be persisted to URL.')
      return
    }

    const paramName = this.normalizeParamName(key)
    const currentQuery = { ...this.router.currentRoute.value.query }

    if (value === '' || value === null || value === undefined) {
      delete currentQuery[paramName]
    } else {
      currentQuery[paramName] = value
    }

    this.router.replace({
      query: currentQuery,
      hash: this.router.currentRoute.value.hash
    })
  }

  clearQueryParam(key: string): void {
    this.setQueryParam(key, '')
  }

  getRawQueryParam(key: string): string | null {
    if (!this.router) {
      return null
    }

    const paramName = this.normalizeParamName(key)
    const value = this.router.currentRoute.value.query[paramName]
    return Array.isArray(value) ? (value[0] || null) : (value || null)
  }

  /**
   * Normalize parameter name with search prefix
   */
  private normalizeParamName(param: string): string {
    if (this.config.searchPrefix) {
      return `${this.config.searchPrefix}-${param}`
    }
    return param
  }

  /**
   * Sort management
   */
  setSort(field: string, order: 'asc' | 'desc'): void {
    this.sortState = { field, order }
  }

  getSort(): SortState | null {
    return this.sortState
  }

  /**
   * Set Elasticsearch query
   */
  setElasticQuery(query: any): void {
    this.currentQuery = query
  }

  /**
   * Get current Elasticsearch query
   */
  getElasticQuery(): any {
    return this.currentQuery
  }

  /**
   * Set Elasticsearch post_filter (filters hits without affecting aggregations)
   */
  setPostFilter(postFilter: any): void {
    this.currentPostFilter = postFilter
  }

  /**
   * Get current Elasticsearch post_filter
   */
  getPostFilter(): any {
    return this.currentPostFilter
  }

  /**
   * Set aggregations
   */
  setAggregations(aggs: Record<string, any>): void {
    this.config.aggregations = aggs
  }

  /**
   * Get aggregation results from last response
   */
  getAggregations(): Record<string, any> | undefined {
    return (this.paginationData.value as any)?.aggregations
  }

  /**
   * Load data from Elasticsearch
   */
  async load(options: LoadOptions = {}): Promise<LoadResult<T>> {
    this.loading.value = true

    const query = this.buildQuery(options)

    // If index is configured, send in backend format { index, body }
    const requestData = this.config.index
      ? { index: this.config.index, body: query }
      : query

    const response = await apiClient.post<ElasticResponse<T>>(this.config.url, requestData)
        .catch(useErrorMessage)

    // Unwrap backend response if it's wrapped in result
    const data = (response.data as any).result || response.data

    // Extract items
    const items = data.hits.hits.map(hit => hit._source)

    // Store last sort values for next cursor
    if (data.hits.hits.length > 0) {
      const lastHit = data.hits.hits[data.hits.hits.length - 1]
      this.lastSortValues = lastHit.sort || null
    } else {
      this.lastSortValues = null
    }

    // Update total hits
    this.totalHits = data.hits.total.value

    // Determine if there are more results
    const hasMore = data.hits.hits.length === query.size

    // For cursor mode, append or replace items
    if (options.cursor) {
      this.items.value.push(...items)
    } else {
      this.items.value = items
    }

    // Build cursor for next page
    const nextCursor = hasMore && this.lastSortValues
      ? JSON.stringify(this.lastSortValues)
      : null

    // Update pagination data
    this.paginationData.value = {
      nextCursor: nextCursor || '',
      hasMore
    }

    // Store aggregations if present
    if (data.aggregations) {
      (this.paginationData.value as any).aggregations = data.aggregations
    }

    this.loading.value = false

    return {
      items: this.items.value,
      pagination: this.paginationData.value
    }
  }

  /**
   * Load more data (cursor pagination)
   */
  async loadMore(): Promise<LoadResult<T>> {
    if (!this.hasMore()) {
      return {
        items: this.items.value,
        pagination: this.paginationData.value || undefined
      }
    }

    const cursor = this.paginationData.value?.nextCursor
    return this.load({ cursor })
  }

  /**
   * Refresh data (reload from beginning)
   */
  async refresh(): Promise<LoadResult<T>> {
    this.items.value = []
    this.lastSortValues = null
    this.paginationData.value = null
    return this.load()
  }

  /**
   * Check if loading
   */
  isLoading(): boolean {
    return this.loading.value
  }

  /**
   * Check if more data available
   */
  hasMore(): boolean {
    return this.paginationData.value?.hasMore === true
  }

  /**
   * Get current items
   */
  getCurrentItems(): T[] {
    return this.items.value
  }

  /**
   * Get current pagination data
   */
  getCurrentPagination(): PaginationData | null {
    return this.paginationData.value
  }

  /**
   * Get total hits count
   */
  getTotalHits(): number {
    return this.totalHits
  }

  /**
   * Build match query for text search
   */
  static buildMatchQuery(field: string, value: string): any {
    return {
      match: {
        [field]: value
      }
    }
  }

  /**
   * Build multi-match query for searching across multiple fields
   */
  static buildMultiMatchQuery(fields: string[], value: string): any {
    return {
      multi_match: {
        query: value,
        fields
      }
    }
  }

  /**
   * Build bool query with must/should/must_not
   */
  static buildBoolQuery(options: {
    must?: any[]
    should?: any[]
    must_not?: any[]
    filter?: any[]
  }): any {
    return {
      bool: options
    }
  }

  /**
   * Build term query for exact match
   */
  static buildTermQuery(field: string, value: any): any {
    return {
      term: {
        [field]: value
      }
    }
  }

  /**
   * Build range query
   */
  static buildRangeQuery(
    field: string,
    options: { gte?: any; lte?: any; gt?: any; lt?: any }
  ): any {
    return {
      range: {
        [field]: options
      }
    }
  }

  /**
   * Build terms aggregation
   */
  static buildTermsAggregation(field: string, size = 10): any {
    return {
      terms: {
        field,
        size
      }
    }
  }

  /**
   * Build date histogram aggregation
   */
  static buildDateHistogramAggregation(
    field: string,
    interval: string
  ): any {
    return {
      date_histogram: {
        field,
        calendar_interval: interval
      }
    }
  }
}

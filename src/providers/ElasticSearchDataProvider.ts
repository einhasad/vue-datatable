import { ref, shallowRef, type Ref } from 'vue'
import type {
  DataProvider,
  LoadOptions,
  LoadResult,
  SortState,
  RouterLike,
  KeysetPaginationState,
  OffsetPaginationState
} from '../types'
import type { StateProvider } from '../state/StateProvider'
import { QueryParamsStateProvider } from '../state/QueryParamsStateProvider'
import { InMemoryStateProvider } from '../state/InMemoryStateProvider'

/**
 * HTTP client function type for Elasticsearch requests
 */
export type ElasticHttpClient = (url: string, body: unknown) => Promise<unknown>

/**
 * Elasticsearch DSL query structure
 */
export interface ElasticQuery {
  query?: unknown
  post_filter?: unknown
  sort?: unknown[]
  aggs?: Record<string, unknown>
  from?: number
  size?: number
  _source?: string[] | boolean
  track_total_hits?: boolean
  search_after?: unknown[]
}

/**
 * Elasticsearch response structure
 */
export interface ElasticResponse<T = unknown> {
  hits: {
    total: {
      value: number
      relation: string
    }
    hits: Array<{
      _id: string
      _source: T
      sort?: unknown[]
    }>
  }
  aggregations?: Record<string, unknown>
}

/**
 * Adapter for transforming raw HTTP responses into ElasticResponse
 */
export interface ElasticResponseAdapter {
  adapt<T>(raw: unknown): ElasticResponse<T>
}

/**
 * Default adapter - assumes response IS the ES response directly
 */
export class DefaultElasticResponseAdapter implements ElasticResponseAdapter {
  adapt<T>(raw: unknown): ElasticResponse<T> {
    return raw as ElasticResponse<T>
  }
}

/**
 * Constructor parameters for ElasticsearchDataProvider
 */
export interface ElasticsearchDataProviderConfig {
  url: string
  index?: string
  pageSize?: number
  httpClient?: ElasticHttpClient
  responseAdapter?: ElasticResponseAdapter
  stateProvider?: StateProvider
  router?: RouterLike
  defaultQuery?: unknown
  defaultSort?: unknown[]
  aggregations?: Record<string, unknown>
  sourceFields?: string[]
  trackTotalHits?: boolean
}

/**
 * Project-agnostic Elasticsearch DataProvider — data fetching only, no pagination.
 * Use ElasticPagePagination decorator to add server-side from/size pagination.
 */
export class ElasticSearchDataProvider<T = unknown> implements DataProvider<T> {
  public readonly pageSize: number
  private readonly url: string
  private readonly esIndex?: string
  private readonly httpClient: ElasticHttpClient
  private readonly responseAdapter: ElasticResponseAdapter
  private readonly stateProvider: StateProvider
  private readonly defaultSortValue?: unknown[]
  private readonly sourceFieldsValue?: string[] | boolean
  private readonly trackTotalHitsValue: boolean

  private loading: Ref<boolean>
  private items: Ref<T[]>
  private currentQuery: unknown
  private currentPostFilter: unknown = null
  private aggregationsConfig: Record<string, unknown> | undefined
  private from = 0
  private totalHits = 0
  private lastAggregations: Record<string, unknown> | undefined
  private keysetPaginationState: KeysetPaginationState | null = null
  private offsetPaginationState: OffsetPaginationState | null = null
  private searchAfter: unknown[] | null = null

  constructor(config: ElasticsearchDataProviderConfig) {
    this.url = config.url
    this.esIndex = config.index
    this.pageSize = config.pageSize ?? 20
    this.trackTotalHitsValue = config.trackTotalHits ?? true
    this.sourceFieldsValue = config.sourceFields
    this.defaultSortValue = config.defaultSort
    this.aggregationsConfig = config.aggregations

    // StateProvider resolution
    if (config.stateProvider) {
      this.stateProvider = config.stateProvider
    } else if (config.router) {
      this.stateProvider = new QueryParamsStateProvider({
        router: config.router,
        prefix: 'search'
      })
    } else {
      this.stateProvider = new InMemoryStateProvider()
    }

    this.loading = ref(false)
    this.items = shallowRef<T[]>([])

    this.httpClient = config.httpClient ?? this.defaultHttpClient.bind(this)
    this.responseAdapter = config.responseAdapter ?? new DefaultElasticResponseAdapter()

    this.currentQuery = config.defaultQuery ?? null

    // Auto-initialize offset pagination so the grid can render pagination controls
    this.offsetPaginationState = { page: 1, pageSize: this.pageSize }

    if (config.defaultSort && config.defaultSort.length > 0) {
      const firstSort = config.defaultSort[0] as Record<string, unknown>
      const field = Object.keys(firstSort)[0]
      const order = firstSort[field] as 'asc' | 'desc'
      this.stateProvider.setSort(field, order)
    }
  }

  private async defaultHttpClient(url: string, body: unknown): Promise<unknown> {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  private buildQuery(options: LoadOptions = { sortOrder: null }): ElasticQuery {
    const query: ElasticQuery = {
      query: this.currentQuery ?? { match_all: {} },
      size: this.pageSize,
      from: this.from
    }

    // Keyset pagination overrides offset when active
    if (this.searchAfter && this.keysetPaginationState) {
      delete query.from
      query.search_after = this.searchAfter
    }

    if (this.currentPostFilter) {
      query.post_filter = this.currentPostFilter
    }

    const sort = this.buildSort(options)
    if (sort.length > 0) {
      query.sort = sort
    }

    if (this.aggregationsConfig) {
      if (this.currentPostFilter) {
        const filteredAggs: Record<string, unknown> = {}
        for (const [key, agg] of Object.entries(this.aggregationsConfig)) {
          if ((agg as Record<string, unknown>).global !== undefined) {
            filteredAggs[key] = agg
          } else {
            filteredAggs[key] = {
              filter: this.currentPostFilter,
              aggs: { [key]: agg }
            }
          }
        }
        query.aggs = filteredAggs
      } else {
        query.aggs = this.aggregationsConfig
      }
    }

    if (this.sourceFieldsValue) {
      query._source = this.sourceFieldsValue
    }

    if (this.trackTotalHitsValue) {
      query.track_total_hits = true
    }

    return query
  }

  private buildSort(options: LoadOptions = { sortOrder: null }): unknown[] {
    const sort: unknown[] = []

    if (options.sortField && options.sortOrder) {
      sort.push({ [options.sortField]: options.sortOrder })
    } else {
      const sortState = this.stateProvider.getSort()
      if (sortState) {
        sort.push({ [sortState.field]: sortState.order })
      } else if (this.defaultSortValue) {
        sort.push(...this.defaultSortValue)
      }
    }

    if (sort.length > 0 && !sort.some(s => '_id' in (s as Record<string, unknown>))) {
      sort.push({ _id: 'desc' })
    }

    return sort
  }

  async load(options: LoadOptions = { sortOrder: null }): Promise<LoadResult<T>> {
    this.loading.value = true

    try {
      if (options.sortField && options.sortOrder) {
        this.stateProvider.setSort(options.sortField, options.sortOrder)
      }

      const query = this.buildQuery(options)

      const requestData = this.esIndex
        ? { index: this.esIndex, body: query }
        : query

      const rawResponse = await this.httpClient(this.url, requestData)
      const response = this.responseAdapter.adapt<T>(rawResponse)

      const items = response.hits.hits.map(hit => hit._source)
      this.totalHits = response.hits.total.value
      this.items.value = items

      if (response.aggregations) {
        this.lastAggregations = response.aggregations
      }

      return { items: this.items.value }
    } finally {
      this.loading.value = false
    }
  }

  async refresh(): Promise<LoadResult<T>> {
    this.items.value = []
    return this.load()
  }

  setSort(sort: SortState): void {
    if (sort.order) {
      this.stateProvider.setSort(sort.field, sort.order)
    }
  }

  getSort(): SortState | null {
    return this.stateProvider.getSort()
  }

  isLoading(): boolean {
    return this.loading.value
  }

  getCurrentItems(): T[] {
    return this.items.value
  }

  /**
   * Replace current items reactively without invoking the http client.
   * Does not touch sort, pagination, or aggregations.
   */
  setRows(newRows: T[]): void {
    this.items.value = newRows
  }

  getStateProvider(): StateProvider {
    return this.stateProvider
  }

  /**
   * Set ES `from` offset (0-based). Used by ElasticPagePagination decorator.
   */
  setFrom(from: number): void {
    this.from = Math.max(0, from)
  }

  getTotalHits(): number {
    return this.totalHits
  }

  setElasticQuery(query: unknown): void {
    this.currentQuery = query
  }

  getElasticQuery(): unknown {
    return this.currentQuery
  }

  setPostFilter(postFilter: unknown): void {
    this.currentPostFilter = postFilter
  }

  getPostFilter(): unknown {
    return this.currentPostFilter
  }

  getRequestBody(): unknown {
    const query = this.buildQuery()
    return this.esIndex
      ? { index: this.esIndex, body: query }
      : query
  }

  /**
   * Set aggregation config (for modifying composite after keys etc.)
   */
  setAggregations(aggs: Record<string, unknown>): void {
    this.aggregationsConfig = aggs
  }

  /**
   * Get current aggregation configuration
   */
  getAggregationConfig(): Record<string, unknown> | undefined {
    return this.aggregationsConfig
  }

  /**
   * Get aggregation results from last response
   */
  getAggregations(): Record<string, unknown> | undefined {
    return this.lastAggregations
  }

  // --- Keyset pagination (supported by default) ---

  setKeysetPagination(state: KeysetPaginationState): void {
    this.keysetPaginationState = state
    this.searchAfter = state.cursor
  }

  getKeysetPagination(): KeysetPaginationState | null {
    return this.keysetPaginationState
  }

  // --- Offset pagination (supported by default) ---

  setOffsetPagination(state: OffsetPaginationState): void {
    this.offsetPaginationState = state
    this.from = (state.page - 1) * state.pageSize
  }

  getOffsetPagination(): OffsetPaginationState | null {
    if (!this.offsetPaginationState) return null
    return {
      ...this.offsetPaginationState,
      totalItems: this.totalHits,
      totalPages: Math.ceil(this.totalHits / this.offsetPaginationState.pageSize)
    }
  }

  // Static query builder helpers

  static buildMatchQuery(field: string, value: string): unknown {
    return { match: { [field]: value } }
  }

  static buildMultiMatchQuery(fields: string[], value: string): unknown {
    return { multi_match: { query: value, fields } }
  }

  static buildBoolQuery(options: {
    must?: unknown[]
    should?: unknown[]
    must_not?: unknown[]
    filter?: unknown[]
  }): unknown {
    return { bool: options }
  }

  static buildTermQuery(field: string, value: unknown): unknown {
    return { term: { [field]: value } }
  }

  static buildRangeQuery(
    field: string,
    options: { gte?: unknown; lte?: unknown; gt?: unknown; lt?: unknown }
  ): unknown {
    return { range: { [field]: options } }
  }

  static buildTermsAggregation(field: string, size: number = 10): unknown {
    return { terms: { field, size } }
  }

  static buildDateHistogramAggregation(field: string, interval: string): unknown {
    return { date_histogram: { field, calendar_interval: interval } }
  }
}

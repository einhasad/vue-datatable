import type { StateProvider, ReactiveState } from './StateProvider'
import type { SortState, RouterLike } from '../types'
import { createStateCore } from './stateCore'
import {
  applyUrlState,
  firstQueryValue,
  formatSort,
  latestLocation,
  onExternalRouteChange,
  parseSort,
  replaceLocation,
} from './routerSync'

export interface QueryParamsStateProviderConfig {
  router: RouterLike
  prefix?: string
}

export class QueryParamsStateProvider implements StateProvider {
  private readonly core = createStateCore()
  private readonly router: RouterLike
  private readonly prefix: string
  readonly state: ReactiveState = this.core.state

  constructor(config: QueryParamsStateProviderConfig) {
    this.router = config.router
    this.prefix = config.prefix ?? 'search'
    this.syncFromUrl()
    onExternalRouteChange(this.router, route => route.query, () => { this.syncFromUrl() })
  }

  private paramName(key: string): string {
    return `${this.prefix}-${key}`
  }

  private syncFromUrl(): void {
    applyUrlState(this.core, this.readFiltersFromUrl(), parseSort(this.getUrlParam('sort')))
  }

  private readFiltersFromUrl(): Record<string, string> {
    const filters: Record<string, string> = {}
    const query = this.router.currentRoute.value.query
    const prefixDash = `${this.prefix}-`
    const sortKey = this.paramName('sort')

    for (const [key, val] of Object.entries(query)) {
      if (key.startsWith(prefixDash) && key !== sortKey) {
        const v = firstQueryValue(val)
        if (v) filters[key.slice(prefixDash.length)] = v
      }
    }
    return filters
  }

  private getUrlParam(key: string): string | null {
    return firstQueryValue(this.router.currentRoute.value.query[this.paramName(key)])
  }

  private setUrlParam(key: string, value: string | null): void {
    const location = latestLocation(this.router)
    const param = this.paramName(key)
    if (!value) {
      delete location.query[param]
    } else {
      location.query[param] = value
    }
    replaceLocation(this.router, location)
  }

  getValue(key: string): string | null { return this.core.getFilter(key) }
  setValue(key: string, value: string): void { this.core.setFilterValue(key, value); this.setUrlParam(key, value) }
  deleteValue(key: string): void { this.core.clearFilterValue(key); this.setUrlParam(key, null) }
  getAllValues(): Record<string, string> { return this.core.getAllFilters() }

  getFilter(key: string): string | null { return this.core.getFilter(key) }
  getAllFilters(): Record<string, string> { return this.core.getAllFilters() }

  setFilter(key: string, value: string): void {
    this.core.setFilterValue(key, value)
    this.setUrlParam(key, value || null)
  }

  clearFilter(key: string): void {
    this.core.clearFilterValue(key)
    this.setUrlParam(key, null)
  }

  getSort(): SortState | null { return this.core.getSort() }

  setSort(field: string, order: 'asc' | 'desc'): void {
    this.core.setSortValue(field, order)
    this.setUrlParam('sort', formatSort(field, order))
  }

  clearSort(): void {
    this.core.clearSortValue()
    this.setUrlParam('sort', null)
  }

  clear(): void {
    const location = latestLocation(this.router)
    const prefixDash = `${this.prefix}-`
    for (const key of Object.keys(location.query)) {
      if (key.startsWith(prefixDash)) delete location.query[key]
    }
    this.core.clearAllValues()
    replaceLocation(this.router, location)
  }
}

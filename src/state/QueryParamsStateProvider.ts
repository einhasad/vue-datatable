import type { StateProvider, ReactiveState } from './StateProvider'
import type { SortState, RouterLike } from '../types'
import { createStateCore } from './stateCore'

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
    Object.assign(this.core.state.filters, this.readFiltersFromUrl())
    this.core.state.sort = this.readSortFromUrl()
  }

  private paramName(key: string): string {
    return `${this.prefix}-${key}`
  }

  private readFiltersFromUrl(): Record<string, string> {
    const filters: Record<string, string> = {}
    const query = this.router.currentRoute.value.query
    const prefixDash = `${this.prefix}-`
    const sortKey = this.paramName('sort')

    for (const [key, val] of Object.entries(query)) {
      if (key.startsWith(prefixDash) && key !== sortKey) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        const v = Array.isArray(val) ? (val[0] ?? '') : (val ?? '')
        if (v) filters[key.slice(prefixDash.length)] = v
      }
    }
    return filters
  }

  private readSortFromUrl(): SortState | null {
    const v = this.getUrlParam('sort')
    if (!v) return null
    return v.startsWith('-')
      ? { field: v.slice(1), order: 'desc' }
      : { field: v, order: 'asc' }
  }

  private getUrlParam(key: string): string | null {
    const v = this.router.currentRoute.value.query[this.paramName(key)]
    return Array.isArray(v) ? (v[0] ?? null) : (v ?? null)
  }

  private setUrlParam(key: string, value: string | null): void {
    const query = { ...this.router.currentRoute.value.query }
    const param = this.paramName(key)
    if (!value) {
      delete query[param]
    } else {
      query[param] = value
    }
    this.router.replace({ path: this.router.currentRoute.value.path, query, hash: this.router.currentRoute.value.hash })
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
    this.setUrlParam('sort', order === 'desc' ? `-${field}` : field)
  }

  clearSort(): void {
    this.core.clearSortValue()
    this.setUrlParam('sort', null)
  }

  clear(): void {
    const query = { ...this.router.currentRoute.value.query }
    const prefixDash = `${this.prefix}-`
    for (const key of Object.keys(query)) {
      if (key.startsWith(prefixDash)) delete query[key]
    }
    this.core.clearAllValues()
    this.router.replace({ path: this.router.currentRoute.value.path, query, hash: this.router.currentRoute.value.hash })
  }
}

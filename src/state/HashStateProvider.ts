import type { StateProvider, ReactiveState } from './StateProvider'
import type { SortState, RouterLike } from '../types'
import { createStateCore } from './stateCore'

export interface HashStateProviderConfig {
  router: RouterLike
  prefix?: string
}

export class HashStateProvider implements StateProvider {
  private readonly core = createStateCore()
  private readonly router: RouterLike
  private readonly prefix: string
  readonly state: ReactiveState = this.core.state

  constructor(config: HashStateProviderConfig) {
    this.router = config.router
    this.prefix = config.prefix ?? 'search'
    Object.assign(this.core.state.filters, this.readFiltersFromHash())
    this.core.state.sort = this.readSortFromHash()
  }

  private paramName(key: string): string {
    return `${this.prefix}-${key}`
  }

  private parseHash(): Record<string, string> {
    const hash = this.router.currentRoute.value.hash
    if (!hash || hash === '#') return {}
    const result: Record<string, string> = {}
    for (const pair of hash.replace(/^#/, '').split('&')) {
      const idx = pair.indexOf('=')
      if (idx <= 0) continue
      const k = pair.slice(0, idx)
      const v = pair.slice(idx + 1)
      result[decodeURIComponent(k)] = decodeURIComponent(v)
    }
    return result
  }

  private buildHash(params: Record<string, string>): string {
    const pairs = Object.entries(params)
      .filter(([, v]) => v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    return pairs.length ? `#${pairs.join('&')}` : ''
  }

  private setHashParams(params: Record<string, string>): void {
    this.router.replace({
      path: this.router.currentRoute.value.path,
      query: this.router.currentRoute.value.query,
      hash: this.buildHash(params),
    })
  }

  private readFiltersFromHash(): Record<string, string> {
    const filters: Record<string, string> = {}
    const params = this.parseHash()
    const prefixDash = `${this.prefix}-`
    const sortKey = this.paramName('sort')
    for (const [key, val] of Object.entries(params)) {
      if (key.startsWith(prefixDash) && key !== sortKey && val) {
        filters[key.slice(prefixDash.length)] = val
      }
    }
    return filters
  }

  private readSortFromHash(): SortState | null {
    const v = this.parseHash()[this.paramName('sort')]
    if (!v) return null
    return v.startsWith('-')
      ? { field: v.slice(1), order: 'desc' }
      : { field: v, order: 'asc' }
  }

  getValue(key: string): string | null { return this.core.getFilter(key) }
  setValue(key: string, value: string): void { this.setFilter(key, value) }
  deleteValue(key: string): void { this.clearFilter(key) }
  getAllValues(): Record<string, string> { return this.core.getAllFilters() }

  getFilter(key: string): string | null { return this.core.getFilter(key) }
  getAllFilters(): Record<string, string> { return this.core.getAllFilters() }

  setFilter(key: string, value: string): void {
    this.core.setFilterValue(key, value)
    const params = this.parseHash()
    if (value) {
      params[this.paramName(key)] = value
    } else {
      delete params[this.paramName(key)]
    }
    this.setHashParams(params)
  }

  clearFilter(key: string): void {
    this.core.clearFilterValue(key)
    const params = this.parseHash()
    delete params[this.paramName(key)]
    this.setHashParams(params)
  }

  getSort(): SortState | null { return this.core.getSort() }

  setSort(field: string, order: 'asc' | 'desc'): void {
    this.core.setSortValue(field, order)
    const params = this.parseHash()
    params[this.paramName('sort')] = order === 'desc' ? `-${field}` : field
    this.setHashParams(params)
  }

  clearSort(): void {
    this.core.clearSortValue()
    const params = this.parseHash()
    delete params[this.paramName('sort')]
    this.setHashParams(params)
  }

  clear(): void {
    const params = this.parseHash()
    const prefixDash = `${this.prefix}-`
    for (const key of Object.keys(params)) {
      if (key.startsWith(prefixDash)) delete params[key]
    }
    this.core.clearAllValues()
    this.setHashParams(params)
  }
}

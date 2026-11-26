import { watch } from 'vue'
import type { RouteLocation, RouterLike, SortState } from '../types'
import type { StateCore } from './stateCore'

type CurrentRoute = RouterLike['currentRoute']['value']
type QueryValue = CurrentRoute['query'][string]

const pendingLocations = new WeakMap<RouterLike, RouteLocation>()

export function decodeSafely(text: string): string {
  try {
    return decodeURIComponent(text)
  } catch {
    return text
  }
}

export function routeHash(route: CurrentRoute): string {
  const { fullPath } = route as { fullPath?: unknown }
  if (typeof fullPath !== 'string') return route.hash
  const hashStart = fullPath.indexOf('#')
  return hashStart < 0 ? '' : decodeSafely(fullPath.slice(hashStart))
}

export function latestLocation(router: RouterLike): RouteLocation {
  const pending = pendingLocations.get(router)
  if (pending) return { ...pending, query: { ...pending.query } }
  const route = router.currentRoute.value
  return { path: route.path, query: { ...route.query }, hash: routeHash(route) }
}

export function replaceLocation(router: RouterLike, location: RouteLocation): void {
  pendingLocations.set(router, location)
  const navigation: unknown = router.replace(location)
  Promise.resolve(navigation)
    .finally(() => {
      if (pendingLocations.get(router) === location) pendingLocations.delete(router)
    })
    .catch(() => undefined)
}

export function onExternalRouteChange<T>(
  router: RouterLike,
  select: (route: CurrentRoute) => T,
  sync: () => void,
): void {
  watch(
    () => select(router.currentRoute.value),
    () => { if (!pendingLocations.has(router)) sync() },
    { flush: 'sync' },
  )
}

export function firstQueryValue(value: QueryValue): string | null {
  const first = Array.isArray(value) ? value.find(v => v !== null) : value
  return first ?? null
}

export function parseSort(value: string | null | undefined): SortState | null {
  if (!value) return null
  return value.startsWith('-')
    ? { field: value.slice(1), order: 'desc' }
    : { field: value, order: 'asc' }
}

export function formatSort(field: string, order: 'asc' | 'desc'): string {
  return order === 'desc' ? `-${field}` : field
}

export function applyUrlState(core: StateCore, filters: Record<string, string>, sort: SortState | null): void {
  for (const key of Object.keys(core.state.filters)) {
    if (!(key in filters)) core.clearFilterValue(key)
  }
  for (const [key, value] of Object.entries(filters)) {
    if (core.getFilter(key) !== value) core.setFilterValue(key, value)
  }
  const current = core.getSort()
  if (current?.field === sort?.field && current?.order === sort?.order) return
  if (sort?.order) core.setSortValue(sort.field, sort.order)
  else core.clearSortValue()
}

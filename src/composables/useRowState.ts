import { inject } from 'vue'
import type { RowStateProvider, RowKey } from '../types'
import { rowStateInjectionKey } from '../rowState/injection'
import { InMemoryRowStateProvider } from '../rowState/InMemoryRowStateProvider'

export interface UseRowStateOptions<T> {
  /** Provider override (mainly for tests). In production this is injected. */
  rowStateProvider?: RowStateProvider
  /** Row-key resolver. Falls back to (item) => (item as { id }).id. */
  rowKey?: (item: T) => RowKey | undefined
}

export interface UseRowStateReturn<T> {
  isExpanded(item: T): boolean
  toggleExpanded(item: T): void
  get(item: T, flag: string): unknown
  set(item: T, flag: string, value: unknown): void
  toggle(item: T, flag: string): void
  delete(item: T, flag: string): void
  entries(flag: string): RowKey[]
  clear(flag: string): void
}

const defaultRowKey = <T>(item: T): RowKey | undefined => {
  if (item != null && typeof item === 'object' && 'id' in (item as Record<string, unknown>)) {
    const id = (item as Record<string, unknown>).id
    if (typeof id === 'string' || typeof id === 'number') return id
  }
  return undefined
}

export function useRowState<T = unknown>(options: UseRowStateOptions<T> = {}): UseRowStateReturn<T> {
  const provider: RowStateProvider =
    options.rowStateProvider
    ?? inject(rowStateInjectionKey, undefined as unknown as RowStateProvider)
    ?? new InMemoryRowStateProvider()

  const rowKey = options.rowKey ?? defaultRowKey

  const resolve = (item: T): RowKey | undefined => rowKey(item)

  return {
    isExpanded(item) {
      const k = resolve(item)
      if (k === undefined) return false
      return provider.get(k, 'expanded') === true
    },
    toggleExpanded(item) {
      const k = resolve(item)
      if (k === undefined) return
      provider.toggle(k, 'expanded')
    },
    get(item, flag) {
      const k = resolve(item)
      if (k === undefined) return undefined
      return provider.get(k, flag)
    },
    set(item, flag, value) {
      const k = resolve(item)
      if (k === undefined) return
      provider.set(k, flag, value)
    },
    toggle(item, flag) {
      const k = resolve(item)
      if (k === undefined) return
      provider.toggle(k, flag)
    },
    delete(item, flag) {
      const k = resolve(item)
      if (k === undefined) return
      provider.delete(k, flag)
    },
    entries(flag) { return provider.entries(flag) },
    clear(flag) { provider.clear(flag) },
  }
}

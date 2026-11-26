import { reactive } from 'vue'
import type { RowKey, RowStateProvider } from '../types'

type RowFlags = Record<string, unknown>

export class InMemoryRowStateProvider implements RowStateProvider {
  readonly state: Record<RowKey, RowFlags> = reactive({})
  private readonly originalKeys = reactive(new Map<string, RowKey>())

  get(rowKey: RowKey, flag: string): unknown {
    return this.row(rowKey)?.[flag]
  }

  set(rowKey: RowKey, flag: string, value: unknown): void {
    if (!this.row(rowKey)) this.state[rowKey] = {}
    this.state[rowKey][flag] = value
    this.originalKeys.set(String(rowKey), rowKey)
  }

  toggle(rowKey: RowKey, flag: string): void {
    const current = this.get(rowKey, flag)
    this.set(rowKey, flag, !current)
  }

  delete(rowKey: RowKey, flag: string): void {
    const row = this.row(rowKey)
    if (!row) return
    delete row[flag]
    this.pruneIfEmpty(String(rowKey))
  }

  entries(flag: string): RowKey[] {
    return Object.keys(this.state)
      .filter((key) => this.state[key][flag])
      .map((key) => this.originalKeys.get(key) ?? key)
  }

  clear(flag: string): void {
    for (const key of Object.keys(this.state)) {
      if (flag in this.state[key]) {
        delete this.state[key][flag]
        this.pruneIfEmpty(key)
      }
    }
  }

  private row(rowKey: RowKey): RowFlags | undefined {
    return this.state[rowKey] as RowFlags | undefined
  }

  private pruneIfEmpty(key: string): void {
    if (Object.keys(this.state[key]).length === 0) {
      delete this.state[key]
      this.originalKeys.delete(key)
    }
  }
}

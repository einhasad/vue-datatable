import { reactive } from 'vue'
import type { RowKey, RowStateProvider } from '../types'

type RowFlags = Record<string, unknown>

export class InMemoryRowStateProvider implements RowStateProvider {
  readonly state: Record<RowKey, RowFlags> = reactive({})

  get(rowKey: RowKey, flag: string): unknown {
    return this.state[rowKey]?.[flag]
  }

  set(rowKey: RowKey, flag: string, value: unknown): void {
    if (!this.state[rowKey]) {
      this.state[rowKey] = {}
    }
    this.state[rowKey][flag] = value
  }

  toggle(rowKey: RowKey, flag: string): void {
    const current = this.get(rowKey, flag)
    this.set(rowKey, flag, !current)
  }

  delete(rowKey: RowKey, flag: string): void {
    const row = this.state[rowKey]
    if (!row) return
    delete row[flag]
    if (Object.keys(row).length === 0) {
      delete this.state[rowKey]
    }
  }

  entries(flag: string): RowKey[] {
    const result: RowKey[] = []
    for (const key of Object.keys(this.state)) {
      if (this.state[key][flag]) {
        const numeric = Number(key)
        result.push(Number.isFinite(numeric) && String(numeric) === key ? numeric : key)
      }
    }
    return result
  }

  clear(flag: string): void {
    for (const key of Object.keys(this.state)) {
      if (flag in this.state[key]) {
        delete this.state[key][flag]
        if (Object.keys(this.state[key]).length === 0) {
          delete this.state[key]
        }
      }
    }
  }
}

import { ref } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import type { RouterLike, LoadResult, Column, SortState } from '../src/types'
import { CallbackDataProvider } from '../src/providers/CallbackDataProvider'
import { ArrayDataProvider } from '../src/providers/ArrayDataProvider'
import { Grid } from '../src/index'

export interface TestItem {
  id: number
  name: string
  email: string
  status: string
}

export const sampleItems: TestItem[] = Array.from({ length: 55 }, (_, i) => ({
  id: i + 1,
  name: `Item ${i + 1}`,
  email: `item${i + 1}@test.com`,
  status: i % 2 === 0 ? 'Active' : 'Inactive',
}))

export const defaultColumns: Column<TestItem>[] = [
  { key: 'id', label: 'ID', sort: 'id' },
  { key: 'name', label: 'Name', sort: 'name' },
  { key: 'email', label: 'Email' },
  { key: 'status', label: 'Status' },
]

export function createCallbackProvider(
  items: TestItem[],
  options: { keysetPaginationFn?: any; offsetPaginationFn?: any } = {},
): CallbackDataProvider<TestItem> {
  const capturedItems = ref(items)
  const loadFn = vi.fn(async (): Promise<LoadResult<TestItem>> => {
    return { items: [...capturedItems.value] }
  })
  const provider = new CallbackDataProvider<TestItem>({
    loadFn,
    keysetPaginationFn: options.keysetPaginationFn ?? (() => {}),
    offsetPaginationFn: options.offsetPaginationFn ?? (() => {}),
  })
  provider.setOffsetPagination({ page: 1, pageSize: 20 })
  return provider
}

export function createArrayProvider(
  items: TestItem[],
  options: { pageSize?: number } = {},
): ArrayDataProvider<TestItem> {
  return new ArrayDataProvider<TestItem>({
    items,
    stateProvider: undefined,
  })
}

export function createMockRouter(
  initialQuery: Record<string, string> = {},
  initialHash = '',
): RouterLike {
  const currentRoute = ref({
    path: '/',
    query: { ...initialQuery } as Record<string, string>,
    hash: initialHash,
  })
  return {
    currentRoute,
    replace: vi.fn((location: any) => {
      if (location.query) currentRoute.value.query = { ...location.query }
      if (location.hash !== undefined) currentRoute.value.hash = location.hash
    }),
  }
}

export async function mountGrid(overrides: Record<string, any> = {}) {
  const { dataProvider, columns, ...rest } = overrides
  return mount(Grid as any, {
    props: {
      dataProvider: dataProvider ?? createCallbackProvider(sampleItems.slice(0, 3)),
      columns: columns ?? defaultColumns,
      ...rest,
    },
    ...rest,
  })
}

import {
  CallbackDataProvider,
  QueryParamsStateProvider,
} from '@einhasad-vue/datatable-vue'
import type { DataProvider, LoadOptions, LoadResult, SortState, StateProvider, PaginationInfo, OffsetPaginationState } from '@einhasad-vue/datatable-vue'
import { useRouter } from 'vue-router'

type ApiMethod<T = any> = (query?: Record<string, any>) => Promise<T[]>

export interface ApiDataProvider<T = any> extends DataProvider<T> {
  getStateProvider(): StateProvider
  setSort(field: string, order: 'asc' | 'desc'): void
  setPage(page: number): void
  getPaginationState(): PaginationInfo
}

const sortConfig = {
  setSort: (stateProvider: StateProvider, state: SortState) => {
    if (state.order !== null) {
      stateProvider.setValue('sort', `${state.order === 'desc' ? '-' : ''}${state.field}`)
    } else {
      stateProvider.deleteValue('sort')
    }
  },
  getSort: (stateProvider: StateProvider): SortState | null => {
    const sort = stateProvider.getValue('sort')
    if (!sort) return null
    const order = sort.startsWith('-') ? 'desc' as const : 'asc' as const
    const field = order === 'desc' ? sort.slice(1) : sort
    return { field, order }
  },
}

class CallbackApiDataProvider<T = any> implements ApiDataProvider<T> {
  private provider: CallbackDataProvider<T>
  private stateProvider: StateProvider
  private pageParam: string
  private pageSize: number

  constructor(provider: CallbackDataProvider<T>, stateProvider: StateProvider, pageParam: string, pageSize: number) {
    this.provider = provider
    this.stateProvider = stateProvider
    this.pageParam = pageParam
    this.pageSize = pageSize
  }

  async load(options?: LoadOptions): Promise<LoadResult<T>> {
    return this.provider.load(options)
  }

  async refresh(): Promise<LoadResult<T>> {
    return this.provider.refresh()
  }

  isLoading(): boolean {
    return this.provider.isLoading()
  }

  getCurrentItems(): T[] {
    return this.provider.getCurrentItems()
  }

  getStateProvider(): StateProvider {
    return this.stateProvider
  }

  setSort(field: string, order: 'asc' | 'desc'): void {
    sortConfig.setSort(this.stateProvider, { field, order })
    this.stateProvider.setValue(this.pageParam, '1')
    this.provider.setSort({ field, order })
  }

  setPage(page: number): void {
    this.stateProvider.setValue(this.pageParam, String(page))
    this.provider.setOffsetPagination({ page, pageSize: this.pageSize })
  }

  getPaginationState(): PaginationInfo {
    const offset = this.provider.getOffsetPagination()
    if (offset) {
      return {
        currentPage: offset.page,
        pageSize: offset.pageSize,
        totalPages: offset.totalPages ?? 1,
        totalItems: offset.totalItems ?? 0,
      }
    }
    const items = this.provider.getCurrentItems()
    return {
      currentPage: Number(this.stateProvider.getValue(this.pageParam)) || 1,
      pageSize: this.pageSize,
      totalPages: Math.ceil(items.length / this.pageSize) || 1,
      totalItems: items.length,
    }
  }

  // Delegate keyset/offset pagination to inner provider
  setKeysetPagination(state: any): void { this.provider.setKeysetPagination(state) }
  getKeysetPagination() { return this.provider.getKeysetPagination() }
  setOffsetPagination(state: OffsetPaginationState): void { this.provider.setOffsetPagination(state) }
  getOffsetPagination() { return this.provider.getOffsetPagination() }
}

export function exampleProvider<T = any>(config: {
  method: ApiMethod<T>
  params?: Record<string, string|number>
  prefix?: string
}): ApiDataProvider<T> {
  const router = useRouter()

  const stateProvider = new QueryParamsStateProvider({
    router,
    prefix: config.prefix ?? '_search',
  })

  const pageSize = 20

  const provider = new CallbackDataProvider<T>({
    loadFn: async (options: LoadOptions) => {
      const sortState = sortConfig.getSort(stateProvider)
      const sortParam = sortState ? `${sortState.order === 'desc' ? '-' : ''}${sortState.field}` : undefined
      const page = Number(stateProvider.getValue('page')) || 1

      const params: Record<string, string> = {
        ...(sortParam ? { sort: sortParam } : {}),
        page: String(page),
        per_page: String(pageSize),
        ...Object.fromEntries(
          Object.entries(config.params ?? {}).map(([k, v]) => [k, String(v)])
        ),
      }

      const items = await config.method(params)
      return { items }
    },
    sortFn: (sort: SortState) => {
      sortConfig.setSort(stateProvider, sort)
    },
    offsetPaginationFn: (state: OffsetPaginationState) => {
      stateProvider.setValue('page', String(state.page))
    },
  })

  const result = new CallbackApiDataProvider<T>(provider, stateProvider, 'page', pageSize)
  result.load()
  return result
}

import { ref, computed, watch, onMounted, type ComputedRef, type Ref } from 'vue'
import type {
  DataProvider,
  LoadResult,
  SortState,
  SortOrder,
  PaginationInfo,
  OffsetPaginationState
} from '../types'
import type { StateProvider } from '../state/StateProvider'

interface UseGridStateOptions<T> {
  dataProvider: DataProvider<T>
  stateProvider: ComputedRef<StateProvider | undefined>
  autoLoad: boolean
  emit: {
    (e: 'loaded'): void
    (e: 'error', error: Error): void
  }
}

interface UseGridStateReturn<T> {
  items: ComputedRef<T[]>
  loading: ComputedRef<boolean>
  sortState: Ref<SortState | null>
  paginationState: ComputedRef<PaginationInfo | null>
  handleSort: (field: string, order: SortOrder) => void
  handleSetPage: (page: number) => Promise<void>
  refresh: () => Promise<LoadResult<T>>
}

function toPaginationInfo(offset: OffsetPaginationState): PaginationInfo {
  return {
    currentPage: offset.page,
    totalPages: offset.totalPages ?? Math.ceil((offset.totalItems ?? 0) / offset.pageSize),
    totalItems: offset.totalItems ?? 0,
    pageSize: offset.pageSize,
  }
}

function safeGetOffsetPagination<T>(dp: DataProvider<T>): OffsetPaginationState | null {
  try { return dp.getOffsetPagination() } catch { return null }
}

export function useGridState<T>(options: UseGridStateOptions<T>): UseGridStateReturn<T> {
  const { dataProvider, stateProvider, emit } = options

  // Reactive from provider — auto-updates on ANY dataProvider.refresh() call
  const items = computed(() => dataProvider.getCurrentItems())
  const loading = computed(() => dataProvider.isLoading())

  // Initialized from provider so first render sees the configured state
  const sortState = ref<SortState | null>(dataProvider.getSort())
  // Reactive read-through of the provider's offset pagination. Providers
  // (e.g. CallbackDataProvider) keep their offsetState in a Ref, so this
  // computed re-evaluates whenever the provider mutates pagination — including
  // mutations performed inside loadFn during an external dataProvider.refresh().
  const rawPagination = computed<OffsetPaginationState | null>(() => safeGetOffsetPagination(dataProvider))

  const paginationState = computed<PaginationInfo | null>(() => {
    const offset = rawPagination.value
    return offset ? toPaginationInfo(offset) : null
  })

  async function refresh(): Promise<LoadResult<T>> {
    try {
      const result = await dataProvider.refresh()
      // sortState is held locally; sync after refresh in case the provider's
      // sort state changed under us. paginationState is a computed and updates
      // automatically.
      sortState.value = dataProvider.getSort()
      emit('loaded')
      return result
    } catch (error) {
      emit('error', error as Error)
      throw error
    }
  }

  function handleSort(field: string, order: SortOrder): void {
    if (order) {
      sortState.value = { field, order }
      dataProvider.setSort({ field, order })
      stateProvider.value?.setSort(field, order)
    } else {
      sortState.value = null
      dataProvider.setSort({ field, order: null })
      stateProvider.value?.clearSort()
    }
    const current = safeGetOffsetPagination(dataProvider)
    if (current && current.page !== 1) {
      dataProvider.setOffsetPagination({ ...current, page: 1 })
      stateProvider.value?.setValue('page', '1')
    }
    refresh().catch(() => {})
  }

  async function handleSetPage(page: number): Promise<void> {
    const current = safeGetOffsetPagination(dataProvider)
    if (current) {
      dataProvider.setOffsetPagination({ ...current, page })
    }
    stateProvider.value?.setValue('page', String(page))
    await refresh()
  }

  onMounted(() => {
    if (options.autoLoad) {
      refresh().catch(() => {})
    }
  })

  watch(
    () => {
      const filters = stateProvider.value?.state.filters
      if (!filters) return undefined
      const { page: _, ...rest } = filters
      return JSON.stringify(rest)
    },
    () => {
      // When a filter changes, snap back to page 1 — landing on page N of a freshly
      // filtered (often smaller) result set is confusing UX. Also clear the page
      // entry from the state provider so it doesn't linger in the URL.
      const current = safeGetOffsetPagination(dataProvider)
      if (current && current.page !== 1) {
        dataProvider.setOffsetPagination({ ...current, page: 1 })
        stateProvider.value?.setValue('page', '1')
      }
      refresh().catch(() => {})
    }
  )

  return { items, loading, sortState, paginationState, handleSort, handleSetPage, refresh }
}

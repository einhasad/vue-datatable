import { ref, computed, watch, onMounted, type ComputedRef } from 'vue'
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
  sortState: ComputedRef<SortState | null>
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

function sortKey(sort: SortState | null | undefined): string {
  return sort?.order ? `${sort.field}:${sort.order}` : ''
}

function safeGetOffsetPagination<T>(dp: DataProvider<T>): OffsetPaginationState | null {
  try { return dp.getOffsetPagination() } catch { return null }
}

export function useGridState<T>(options: UseGridStateOptions<T>): UseGridStateReturn<T> {
  const { dataProvider, stateProvider, emit } = options

  const items = computed(() => dataProvider.getCurrentItems())
  const loading = computed(() => dataProvider.isLoading())

  const sortVersion = ref(0)
  const sortState = computed<SortState | null>(() => {
    void sortVersion.value
    const sort = dataProvider.getSort()
    return sort ? { ...sort } : null
  })

  const restoredSort = stateProvider.value?.getSort()
  if (restoredSort && sortKey(restoredSort) !== sortKey(dataProvider.getSort())) {
    dataProvider.setSort({ ...restoredSort })
  }
  let appliedSortKey = sortKey(stateProvider.value?.getSort())

  const rawPagination = computed<OffsetPaginationState | null>(() => safeGetOffsetPagination(dataProvider))

  const paginationState = computed<PaginationInfo | null>(() => {
    const offset = rawPagination.value
    return offset ? toPaginationInfo(offset) : null
  })

  async function refresh(): Promise<LoadResult<T>> {
    try {
      const result = await dataProvider.refresh()
      sortVersion.value++
      emit('loaded')
      return result
    } catch (error) {
      emit('error', error as Error)
      throw error
    }
  }

  function handleSort(field: string, order: SortOrder): void {
    dataProvider.setSort({ field, order })
    if (order) {
      stateProvider.value?.setSort(field, order)
    } else {
      stateProvider.value?.clearSort()
    }
    appliedSortKey = sortKey({ field, order })
    sortVersion.value++
    resetToFirstPage()
    refresh().catch(() => {})
  }

  function resetToFirstPage(): void {
    const current = safeGetOffsetPagination(dataProvider)
    if (current && current.page !== 1) {
      dataProvider.setOffsetPagination({ ...current, page: 1 })
      stateProvider.value?.setValue('page', '1')
    }
  }

  function applyStateSort(sort: SortState | null): void {
    appliedSortKey = sortKey(sort)
    if (appliedSortKey !== sortKey(dataProvider.getSort())) {
      dataProvider.setSort(sort ? { ...sort } : { field: dataProvider.getSort()?.field ?? '', order: null })
    }
    sortVersion.value++
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
      const state = stateProvider.value?.state
      if (!state) return undefined
      const { page: _, ...filters } = state.filters
      return { filtersKey: JSON.stringify(filters), sort: state.sort }
    },
    (current, previous) => {
      const filtersChanged = current?.filtersKey !== previous?.filtersKey
      const sortChanged = sortKey(current?.sort) !== appliedSortKey
      if (sortChanged) applyStateSort(current?.sort ?? null)
      if (filtersChanged || sortChanged) {
        resetToFirstPage()
        refresh().catch(() => {})
      }
    }
  )

  return { items, loading, sortState, paginationState, handleSort, handleSetPage, refresh }
}

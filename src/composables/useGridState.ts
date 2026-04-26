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

export function useGridState<T>(options: UseGridStateOptions<T>) {
  const { dataProvider, stateProvider, emit } = options

  // Reactive from provider — auto-updates on ANY dataProvider.refresh() call
  const items = computed(() => dataProvider.getCurrentItems())
  const loading = computed(() => dataProvider.isLoading())

  // Initialized from provider so first render sees the configured state
  const sortState = ref<SortState | null>(dataProvider.getSort())
  const rawPagination = ref<OffsetPaginationState | null>(safeGetOffsetPagination(dataProvider))

  const paginationState = computed<PaginationInfo | null>(() => {
    const offset = rawPagination.value
    return offset ? toPaginationInfo(offset) : null
  })

  function syncFromProvider(): void {
    sortState.value = dataProvider.getSort()
    rawPagination.value = safeGetOffsetPagination(dataProvider)
  }

  async function refresh(): Promise<LoadResult<T>> {
    try {
      const result = await dataProvider.refresh()
      syncFromProvider()
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
      rawPagination.value = safeGetOffsetPagination(dataProvider)
      stateProvider.value?.setValue('page', '1')
    }
    refresh().catch(() => {})
  }

  async function handleSetPage(page: number): Promise<void> {
    const current = safeGetOffsetPagination(dataProvider)
    if (current) {
      dataProvider.setOffsetPagination({ ...current, page })
      rawPagination.value = safeGetOffsetPagination(dataProvider)
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
      const filters = stateProvider.value?.state?.filters
      if (!filters) return undefined
      const { page: _, ...rest } = filters
      return JSON.stringify(rest)
    },
    () => {
      refresh().catch(() => {})
    }
  )

  return { items, loading, sortState, paginationState, handleSort, handleSetPage, refresh }
}

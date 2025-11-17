<template>
  <div
    class="grid"
    data-qa="grid"
  >
    <slot
      name="toolbar"
      :refresh="refresh"
      :loading="loading"
    />

    <slot
      name="search"
      :provider="dataProvider"
      :refresh="refresh"
      :loading="loading"
    />

    <slot
      name="table"
      :items="items"
      :loading="loading"
      :columns="columns"
      :row-options="rowOptions"
      :on-row-click="onRowClick"
      :on-sort="handleSort"
      :sort-state="sortState"
    >
      <GridTable
        :columns="columns"
        :items="items"
        :loading="loading"
        :show-loader="showLoader"
        :show-footer="showFooter"
        :empty-text="emptyText"
        :row-options="rowOptions"
        :on-row-click="onRowClick"
        :on-sort="handleSort"
        :sort-state="sortState"
        :row-key-field="rowKeyField"
      >
        <template
          v-if="$slots.filters"
          #filters
        >
          <slot
            name="filters"
            :provider="dataProvider"
          />
        </template>

        <template
          v-if="$slots.row"
          #row="{ items }"
        >
          <slot
            name="row"
            :items="items"
          />
        </template>

        <template
          v-if="$slots.empty"
          #empty
        >
          <slot name="empty" />
        </template>

        <template
          v-if="$slots.loader"
          #loader
        >
          <slot name="loader" />
        </template>
      </GridTable>
    </slot>

    <slot
      name="pagination"
      :pagination-instance="paginationInstance"
      :pagination="pagination"
      :has-more="hasMore"
      :loading="loading"
      :load-more="loadMore"
      :set-page="setPage"
      :mode="paginationMode"
    >
      <!-- Default pagination slot - users should provide their own pagination component -->
      <!-- Examples: <LoadModePagination>, <PagePagination>, <ScrollPagination> -->
    </slot>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { DataProvider, Column, RowOptions, PaginationData, SortState, PaginationMode, Pagination } from './types'
import GridTable from './GridTable.vue'

const props = withDefaults(defineProps<{
  dataProvider: DataProvider<unknown>
  columns: Column<unknown>[]
  rowOptions?: (model: unknown) => RowOptions
  onRowClick?: (model: unknown) => void
  showLoader?: boolean
  showFooter?: boolean
  emptyText?: string
  autoLoad?: boolean
  rowKeyField?: string
  showPaginationSummary?: boolean
  hidePrevNextOnEdge?: boolean
  maxVisiblePages?: number
}>(), {
  showLoader: true,
  showFooter: true,
  emptyText: 'No results found',
  autoLoad: true,
  rowKeyField: 'id',
  showPaginationSummary: true,
  hidePrevNextOnEdge: true,
  maxVisiblePages: 5
})

const emit = defineEmits<{
  loaded: [items: unknown[]]
  error: [error: Error]
}>()

const items = ref<unknown[]>([])
const loading = ref(false)
const pagination = ref<PaginationData | null>(null)

const paginationInstance = computed<Pagination | null>(() => {
  return props.dataProvider.getPagination()
})

/**
 * @deprecated paginationMode is deprecated - use paginationInstance instead
 */
const paginationMode = computed<PaginationMode>(() => {
  return props.dataProvider.config.paginationMode || 'cursor'
})

/**
 * @deprecated hasMore is deprecated - use paginationInstance.hasMore() instead
 */
const hasMore = computed(() => {
  return props.dataProvider.hasMore?.() || false
})

const sortState = computed<SortState | null>(() => {
  return props.dataProvider.getSort()
})

async function loadData() {
  loading.value = true
  try {
    const result = await props.dataProvider.load()
    items.value = result.items
    pagination.value = result.pagination || null
    emit('loaded', result.items)
  } catch (error) {
    emit('error', error as Error)
    throw error
  } finally {
    loading.value = false
  }
}

async function loadMore() {
  if (!hasMore.value || loading.value) {
    return
  }

  // Use new pagination interface if available
  if (paginationInstance.value) {
    loading.value = true
    try {
      await paginationInstance.value.loadMore()
      items.value = props.dataProvider.getCurrentItems()
      // Refresh pagination data from provider (for backward compatibility)
      const currentPagination = props.dataProvider.getCurrentPagination?.()
      pagination.value = currentPagination || null
      emit('loaded', items.value)
    } catch (error) {
      emit('error', error as Error)
      throw error
    } finally {
      loading.value = false
    }
    return
  }

  // Fallback to legacy loadMore method
  if (props.dataProvider.loadMore) {
    loading.value = true
    try {
      const result = await props.dataProvider.loadMore()
      items.value = result.items
      pagination.value = result.pagination || null
      emit('loaded', result.items)
    } catch (error) {
      emit('error', error as Error)
      throw error
    } finally {
      loading.value = false
    }
  }
}

// Note: Do NOT provide context here - the wrapper Grid.vue handles that
// Providing here would overwrite the wrapper's provide and break functionality

async function refresh() {
  loading.value = true
  try {
    const result = await props.dataProvider.refresh()
    items.value = result.items
    pagination.value = result.pagination || null
    emit('loaded', result.items)
  } catch (error) {
    emit('error', error as Error)
    throw error
  } finally {
    loading.value = false
  }
}

async function setPage(page: number) {
  // Use new pagination interface if available
  if (paginationInstance.value && paginationInstance.value.setPage) {
    loading.value = true
    try {
      await paginationInstance.value.setPage(page)
      items.value = props.dataProvider.getCurrentItems()
      // Refresh pagination data from provider (for backward compatibility)
      const currentPagination = props.dataProvider.getCurrentPagination?.()
      pagination.value = currentPagination || null
      emit('loaded', items.value)
    } catch (error) {
      emit('error', error as Error)
      throw error
    } finally {
      loading.value = false
    }
    return
  }

  // Fallback to legacy setPage method
  if (paginationMode.value !== 'page') {
    console.warn('setPage() is only available for page-based pagination')
    return
  }

  if (!props.dataProvider.setPage) {
    console.warn('DataProvider does not support setPage()')
    return
  }

  loading.value = true
  try {
    const result = await props.dataProvider.setPage(page)
    items.value = result.items
    pagination.value = result.pagination || null
    emit('loaded', result.items)
  } catch (error) {
    emit('error', error as Error)
    throw error
  } finally {
    loading.value = false
  }
}

async function handleSort(field: string, order: 'asc' | 'desc') {
  props.dataProvider.setSort(field, order)
  await refresh()
}

onMounted(async () => {
  if (props.autoLoad) {
    await loadData()
  }
})

// Note: Do NOT provide context here - the wrapper Grid.vue handles that
// If we provide here, it overwrites the wrapper's provide

defineExpose({
  loadData,
  loadMore,
  refresh,
  setPage,
  items,
  loading,
  pagination
})
</script>

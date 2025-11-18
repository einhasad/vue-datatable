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
      :pagination="paginationInterface"
      :loading="loading"
      :load-more="loadMore"
      :set-page="setPage"
      :provider="dataProvider"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { DataProvider, Column, RowOptions, Pagination, SortState } from './types'
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

const paginationInterface = computed<Pagination | null>(() => {
  return props.dataProvider.getPagination()
})

const sortState = computed<SortState | null>(() => {
  return props.dataProvider.getSort()
})

async function loadData() {
  loading.value = true
  try {
    const result = await props.dataProvider.load()
    items.value = result.items
    emit('loaded', result.items)
  } catch (error) {
    emit('error', error as Error)
    throw error
  } finally {
    loading.value = false
  }
}

async function loadMore() {
  if (loading.value) {
    return
  }

  loading.value = true
  try {
    const result = await props.dataProvider.loadMore()
    items.value = result.items
    emit('loaded', result.items)
  } catch (error) {
    emit('error', error as Error)
    throw error
  } finally {
    loading.value = false
  }
}

async function refresh() {
  loading.value = true
  try {
    const result = await props.dataProvider.refresh()
    items.value = result.items
    emit('loaded', result.items)
  } catch (error) {
    emit('error', error as Error)
    throw error
  } finally {
    loading.value = false
  }
}

async function setPage(page: number) {
  if (!props.dataProvider.setPage) {
    console.warn('DataProvider does not support setPage()')
    return
  }

  loading.value = true
  try {
    const result = await props.dataProvider.setPage(page)
    items.value = result.items
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
  loading
})
</script>

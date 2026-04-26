<template>
  <div
    class="grid"
    data-qa="grid"
    :aria-busy="loading"
  >
    <slot
      name="search"
      :provider="dataProvider"
      :loading="loading"
    />

    <slot
      name="table"
      :items="items"
      :loading="loading"
      :columns="columns"
      :row-options="rowOptions"
      :on-row-click="props.onRowClick"
      :on-sort="handleSort"
      :sort-state="sortState"
    >
      <GridTable
        :columns="columns"
        :items="items"
        :state-provider="stateProvider"
        :loading="loading"
        :show-loader="showLoader"
        :show-footer="showFooter"
        :empty-text="emptyText"
        :row-options="rowOptions"
        :on-row-click="props.onRowClick"
        :row-key-field="rowKeyField"
        :sort-state="sortState"
        :on-sort="handleSort"
      >
        <template
          v-if="$slots.searchRow"
          #searchRow="slotProps"
        >
          <slot
            name="searchRow"
            v-bind="slotProps"
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
      v-if="paginationState"
      name="pagination"
      :pagination="paginationState"
      :set-page="handleSetPage"
    />
  </div>
</template>

<script setup lang="ts" generic="T">
import { computed } from 'vue'
import type { Column, RowOptions, SortState, SortOrder, PaginationInfo, DataProvider } from './types'
import type { StateProvider } from './state'
import GridTable from './GridTable.vue'
import { useGridState } from './composables/useGridState'

const props = withDefaults(defineProps<{
  dataProvider: DataProvider<T>
  columns: Column<T>[]
  rowOptions?: (model: T) => RowOptions
  onRowClick?: (model: T) => void
  showLoader?: boolean
  showFooter?: boolean
  emptyText?: string
  autoLoad?: boolean
  rowKeyField?: string
}>(), {
  showLoader: true,
  showFooter: true,
  emptyText: 'No results found',
  autoLoad: true,
  rowKeyField: 'id'
})

const emit = defineEmits<{
  loaded: []
  error: [error: Error]
}>()

defineSlots<{
  toolbar?: (props: { loading: boolean }) => void
  search?: (props: { provider: DataProvider<T>, loading: boolean }) => void
  table?: (props: { items: T[], loading: boolean, columns: Column<T>[], rowOptions: ((model: T) => RowOptions) | undefined, onRowClick: ((model: T) => void) | undefined, onSort: (field: string, order: SortOrder) => void, sortState: SortState | null }) => void
  searchRow?: (props: { columns: Column<T>[], stateProvider: StateProvider | undefined }) => void
  row?: (props: { items: T[] }) => void
  empty?: () => void
  loader?: () => void
  pagination?: (props: { pagination: PaginationInfo, setPage: (page: number) => Promise<void> }) => void
}>()

const stateProvider = computed<StateProvider | undefined>(() => {
  return props.dataProvider.getStateProvider?.('default') ?? undefined
})

const { items, loading, sortState, paginationState, handleSort, handleSetPage } = useGridState<T>({
  dataProvider: props.dataProvider,
  stateProvider,
  autoLoad: props.autoLoad,
  emit,
})

defineExpose({
  items,
  loading,
})
</script>

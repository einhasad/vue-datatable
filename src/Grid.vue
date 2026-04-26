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
        :resolve-row-key="resolveRowKey"
        :resolve-children="resolveChildren"
        :row-state-provider="rowStateProvider"
        @expand="(item, ctx) => emit('expand', item, ctx)"
        @collapse="(item, ctx) => emit('collapse', item, ctx)"
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
          #row="{ items: rowItems }"
        >
          <slot
            name="row"
            :items="rowItems"
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
import { computed, provide } from 'vue'
import type { Column, RowOptions, SortState, SortOrder, PaginationInfo, DataProvider, RowKey, RowStateProvider } from './types'
import type { StateProvider } from './state'
import GridTable from './GridTable.vue'
import { useGridState } from './composables/useGridState'
import { rowStateInjectionKey } from './rowState/injection'
import { InMemoryRowStateProvider } from './rowState/InMemoryRowStateProvider'

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
  /** Row identity resolver used by RowStateProvider. Falls back to item[rowKeyField]. */
  rowKey?: (item: T) => RowKey | undefined
  /** Where to find a row's nested children (string field name or accessor). Default 'children'. */
  childrenField?: string | ((item: T) => T[] | undefined)
  /** RowStateProvider instance. Defaults to a fresh InMemoryRowStateProvider per Grid. */
  rowStateProvider?: RowStateProvider
}>(), {
  showLoader: true,
  showFooter: true,
  emptyText: 'No results found',
  autoLoad: true,
  rowKeyField: 'id',
  childrenField: 'children',
})

const emit = defineEmits<{
  loaded: []
  error: [error: Error]
  expand: [item: T, ctx: { depth: number; rowKey: RowKey }]
  collapse: [item: T, ctx: { depth: number; rowKey: RowKey }]
}>()

const rowStateProvider = props.rowStateProvider ?? new InMemoryRowStateProvider()
provide(rowStateInjectionKey, rowStateProvider)

const resolveRowKey = computed<(item: T) => RowKey | undefined>(() => {
  if (props.rowKey) return props.rowKey
  const field = props.rowKeyField ?? 'id'
  return (item: T) => {
    if (item != null && typeof item === 'object') {
      const v = (item as Record<string, unknown>)[field]
      if (typeof v === 'string' || typeof v === 'number') return v
    }
    return undefined
  }
})

const resolveChildren = computed<(item: T) => T[] | undefined>(() => {
  const cf = props.childrenField
  if (typeof cf === 'function') return cf
  return (item: T) => {
    if (item != null && typeof item === 'object') {
      const v = (item as Record<string, unknown>)[cf]
      if (Array.isArray(v)) return v as T[]
    }
    return undefined
  }
})

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
  return props.dataProvider.getStateProvider('default') ?? undefined
})

const { items, loading, sortState, paginationState, handleSort, handleSetPage } = useGridState<T>({
  dataProvider: props.dataProvider,
  stateProvider,
  autoLoad: props.autoLoad,
  emit,
})
</script>

<template>
  <div class="grid-table-wrapper">
    <table class="grid-table">
      <thead>
        <tr class="grid-header-row">
          <th
            v-for="(column, colIndex) in visibleColumns"
            :key="column.sort || colIndex"
            class="grid-header-cell"
          >
            <slot
              name="headerCell"
              :column="column"
              :col-index="colIndex"
              :sort-state="sortState"
              :on-sort="onSort"
            >
              <GridColumnHeader
                :column="column"
                :sort-state="sortState"
                @sort="onSortSortState"
              />
            </slot>
          </th>
        </tr>
      </thead>

      <tbody>
        <slot
          name="searchRow"
          :columns="visibleColumns"
          :state-provider="props.stateProvider"
        >
          <GridSearch
            v-if="props.stateProvider && hasFilterColumns"
            :columns="columns"
            :state-provider="props.stateProvider"
            @filter-change="emit('filterChange')"
          />
        </slot>
        <template v-if="loading && showLoader">
          <tr
            class="grid-loading-row"
            data-qa="grid-loading"
          >
            <td
              :colspan="visibleColumns.length"
              class="grid-loading-cell"
            >
              <div class="grid-loader">
                <slot name="loader">
                  <span>Loading...</span>
                </slot>
              </div>
            </td>
          </tr>
        </template>
        <template v-else>
          <slot
            name="row"
            :items="items"
          >
            <template
              v-for="row in flatRows"
              :key="row.key"
            >
              <tr
                :data-qa="'row-' + row.flatIndex"
                :data-row-key="row.key"
                :data-depth="row.depth"
                class="grid-row"
                v-bind="buildAttributes(getRowOptions(rowOptions, row.item))"
                @click="handleRowClick(row.item)"
              >
                <td
                  v-for="(column, colIndex) in visibleColumns"
                  :key="column.sort || colIndex"
                  class="grid-cell"
                  v-bind="buildAttributes(getCellOptions(column, row.item))"
                  @click="column.action && column.action(row.item)"
                >
                  <template v-if="shouldShowCell(column, row.item)">
                    <ChevronIndent
                      v-if="column.expandToggle && isExpandableItem(row.item)"
                      :depth="row.depth"
                      :expanded="isExpandedItem(row.item)"
                      @toggle="onToggle(row.item, row.depth)"
                    />
                    <DynamicComponent
                      v-if="getCellComponent(column, row.item, 0, buildRowContext(row.item, row.depth))"
                      :options="getCellComponent(column, row.item, 0, buildRowContext(row.item, row.depth))!"
                    />
                    <span
                      v-else
                      v-html="getCellValue(column, row.item, 0)"
                    />
                  </template>
                </td>
              </tr>
              <tr
                v-if="$slots.expandedRow && isExpandedItem(row.item) && resolveRowKeyFn(row.item) !== undefined"
                :key="row.key + ':expanded'"
                :data-row-key="row.key"
                :data-depth="row.depth"
                class="grid-expanded-row"
              >
                <td
                  :colspan="visibleColumns.length"
                  class="grid-expanded-cell"
                >
                  <slot
                    name="expandedRow"
                    :item="row.item"
                    :depth="row.depth"
                    :row-key="resolveRowKeyFn(row.item)!"
                    :toggle="() => onToggle(row.item, row.depth)"
                  />
                </td>
              </tr>
            </template>
          </slot>

          <tr
            v-if="items.length === 0"
            class="grid-empty-row"
          >
            <td
              :colspan="visibleColumns.length"
              class="grid-empty-cell"
            >
              <slot name="empty">
                {{ emptyText }}
              </slot>
            </td>
          </tr>

          <tr
            v-if="showFooter && hasFooter"
            class="grid-footer-row"
          >
            <td
              v-for="(column, colIndex) in visibleColumns"
              :key="column.sort || colIndex"
              class="grid-footer-cell"
              v-bind="buildAttributes(getFooterOptions(column, items))"
            >
              <span v-html="getFooterContent(column, items)" />
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts" generic="T">
import { computed, watch } from 'vue'
import type { Column, RowOptions, SortOrder, SortState, RowKey, RowStateProvider, RowContext } from './types'
import type { StateProvider } from './state/StateProvider'
import {
  getCellValue,
  shouldShowColumn,
  shouldShowCell,
  getCellComponent,
  getCellOptions,
  getRowOptions,
  getFooterContent,
  getFooterOptions,
  buildAttributes
} from './utils'
import DynamicComponent from './DynamicComponent.vue'
import GridColumnHeader from './GridColumnHeader.vue'
import GridSearch from './GridSearch.vue'
import ChevronIndent from './ChevronIndent.vue'
import { InMemoryRowStateProvider } from './rowState/InMemoryRowStateProvider'


const props = withDefaults(defineProps<{
  columns: Column<T>[]
  items: T[]
  stateProvider?: StateProvider
  loading?: boolean
  showLoader?: boolean
  showFooter?: boolean
  emptyText?: string
  rowOptions?: (model: T) => RowOptions
  onRowClick?: (model: T) => void
  onSort?: (field: string, order: SortOrder) => void
  sortState?: SortState | null
  rowKeyField?: string
  resolveRowKey?: (item: T) => RowKey | undefined
  resolveChildren?: (item: T) => T[] | undefined
  rowStateProvider?: RowStateProvider
}>(), {
  loading: false,
  showLoader: true,
  showFooter: true,
  emptyText: 'No results found',
  rowKeyField: 'id'
})

const emit = defineEmits<{
  filterChange: []
  expand: [item: T, ctx: { depth: number; rowKey: RowKey }]
  collapse: [item: T, ctx: { depth: number; rowKey: RowKey }]
}>()

const fallbackRowKey = (item: T): RowKey | undefined => {
  if (item != null && typeof item === 'object') {
    const v = (item as Record<string, unknown>)[props.rowKeyField ?? 'id']
    if (typeof v === 'string' || typeof v === 'number') return v
  }
  return undefined
}

const fallbackChildren = (_item: T): T[] | undefined => undefined

const resolveRowKeyFn = computed(() => props.resolveRowKey ?? fallbackRowKey)
const resolveChildrenFn = computed(() => props.resolveChildren ?? fallbackChildren)
const rowStateProviderEffective = computed(() => props.rowStateProvider ?? new InMemoryRowStateProvider())

function isExpandableItem(_item: T): boolean {
  return Boolean(props.resolveChildren)
}

function isExpandedItem(item: T): boolean {
  const k = resolveRowKeyFn.value(item)
  if (k === undefined) return false
  return rowStateProviderEffective.value.get(k, 'expanded') === true
}

function buildRowContext(item: T, depth: number): RowContext | undefined {
  const k = resolveRowKeyFn.value(item)
  if (k === undefined) return undefined
  const provider = rowStateProviderEffective.value
  return {
    depth,
    rowKey: k,
    isExpanded: provider.get(k, 'expanded') === true,
    isExpandable: isExpandableItem(item),
    toggle: () => onToggle(item, depth),
    rowState: {
      get: (flag) => provider.get(k, flag),
      set: (flag, value) => provider.set(k, flag, value),
      toggle: (flag) => provider.toggle(k, flag),
      delete: (flag) => provider.delete(k, flag),
    },
  }
}

function onToggle(item: T, depth: number): void {
  const k = resolveRowKeyFn.value(item)
  if (k === undefined) return
  const provider = rowStateProviderEffective.value
  const wasExpanded = provider.get(k, 'expanded') === true
  provider.toggle(k, 'expanded')
  const ctx = { depth, rowKey: k }
  if (wasExpanded) {
    emit('collapse', item, ctx)
  } else {
    emit('expand', item, ctx)
  }
}

let undefinedRowKeyWarned = false

function warnUndefinedRowKey(): void {
  if (undefinedRowKeyWarned) return
  undefinedRowKeyWarned = true
  // eslint-disable-next-line no-console
  console.warn(
    '[grid] rowKey returned undefined for an item — row-state features (expansion, selection, etc.) ' +
    "won't persist across pagination/filter. Provide :row-key=\"(item) => item.someId\"."
  )
}

interface FlatRow { item: T; depth: number; key: string; flatIndex: number }

const flatRows = computed<FlatRow[]>(() => {
  const out: FlatRow[] = []
  let flat = 0
  const walk = (items: readonly T[], depth: number, prefix: string) => {
    items.forEach((item, idx) => {
      const k = resolveRowKeyFn.value(item)
      if (k === undefined && (import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV !== false) warnUndefinedRowKey()
      const key = `${prefix}${k ?? `__idx_${idx}`}`
      out.push({ item, depth, key, flatIndex: flat++ })
      if (isExpandedItem(item)) {
        const children = resolveChildrenFn.value(item)
        if (children && children.length) walk(children, depth + 1, `${key}/`)
      }
    })
  }
  walk(props.items, 0, '')
  return out
})

watch(
  () => props.items,
  (newItems) => {
    for (const item of newItems) {
      if (!isExpandedItem(item)) continue
      const children = resolveChildrenFn.value(item)
      if (children && children.length > 0) continue
      const k = resolveRowKeyFn.value(item)
      if (k === undefined) continue
      emit('expand', item, { depth: 0, rowKey: k })
    }
  },
  { immediate: true, flush: 'post' }
)


const visibleColumns = computed(() => {
  return props.columns.filter(column => shouldShowColumn(column))
})

const hasFooter = computed(() => {
  return visibleColumns.value.some(column => column.footer)
})

const hasFilterColumns = computed(() => {
  return visibleColumns.value.some(column => column.filter)
})

function handleRowClick(item: T): void {
  if (props.onRowClick) {
    props.onRowClick(item)
  }
}

function onSortSortState(newSort: SortState): void {
  if (props.onSort) {
    props.onSort(newSort.field, newSort.order)
  }
}
</script>

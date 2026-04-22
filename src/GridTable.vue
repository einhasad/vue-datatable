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
            <tr
              v-for="(item, rowIndex) in items"
              :key="getRowKey(item, rowIndex)"
              :data-qa="'row-' + rowIndex"
              class="grid-row"
              v-bind="buildAttributes(getRowOptions(rowOptions, item))"
              @click="handleRowClick(item)"
            >
              <td
                v-for="(column, colIndex) in visibleColumns"
                :key="column.sort || colIndex"
                class="grid-cell"
                v-bind="buildAttributes(getCellOptions(column, item))"
                @click="column.action && column.action(item)"
              >
                <template v-if="shouldShowCell(column, item)">
                  <DynamicComponent
                    v-if="getCellComponent(column, item, rowIndex)"
                    :options="getCellComponent(column, item, rowIndex)!"
                  />
                  <span
                    v-else
                    v-html="getCellValue(column, item, rowIndex)"
                  />
                </template>
              </td>
            </tr>
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
import { computed } from 'vue'
import type { Column, RowOptions, SortOrder, SortState } from './types'
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
}>(), {
  loading: false,
  showLoader: true,
  showFooter: true,
  emptyText: 'No results found',
  rowKeyField: 'id'
})

const emit = defineEmits<{
  filterChange: []
}>()


const visibleColumns = computed(() => {
  return props.columns.filter(column => shouldShowColumn(column))
})

const hasFooter = computed(() => {
  return visibleColumns.value.some(column => column.footer)
})

const hasFilterColumns = computed(() => {
  return visibleColumns.value.some(column => column.filter)
})

function getRowKey(item: T, index: number): string | number {
  if (props.rowKeyField && typeof item === 'object' && item !== null) {
    const key = (item as Record<string, unknown>)[props.rowKeyField]
    if (key !== undefined) {
      return key as string | number
    }
  }
  return index
}

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

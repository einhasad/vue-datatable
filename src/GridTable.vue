<template>
  <div class="grid-table-wrapper">
    <table class="grid-table">
      <thead>
        <tr class="grid-header-row">
          <th
            v-for="column in visibleColumns"
            :key="column.key"
            class="grid-header-cell"
          >
            <template v-if="column.sort && onSort">
              <button
                type="button"
                class="grid-sort-button"
                :class="{
                  'grid-sort-active': sortState && sortState.field === column.sort,
                  'grid-sort-asc': sortState && sortState.field === column.sort && sortState.order === 'asc',
                  'grid-sort-desc': sortState && sortState.field === column.sort && sortState.order === 'desc'
                }"
                @click="onSort(column.sort!, sortState && sortState.field === column.sort && sortState.order === 'asc' ? 'desc' : 'asc')"
              >
                {{ getColumnLabel(column, items) }}
              </button>
            </template>
            <DynamicComponent
              v-else-if="column.labelComponent"
              :options="column.labelComponent"
            />
            <span v-else>
              {{ getColumnLabel(column, items) }}
            </span>
          </th>
        </tr>
        <tr
          v-if="$slots.filters"
          class="grid-filter-row"
        >
          <slot name="filters" />
        </tr>
      </thead>

      <tbody>
        <template v-if="loading && showLoader">
          <tr class="grid-loading-row">
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
              class="grid-row"
              v-bind="buildAttributes(getRowOptions(rowOptions, item))"
              @click="onRowClick && onRowClick(item)"
            >
              <td
                v-for="column in visibleColumns"
                :key="column.key"
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
              v-for="column in visibleColumns"
              :key="column.key"
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

<script setup lang="ts">
import { computed } from 'vue'
import type { Column, RowOptions, SortState } from './types'
import {
  getCellValue,
  getColumnLabel,
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

const props = withDefaults(defineProps<{
  columns: Column<unknown>[]
  items: unknown[]
  loading?: boolean
  showLoader?: boolean
  showFooter?: boolean
  emptyText?: string
  rowOptions?: (model: unknown) => RowOptions
  onRowClick?: (model: unknown) => void
  onSort?: (field: string, order: 'asc' | 'desc') => void
  sortState?: SortState | null
  rowKeyField?: string
}>(), {
  loading: false,
  showLoader: true,
  showFooter: true,
  emptyText: 'No results found',
  rowKeyField: 'id'
})

const visibleColumns = computed(() => {
  return props.columns.filter(column => shouldShowColumn(column))
})

const hasFooter = computed(() => {
  return visibleColumns.value.some(column => column.footer)
})

function getRowKey(item: unknown, index: number): string | number {
  if (props.rowKeyField && typeof item === 'object' && item !== null) {
    const key = (item as Record<string, unknown>)[props.rowKeyField]
    if (key !== undefined) {
      return key as string | number
    }
  }
  return index
}
</script>

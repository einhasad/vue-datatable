<template>
  <tr class="grid-search-row">
    <td
      v-for="(column, colIndex) in visibleColumns"
      :key="column.key || column.sort || colIndex"
      class="grid-search-cell"
    >
      <div
        v-if="column.filter?.type === 'text'"
        class="grid-search-input-wrap"
        :class="{ 'is-active': getFilterValue(column).length > 0 }"
      >
        <svg
          class="grid-search-input-wrap__icon"
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="6"
            cy="6"
            r="4"
            stroke="currentColor"
            stroke-width="1.25"
          />
          <path
            d="M9 9L12 12"
            stroke="currentColor"
            stroke-width="1.25"
            stroke-linecap="round"
          />
        </svg>
        <input
          type="text"
          class="grid-search-input"
          :value="getFilterValue(column)"
          :placeholder="getPlaceholder(column)"
          :aria-label="getAccessibleName(column)"
          @change="handleInput(column, ($event.target as HTMLInputElement).value)"
        >
      </div>
      <select
        v-else-if="column.filter?.type === 'select'"
        class="grid-search-select"
        :value="getFilterValue(column)"
        :aria-label="getAccessibleName(column)"
        @change="handleInput(column, ($event.target as HTMLSelectElement).value)"
      >
        <option value="">
          All
        </option>
        <option
          v-for="opt in getFilterOptions(column)"
          :key="opt.value"
          :value="opt.value"
        >
          {{ opt.label }}
        </option>
      </select>
    </td>
  </tr>
</template>

<script setup lang="ts" generic="T">
import { computed } from 'vue'
import type { Column } from './types'
import type { StateProvider } from './state/StateProvider'
import { shouldShowColumn, getColumnLabel } from './utils'

const props = defineProps<{
  columns: Column<T>[]
  stateProvider: StateProvider
}>()

const emit = defineEmits<{
  filterChange: []
}>()

const visibleColumns = computed(() => {
  return props.columns.filter(column => shouldShowColumn(column))
})

function getFilterKey(column: Column<T>): string {
  return column.filter?.name ?? column.key ?? column.sort ?? ''
}

function getPlaceholder(column: Column<T>): string {
  const placeholder = column.filter?.placeholder
  return typeof placeholder === 'string' ? placeholder : getColumnLabel(column, [])
}

function getAccessibleName(column: Column<T>): string {
  const name = getColumnLabel(column, []) || getFilterKey(column)
  return name ? `Filter by ${name}` : 'Filter'
}

function getFilterValue(column: Column<T>): string {
  return props.stateProvider.getFilter(getFilterKey(column)) ?? ''
}

function handleInput(column: Column<T>, value: string): void {
  const key = getFilterKey(column)
  if (value.trim()) {
    props.stateProvider.setFilter(key, value)
  } else {
    props.stateProvider.clearFilter(key)
  }
  emit('filterChange')
}

function getFilterOptions(column: Column<T>): Array<{ value: string; label: string }> {
  const filter = column.filter
  if (filter && 'options' in filter && Array.isArray(filter.options)) {
    return filter.options as Array<{ value: string; label: string }>
  }
  return []
}
</script>

<template>
  <tr class="grid-search-row">
    <td
      v-for="(column, colIndex) in filterColumns"
      :key="column.key || column.sort || colIndex"
      class="grid-search-cell"
    >
      <input
        v-if="column.filter?.type === 'text'"
        type="text"
        class="grid-search-input"
        :value="getFilterValue(column)"
        :placeholder="getColumnLabel(column, [])"
        @input="handleInput(column, ($event.target as HTMLInputElement).value)"
      >
      <select
        v-else-if="column.filter?.type === 'select'"
        class="grid-search-select"
        :value="getFilterValue(column)"
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

const filterColumns = computed(() => {
  return props.columns.filter(column => shouldShowColumn(column) && column.filter)
})

function getFilterKey(column: Column<T>): string {
  return column.filter?.name ?? column.key ?? column.sort ?? ''
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

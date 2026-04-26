<template>
  <template v-if="column.sort">
    <a
      href=""
      class="grid-sort-link"
      :class="{
        'asc': sortState && sortState.field === column.sort && sortState.order === 'asc',
        'desc': sortState && sortState.field === column.sort && sortState.order === 'desc'
      }"
      @click.prevent="handleSortClick"
    >
      <b>{{ label }}</b>
      <svg
        class="grid-sort-link__icon"
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        aria-hidden="true"
      >
        <path
          class="grid-sort-link__icon-up"
          d="M3.5 5L6 2.5L8.5 5"
          stroke="currentColor"
          stroke-width="1.25"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          class="grid-sort-link__icon-down"
          d="M3.5 7L6 9.5L8.5 7"
          stroke="currentColor"
          stroke-width="1.25"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </a>
  </template>
  <DynamicComponent
    v-else-if="column.labelComponent"
    :options="column.labelComponent"
  />
  <b v-else>{{ label }}</b>
</template>

<script setup lang="ts" generic="T">
import { computed } from 'vue'
import type {Column, SortOrder, SortState} from './types'
import DynamicComponent from './DynamicComponent.vue'

const props = defineProps<{
  column: Column<T>
  sortState?: SortState | null
  nextSortOrder?: (current: SortOrder) => SortOrder
}>();

const emit = defineEmits<{
  (e: 'sort', newSort: SortState): void
}>()

const label = computed(() => {
  const l = props.column.label
  if (typeof l === 'function') return ''
  return l ?? ''
})

const resolveNextSortOrder = (current: SortOrder): SortOrder => {
  const custom = props.nextSortOrder?.(current)
  if (custom !== undefined) return custom

  if (current === 'asc') {
    return 'desc'
  }

  if (current === 'desc') {
    return null
  }

  return 'asc'
}

function handleSortClick(): void {
  const field = props.column.sort!
  const currentOrder: SortOrder = (props.sortState?.field === field)
    ? props.sortState.order
    : null
  const nextOrder = resolveNextSortOrder(currentOrder)
  emit('sort', { field, order: nextOrder })
}
</script>

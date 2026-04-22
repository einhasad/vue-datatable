<script setup lang="ts">
import { computed } from 'vue'
import { useGridDataProvider } from './dataProvider'
import { useGridState } from './gridState'
import {LoadResult} from "./types.ts";

const dataProvider = useGridDataProvider()
const stateProvider = useGridState()

const hasActiveFilters = computed(() => {
  const filters = stateProvider?.state.filters ?? {}
  return Object.keys(filters).some(k => filters[k] !== '')
})

function reset(): Promise<LoadResult<unknown>> | undefined {
  stateProvider?.clear()
  return dataProvider?.refresh()
}

defineSlots<{
  default(props: { reset: () => void; hasActiveFilters: boolean }): never
}>()
</script>

<template>
  <slot
    :reset="reset"
    :has-active-filters="hasActiveFilters"
  />
</template>

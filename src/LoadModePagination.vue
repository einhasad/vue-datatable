<template>
  <div class="grid-pagination-load-more">
    <button
      v-if="pagination && pagination.hasMore()"
      type="button"
      class="grid-load-more-button"
      :disabled="loading"
      @click="handleLoadMore"
    >
      <slot name="load-more-text">
        {{ loading ? 'Loading...' : 'Load More' }}
      </slot>
    </button>
    <div
      v-else-if="pagination"
      class="grid-no-more"
    >
      <slot name="no-more-text">
        No more results
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Pagination } from './types'

withDefaults(defineProps<{
  pagination: Pagination | null
  loading?: boolean
}>(), {
  loading: false
})

const emit = defineEmits<{
  loadMore: []
}>()

function handleLoadMore(): void {
  emit('loadMore')
}
</script>

<style scoped>
.grid-pagination-load-more {
  padding: 1rem;
  text-align: center;
}

.grid-load-more-button {
  padding: 0.5rem 1rem;
  background-color: var(--grid-button-bg, #007bff);
  color: var(--grid-button-color, white);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.grid-load-more-button:hover:not(:disabled) {
  background-color: var(--grid-button-hover-bg, #0056b3);
}

.grid-load-more-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.grid-no-more {
  color: var(--grid-text-muted, #6c757d);
  font-style: italic;
}
</style>

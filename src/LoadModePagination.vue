<template>
  <div class="grid-pagination grid-pagination-load-mode">
    <slot
      name="default"
      :has-more="pagination.hasMore()"
      :loading="pagination.isLoading()"
      :load-more="handleLoadMore"
    >
      <button
        v-if="pagination.hasMore()"
        type="button"
        class="grid-load-more-button"
        :disabled="pagination.isLoading()"
        @click="handleLoadMore"
      >
        <slot name="load-more-text">
          {{ pagination.isLoading() ? 'Loading...' : 'Load More' }}
        </slot>
      </button>
      <div
        v-else
        class="grid-no-more"
      >
        <slot name="no-more-text">
          No more results
        </slot>
      </div>
    </slot>
  </div>
</template>

<script setup lang="ts">
import type { Pagination } from './types'

const props = defineProps<{
  pagination: Pagination
}>()

const emit = defineEmits<{
  loadMore: []
}>()

async function handleLoadMore(): Promise<void> {
  await props.pagination.loadMore()
  emit('loadMore')
}
</script>

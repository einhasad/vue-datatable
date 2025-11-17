<template>
  <div
    ref="scrollSentinel"
    class="grid-pagination-scroll"
  >
    <div
      v-if="pagination && pagination.hasMore()"
      class="grid-scroll-loading"
    >
      <slot name="loading-text">
        {{ loading ? 'Loading more...' : '' }}
      </slot>
    </div>
    <div
      v-else-if="pagination"
      class="grid-scroll-end"
    >
      <slot name="end-text">
        All items loaded
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import type { Pagination } from './types'

const props = withDefaults(defineProps<{
  pagination: Pagination | null
  loading?: boolean
  threshold?: number
}>(), {
  loading: false,
  threshold: 100
})

const emit = defineEmits<{
  loadMore: []
}>()

const scrollSentinel = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

function handleIntersection(entries: IntersectionObserverEntry[]) {
  const entry = entries[0]
  if (entry.isIntersecting && props.pagination && props.pagination.hasMore() && !props.loading) {
    emit('loadMore')
  }
}

onMounted(() => {
  if (!scrollSentinel.value) return

  observer = new IntersectionObserver(handleIntersection, {
    root: null,
    rootMargin: `${props.threshold}px`,
    threshold: 0
  })

  observer.observe(scrollSentinel.value)
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
})

// Re-observe if the element changes
watch(scrollSentinel, (newEl, oldEl) => {
  if (observer) {
    if (oldEl) observer.unobserve(oldEl)
    if (newEl) observer.observe(newEl)
  }
})
</script>

<style scoped>
.grid-pagination-scroll {
  padding: 1rem;
  text-align: center;
  min-height: 50px;
}

.grid-scroll-loading {
  color: var(--grid-text-muted, #6c757d);
  font-style: italic;
}

.grid-scroll-end {
  color: var(--grid-text-muted, #6c757d);
  font-size: 0.875rem;
}
</style>

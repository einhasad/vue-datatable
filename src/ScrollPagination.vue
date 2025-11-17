<template>
  <div class="grid-pagination grid-pagination-scroll">
    <div
      ref="sentinel"
      class="grid-scroll-sentinel"
      :class="{
        'is-loading': pagination.isLoading(),
        'has-more': pagination.hasMore()
      }"
    >
      <slot
        name="loading"
        :loading="pagination.isLoading()"
      >
        <div
          v-if="pagination.isLoading()"
          class="grid-scroll-loading"
        >
          <slot name="loading-text">
            Loading more...
          </slot>
        </div>
      </slot>

      <slot
        name="no-more"
        :has-more="pagination.hasMore()"
      >
        <div
          v-if="!pagination.hasMore() && !pagination.isLoading()"
          class="grid-no-more"
        >
          <slot name="no-more-text">
            No more results
          </slot>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { Pagination } from './types'

const props = withDefaults(defineProps<{
  pagination: Pagination
  threshold?: number
  rootMargin?: string
}>(), {
  threshold: 0.1,
  rootMargin: '100px'
})

const emit = defineEmits<{
  loadMore: []
}>()

const sentinel = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

function handleIntersection(entries: IntersectionObserverEntry[]): void {
  const entry = entries[0]

  if (
    entry.isIntersecting &&
    props.pagination.hasMore() &&
    !props.pagination.isLoading()
  ) {
    // Don't await here to avoid returning a Promise to IntersectionObserver
    props.pagination.loadMore()
      .then(() => {
        emit('loadMore')
      })
      .catch((error: unknown) => {
        console.error('Error loading more items:', error)
      })
  }
}

onMounted(() => {
  if (!sentinel.value) return

  observer = new IntersectionObserver(handleIntersection, {
    root: null,
    rootMargin: props.rootMargin,
    threshold: props.threshold
  })

  observer.observe(sentinel.value)
})

onUnmounted(() => {
  if (observer && sentinel.value) {
    observer.unobserve(sentinel.value)
    observer.disconnect()
    observer = null
  }
})
</script>

<template>
  <div class="grid-scroll-pagination">
    <div
      v-if="hasMore"
      ref="sentinelRef"
      class="grid-scroll-sentinel"
    />
    <div
      v-if="loading"
      class="grid-scroll-loading"
    >
      <slot name="loading-text">
        Loading more...
      </slot>
    </div>
    <div
      v-else-if="!hasMore"
      class="grid-scroll-end"
    >
      <slot name="end-text">
        No more items
      </slot>
    </div>
  </div>
</template>

<style scoped>
.grid-scroll-sentinel {
  height: 1px;
  width: 100%;
}
</style>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

export interface ScrollPaginationInfo {
  hasMore: () => boolean
}

const props = withDefaults(defineProps<{
  pagination: ScrollPaginationInfo | null
  loading?: boolean
}>(), {
  loading: false
})

const emit = defineEmits<{
  'loadMore': []
}>()

const sentinelRef = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

const hasMore = computed(() => props.pagination ? props.pagination.hasMore() : false)

function handleIntersection(entries: IntersectionObserverEntry[]): void {
  if (entries.some(entry => entry.isIntersecting) && hasMore.value && !props.loading) {
    emit('loadMore')
  }
}

onMounted(() => {
  if (sentinelRef.value) {
    observer = new IntersectionObserver(handleIntersection, { rootMargin: '100px' })
    observer.observe(sentinelRef.value)
  }
})

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
})
</script>

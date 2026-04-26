<template>
  <div class="grid-scroll-pagination" :class="`grid-scroll-pagination--${position}`">
    <div
      v-if="canLoad"
      ref="sentinelRef"
      class="grid-scroll-sentinel"
    />
    <div
      v-if="loading"
      class="grid-scroll-loading"
    >
      <slot name="loading-text">
        {{ position === 'top' ? 'Loading earlier...' : 'Loading more...' }}
      </slot>
    </div>
    <div
      v-else-if="!canLoad && position === 'bottom'"
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
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'

export interface ScrollPaginationInfo {
  hasMore: () => boolean
  hasEarlier?: () => boolean
}

const props = withDefaults(defineProps<{
  pagination: ScrollPaginationInfo | null
  loading?: boolean
  position?: 'top' | 'bottom'
}>(), {
  loading: false,
  position: 'bottom'
})

const emit = defineEmits<{
  'loadMore': []
  'loadEarlier': []
}>()

const sentinelRef = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

const canLoad = computed(() => {
  if (!props.pagination) return false
  return props.position === 'top'
    ? !!props.pagination.hasEarlier?.()
    : props.pagination.hasMore()
})

function handleIntersection(entries: IntersectionObserverEntry[]): void {
  if (entries.some(entry => entry.isIntersecting) && canLoad.value && !props.loading) {
    emit(props.position === 'top' ? 'loadEarlier' : 'loadMore')
  }
}

function attach() {
  if (!sentinelRef.value || observer) return
  observer = new IntersectionObserver(handleIntersection, { rootMargin: '100px' })
  observer.observe(sentinelRef.value)
}

function detach() {
  if (!observer) return
  observer.disconnect()
  observer = null
}

// onMounted handles the case where the sentinel is rendered at mount
// (canLoad already true). watch handles the case where canLoad flips later
// — critical for position="top", which only shows the sentinel after the
// window has slid forward.
onMounted(attach)
watch(sentinelRef, (el) => {
  detach()
  if (el) attach()
})
onBeforeUnmount(detach)
</script>

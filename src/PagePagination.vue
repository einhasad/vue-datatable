<template>
  <nav
    v-if="totalPages > 0"
    class="grid-pagination"
    aria-label="Pagination"
  >
    <button
      type="button"
      class="grid-pagination-link grid-pagination-prev"
      :class="{ 'grid-pagination-disabled': currentPage <= 1 }"
      :disabled="currentPage <= 1"
      aria-label="Previous page"
      @click="goToPage(currentPage - 1)"
    >
      &laquo;
    </button>

    <button
      v-for="page in visiblePages"
      :key="page"
      type="button"
      class="grid-pagination-link grid-pagination-page-number"
      :class="{ 'grid-pagination-active': page === currentPage }"
      :aria-current="page === currentPage ? 'page' : undefined"
      @click="goToPage(page)"
    >
      {{ page }}
    </button>

    <button
      type="button"
      class="grid-pagination-link grid-pagination-next"
      :class="{ 'grid-pagination-disabled': currentPage >= totalPages }"
      :disabled="currentPage >= totalPages"
      aria-label="Next page"
      @click="goToPage(currentPage + 1)"
    >
      &raquo;
    </button>

    <span
      v-if="showSummary"
      class="grid-pagination-summary"
      role="status"
      aria-live="polite"
    >
      Showing {{ rangeStart }}-{{ rangeEnd }} of <span data-qa="grid-items-total">{{ totalItems }}</span> items
    </span>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  maxVisiblePages?: number
  showSummary?: boolean
}>(), {
  maxVisiblePages: 5,
  showSummary: false
})

const emit = defineEmits<{
  'pageChange': [page: number]
}>()

const displayedPage = computed(() => Math.min(Math.max(props.currentPage, 1), Math.max(props.totalPages, 1)))

const rangeStart = computed(() => {
  if (props.totalItems <= 0) return 0
  return Math.min((displayedPage.value - 1) * props.itemsPerPage + 1, props.totalItems)
})

const rangeEnd = computed(() => Math.max(Math.min(displayedPage.value * props.itemsPerPage, props.totalItems), rangeStart.value))

const visiblePages = computed(() => {
  const pages: number[] = []
  const half = Math.floor(props.maxVisiblePages / 2)
  let start = Math.max(1, props.currentPage - half)
  const end = Math.min(props.totalPages, start + props.maxVisiblePages - 1)

  if (end - start + 1 < props.maxVisiblePages) {
    start = Math.max(1, end - props.maxVisiblePages + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

function goToPage(page: number): void {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit('pageChange', page)
  }
}
</script>

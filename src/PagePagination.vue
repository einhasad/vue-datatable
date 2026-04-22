<template>
  <div
    v-if="totalPages > 0"
    class="grid-pagination"
  >
    <a
      class="grid-pagination-link grid-pagination-prev"
      :class="{ 'grid-pagination-disabled': currentPage <= 1 }"
      @click.prevent="goToPage(currentPage - 1)"
    >
      &laquo;
    </a>

    <a
      v-for="page in visiblePages"
      :key="page"
      class="grid-pagination-link grid-pagination-page-number"
      :class="{ 'grid-pagination-active': page === currentPage }"
      @click.prevent="goToPage(page)"
    >
      {{ page }}
    </a>

    <a
      class="grid-pagination-link grid-pagination-next"
      :class="{ 'grid-pagination-disabled': currentPage >= totalPages }"
      @click.prevent="goToPage(currentPage + 1)"
    >
      &raquo;
    </a>

    <span
      v-if="showSummary"
      class="grid-pagination-summary"
    >
      Showing {{ rangeStart }}-{{ rangeEnd }} of <span data-qa="grid-items-total">{{ totalItems }}</span> items
    </span>
  </div>
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

const rangeStart = computed(() => (props.currentPage - 1) * props.itemsPerPage + 1)

const rangeEnd = computed(() => Math.min(props.currentPage * props.itemsPerPage, props.totalItems))

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

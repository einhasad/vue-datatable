<template>
  <div
    v-if="pagination"
    class="grid-pagination-page"
  >
    <div
      v-if="showSummary && pagination.getTotalCount()"
      class="grid-pagination-info"
    >
      <span class="grid-pagination-summary">
        {{ paginationSummary }}
      </span>
    </div>

    <ul
      v-if="pagination.getPageCount() && pagination.getPageCount()! > 1"
      class="pagination"
    >
      <li v-if="!hidePrevNextOnEdge || (pagination.getCurrentPage() && pagination.getCurrentPage()! > 1)">
        <button
          type="button"
          class="grid-pagination-button grid-pagination-previous"
          :disabled="!pagination.getCurrentPage() || pagination.getCurrentPage()! <= 1"
          @click="handlePrevious"
        >
          <slot name="previous-text">
            <span aria-hidden="true">&laquo;</span>
          </slot>
        </button>
      </li>

      <li
        v-for="page in pageRange"
        :key="page"
        :class="{
          'active': pagination.getCurrentPage() === page
        }"
      >
        <button
          type="button"
          class="grid-pagination-button grid-pagination-page-number"
          @click="handlePageChange(page)"
        >
          {{ page }}
        </button>
      </li>

      <li v-if="!hidePrevNextOnEdge || (pagination.getCurrentPage() && pagination.getPageCount() && pagination.getCurrentPage()! < pagination.getPageCount()!)">
        <button
          type="button"
          class="grid-pagination-button grid-pagination-next"
          :disabled="!pagination.getCurrentPage() || !pagination.getPageCount() || pagination.getCurrentPage()! >= pagination.getPageCount()!"
          @click="handleNext"
        >
          <slot name="next-text">
            <span aria-hidden="true">&raquo;</span>
          </slot>
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Pagination } from './types'
import { getPageRange, getPaginationSummary } from './utils'

const props = withDefaults(defineProps<{
  pagination: Pagination | null
  maxVisiblePages?: number
  showSummary?: boolean
  hidePrevNextOnEdge?: boolean
}>(), {
  maxVisiblePages: 5,
  showSummary: true,
  hidePrevNextOnEdge: true
})

const emit = defineEmits<{
  pageChange: [page: number]
}>()

const pageRange = computed(() => {
  if (!props.pagination) return []

  const currentPage = props.pagination.getCurrentPage()
  const pageCount = props.pagination.getPageCount()

  if (!currentPage || !pageCount) return []

  return getPageRange(currentPage, pageCount, props.maxVisiblePages)
})

const paginationSummary = computed(() => {
  if (!props.pagination) return ''

  const currentPage = props.pagination.getCurrentPage()
  const pageSize = props.pagination.getPageSize()
  const totalCount = props.pagination.getTotalCount()

  if (!currentPage || !pageSize || !totalCount) return ''

  return getPaginationSummary(currentPage, pageSize, totalCount)
})

function handlePageChange(page: number): void {
  emit('pageChange', page)
}

function handlePrevious(): void {
  if (props.pagination) {
    const currentPage = props.pagination.getCurrentPage()
    if (currentPage && currentPage > 1) {
      handlePageChange(currentPage - 1)
    }
  }
}

function handleNext(): void {
  if (props.pagination) {
    const currentPage = props.pagination.getCurrentPage()
    const pageCount = props.pagination.getPageCount()
    if (currentPage && pageCount && currentPage < pageCount) {
      handlePageChange(currentPage + 1)
    }
  }
}
</script>

<style scoped>
.grid-pagination-page {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.grid-pagination-info {
  color: var(--grid-text-muted, #6c757d);
  font-size: 0.875rem;
}

.pagination {
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
  gap: 0.25rem;
}

.pagination li {
  display: inline-block;
}

.pagination li.active .grid-pagination-button {
  background-color: var(--grid-button-active-bg, #007bff);
  color: var(--grid-button-active-color, white);
}

.grid-pagination-button {
  padding: 0.375rem 0.75rem;
  background-color: var(--grid-button-bg, #f8f9fa);
  color: var(--grid-button-color, #212529);
  border: 1px solid var(--grid-border-color, #dee2e6);
  cursor: pointer;
  font-size: 0.875rem;
  border-radius: 4px;
}

.grid-pagination-button:hover:not(:disabled) {
  background-color: var(--grid-button-hover-bg, #e9ecef);
}

.grid-pagination-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>

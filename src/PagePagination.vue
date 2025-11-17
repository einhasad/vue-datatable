<template>
  <div class="grid-pagination grid-pagination-page">
    <slot
      name="default"
      :current-page="currentPage"
      :page-count="totalPages"
      :per-page="perPage"
      :total-count="totalCount"
      :pages="pageRange"
      :on-page-change="handlePageChange"
      :on-previous="handlePrevious"
      :on-next="handleNext"
      :loading="pagination.isLoading()"
    >
      <div
        v-if="showSummary"
        class="grid-pagination-info"
      >
        <span class="grid-pagination-summary">
          {{ paginationSummary }}
        </span>
      </div>

      <ul
        v-if="totalPages > 1"
        class="pagination"
      >
        <li v-if="!hidePrevNextOnEdge || currentPage > 1">
          <button
            type="button"
            class="grid-pagination-button grid-pagination-previous"
            :disabled="currentPage <= 1 || pagination.isLoading()"
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
            'active': page === currentPage
          }"
        >
          <button
            type="button"
            class="grid-pagination-button grid-pagination-page-number"
            :disabled="pagination.isLoading()"
            @click="handlePageChange(page)"
          >
            {{ page }}
          </button>
        </li>

        <li v-if="!hidePrevNextOnEdge || currentPage < totalPages">
          <button
            type="button"
            class="grid-pagination-button grid-pagination-next"
            :disabled="currentPage >= totalPages || pagination.isLoading()"
            @click="handleNext"
          >
            <slot name="next-text">
              <span aria-hidden="true">&raquo;</span>
            </slot>
          </button>
        </li>
      </ul>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Pagination } from './types'
import { getPageRange, getPaginationSummary } from './utils'

const props = withDefaults(defineProps<{
  pagination: Pagination
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

const currentPage = computed(() => {
  return props.pagination.getCurrentPage?.() || 1
})

const totalPages = computed(() => {
  return props.pagination.getTotalPages?.() || 1
})

const perPage = computed(() => {
  return props.pagination.getPerPage?.() || 10
})

const totalCount = computed(() => {
  return props.pagination.getTotalCount?.() || 0
})

const pageRange = computed(() => {
  return getPageRange(
    currentPage.value,
    totalPages.value,
    props.maxVisiblePages
  )
})

const paginationSummary = computed(() => {
  return getPaginationSummary(
    currentPage.value,
    perPage.value,
    totalCount.value
  )
})

async function handlePageChange(page: number): Promise<void> {
  if (props.pagination.setPage) {
    await props.pagination.setPage(page)
    emit('pageChange', page)
  }
}

async function handlePrevious(): Promise<void> {
  const prevPage = currentPage.value - 1
  if (prevPage >= 1) {
    await handlePageChange(prevPage)
  }
}

async function handleNext(): Promise<void> {
  const nextPage = currentPage.value + 1
  if (nextPage <= totalPages.value) {
    await handlePageChange(nextPage)
  }
}
</script>

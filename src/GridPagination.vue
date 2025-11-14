<template>
  <div class="grid-pagination">
    <!-- Cursor-based pagination (Load More pattern) -->
    <template v-if="mode === 'cursor'">
      <div class="grid-pagination-cursor">
        <slot name="cursor-pagination">
          <button
            v-if="hasMore"
            type="button"
            class="grid-load-more-button"
            :disabled="loading"
            @click="onLoadMore"
          >
            <slot name="load-more-text">
              {{ loading ? 'Loading...' : 'Load More' }}
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

    <!-- Page-based pagination (1, 2, 3... pattern) -->
    <template v-else-if="mode === 'page' && pagination">
      <div class="grid-pagination-page">
        <slot
          name="page-pagination"
          :current-page="isPagePagination(pagination) ? pagination.currentPage : 1"
          :page-count="isPagePagination(pagination) ? pagination.pageCount : 1"
          :per-page="isPagePagination(pagination) ? pagination.perPage : 10"
          :total-count="isPagePagination(pagination) ? pagination.totalCount : 0"
          :pages="pageRange"
          :on-page-change="onPageChange"
          :on-previous="onPrevious"
          :on-next="onNext"
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
            v-if="isPagePagination(pagination) && pagination.pageCount > 1"
            class="pagination"
          >
            <li v-if="!hidePrevNextOnEdge || (isPagePagination(pagination) && pagination.currentPage > 1)">
              <button
                type="button"
                class="grid-pagination-button grid-pagination-previous"
                :disabled="(isPagePagination(pagination) && pagination.currentPage <= 1) || loading"
                @click="onPrevious"
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
                'active': isPagePagination(pagination) && page === pagination.currentPage
              }"
            >
              <button
                type="button"
                class="grid-pagination-button grid-pagination-page-number"
                :disabled="loading"
                @click="onPageChange(page)"
              >
                {{ page }}
              </button>
            </li>

            <li v-if="!hidePrevNextOnEdge || (isPagePagination(pagination) && pagination.currentPage < pagination.pageCount)">
              <button
                type="button"
                class="grid-pagination-button grid-pagination-next"
                :disabled="(isPagePagination(pagination) && pagination.currentPage >= pagination.pageCount) || loading"
                @click="onNext"
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
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PaginationData, PaginationMode } from './types'
import { isPagePagination } from './types'
import { getPageRange, getPaginationSummary } from './utils'

const props = withDefaults(defineProps<{
  mode: PaginationMode
  pagination?: PaginationData | null
  hasMore?: boolean
  loading?: boolean
  maxVisiblePages?: number
  showSummary?: boolean
  hidePrevNextOnEdge?: boolean
  onLoadMore?: () => void
  onPageChange?: (page: number) => void
}>(), {
  loading: false,
  maxVisiblePages: 5,
  showSummary: true,
  hidePrevNextOnEdge: true
})

const emit = defineEmits<{
  loadMore: []
  pageChange: [page: number]
}>()

const pageRange = computed(() => {
  if (props.mode !== 'page' || !props.pagination) {
    return []
  }

  if (isPagePagination(props.pagination)) {
    return getPageRange(
      props.pagination.currentPage,
      props.pagination.pageCount,
      props.maxVisiblePages
    )
  }

  return []
})

const paginationSummary = computed(() => {
  if (props.mode !== 'page' || !props.pagination) {
    return ''
  }

  if (isPagePagination(props.pagination)) {
    return getPaginationSummary(
      props.pagination.currentPage,
      props.pagination.perPage,
      props.pagination.totalCount
    )
  }

  return ''
})

function onLoadMore() {
  if (props.onLoadMore) {
    props.onLoadMore()
  } else {
    emit('loadMore')
  }
}

function onPageChange(page: number) {
  if (props.onPageChange) {
    props.onPageChange(page)
  } else {
    emit('pageChange', page)
  }
}

function onPrevious() {
  if (props.pagination && isPagePagination(props.pagination)) {
    const prevPage = props.pagination.currentPage - 1
    if (prevPage >= 1) {
      onPageChange(prevPage)
    }
  }
}

function onNext() {
  if (props.pagination && isPagePagination(props.pagination)) {
    const nextPage = props.pagination.currentPage + 1
    if (nextPage <= props.pagination.pageCount) {
      onPageChange(nextPage)
    }
  }
}
</script>

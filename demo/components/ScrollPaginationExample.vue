<template>
  <div class="demo-controls">
    <div class="demo-control-group">
      <label for="scroll-search-main">Search</label>
      <input
        id="scroll-search-main"
        v-model="searchTerm"
        type="search"
        placeholder="Search products..."
        class="demo-input"
        @input="scheduleSearch"
        @keydown.enter="commitSearchNow"
      >
    </div>
    <div class="demo-control-group">
      <label for="scroll-sort-main">Sort by</label>
      <select
        id="scroll-sort-main"
        v-model="sortBy"
        class="demo-select"
      >
        <option
          v-for="option in sortOptions"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
    </div>
    <p
      class="demo-control-group ds-small ds-muted"
      role="status"
    >
      Total: {{ matchingCount.toLocaleString('en-US') }} products
    </p>
  </div>
  <div
    ref="containerRef"
    class="scroll-container demo-scroll-container"
  >
    <ScrollPagination
      position="top"
      :pagination="scrollInfo"
      :loading="loading"
      @load-earlier="loadEarlier"
    >
      <template #loading-text>
        Loading earlier products...
      </template>
    </ScrollPagination>
    <Grid
      :data-provider="productProvider"
      :columns="productColumns"
    />
    <ScrollPagination
      :pagination="scrollInfo"
      :loading="loading"
      @load-more="loadMore"
    >
      <template #loading-text>
        Loading more products...
      </template>
      <template #end-text>
        No more products
      </template>
    </ScrollPagination>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  CallbackDataProvider,
  Grid,
  QueryParamsStateProvider,
  ScrollPagination,
  useFilterField,
  type Column,
  type ScrollPaginationInfo
} from '@einhasad-vue/datatable-vue'
import { createProductCatalog, type Product } from '../data/products'

const PAGE_SIZE = 50
const BUFFER_SIZE = 100
const SEARCH_DEBOUNCE_MS = 300

const catalog = createProductCatalog(10_000)
const stateProvider = new QueryParamsStateProvider({ router: useRouter(), prefix: 'scroll' })

const containerRef = ref<HTMLElement | null>(null)
const windowStart = ref(0)
const windowEnd = ref(PAGE_SIZE)
const matchingCount = ref(catalog.size)
let lastQueryKey = ''

const productProvider = new CallbackDataProvider<Product>({
  stateProvider,
  loadFn: ({ sortField, sortOrder, searchParams }) => {
    const search = searchParams?.q ?? ''
    const queryKey = JSON.stringify([search, sortField, sortOrder])
    if (queryKey !== lastQueryKey) {
      lastQueryKey = queryKey
      windowStart.value = 0
      windowEnd.value = PAGE_SIZE
      if (containerRef.value) containerRef.value.scrollTop = 0
    }
    const matching = catalog.query({ search, sortField, sortOrder })
    matchingCount.value = matching.length
    return Promise.resolve({ items: matching.slice(windowStart.value, windowEnd.value) })
  }
})

const loading = computed(() => productProvider.isLoading())

const scrollInfo = computed<ScrollPaginationInfo>(() => ({
  hasMore: () => windowEnd.value < matchingCount.value,
  hasEarlier: () => windowStart.value > 0
}))

async function loadMore(): Promise<void> {
  if (loading.value || windowEnd.value >= matchingCount.value) return
  windowEnd.value = Math.min(windowEnd.value + PAGE_SIZE, matchingCount.value)
  if (windowEnd.value - windowStart.value > BUFFER_SIZE) {
    windowStart.value += PAGE_SIZE
  }
  await productProvider.refresh()
}

async function loadEarlier(): Promise<void> {
  if (loading.value || windowStart.value <= 0) return
  const container = containerRef.value
  const scrollTopBefore = container?.scrollTop ?? 0
  const rowHeight = container?.querySelector('.grid-row')?.getBoundingClientRect().height ?? 0

  const shift = Math.min(PAGE_SIZE, windowStart.value)
  windowStart.value -= shift
  windowEnd.value = Math.min(windowStart.value + BUFFER_SIZE, matchingCount.value)
  await productProvider.refresh()
  await nextTick()

  if (container && rowHeight > 0) {
    container.scrollTop = scrollTopBefore + shift * rowHeight
  }
}

const { localValue: searchTerm, commit: commitSearch } = useFilterField({ stateProvider, filterName: 'q' })
let searchTimer: ReturnType<typeof setTimeout> | undefined

function scheduleSearch(): void {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(commitSearch, SEARCH_DEBOUNCE_MS)
}

function commitSearchNow(): void {
  clearTimeout(searchTimer)
  commitSearch()
}

onBeforeUnmount(() => clearTimeout(searchTimer))

const sortOptions = [
  { value: '', label: 'Default (ID)' },
  { value: 'name', label: 'Name (A-Z)' },
  { value: '-name', label: 'Name (Z-A)' },
  { value: 'price', label: 'Price (low-high)' },
  { value: '-price', label: 'Price (high-low)' },
  { value: 'rating', label: 'Rating (low-high)' },
  { value: '-rating', label: 'Rating (high-low)' }
]

const sortBy = computed({
  get: () => {
    const sort = stateProvider.state.sort
    if (!sort?.order) return ''
    return sort.order === 'desc' ? `-${sort.field}` : sort.field
  },
  set: (value: string) => {
    if (!value) {
      stateProvider.clearSort()
    } else if (value.startsWith('-')) {
      stateProvider.setSort(value.slice(1), 'desc')
    } else {
      stateProvider.setSort(value, 'asc')
    }
  }
})

function ratingColor(rating: number): string {
  if (rating >= 4.5) return '#2D6A45'
  if (rating >= 4) return '#8A5A00'
  return '#B42318'
}

const productColumns: Column<Product>[] = [
  { key: 'id', label: 'ID', sort: 'id' },
  { key: 'name', label: 'Product Name', sort: 'name' },
  { key: 'category', label: 'Category', sort: 'category' },
  { key: 'price', label: 'Price', sort: 'price', value: (product) => `$${product.price.toFixed(2)}` },
  {
    key: 'rating',
    label: 'Rating',
    sort: 'rating',
    component: (product) => ({
      is: 'span',
      props: { style: { color: ratingColor(product.rating), fontWeight: 'bold' } },
      content: product.rating.toFixed(1)
    })
  },
  { key: 'stock', label: 'Stock', sort: 'stock', value: (product) => product.stock.toLocaleString('en-US') },
  { key: 'sku', label: 'SKU' }
]
</script>

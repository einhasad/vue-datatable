<template>
  <div>
    <div class="controls">
      <div class="control-group">
        <label for="scroll-search">Search:</label>
        <input
          id="scroll-search"
          v-model="searchQuery"
          type="text"
          placeholder="Search products..."
          class="search-input"
          @input="handleSearchInput"
        />
      </div>
      <div class="control-group">
        <label for="scroll-sort">Sort By:</label>
        <select id="scroll-sort" v-model="sortBy" @change="handleSortChange" class="sort-select">
          <option value="">Default</option>
          <option value="name">Name (A-Z)</option>
          <option value="-name">Name (Z-A)</option>
          <option value="price">Price (Low-High)</option>
          <option value="-price">Price (High-Low)</option>
          <option value="rating">Rating (Low-High)</option>
          <option value="-rating">Rating (High-Low)</option>
        </select>
      </div>
      <div class="control-group info-text">
        <span>Total: {{ totalCount.toLocaleString() }} products</span>
      </div>
    </div>

    <div class="scroll-container" @scroll="handleScrollEvent" ref="scrollContainerRef">
      <Grid :data-provider="provider" :columns="columns" ref="gridRef" />
      <ScrollPagination
        :pagination="pagination"
        :loading="loading"
        @load-more="handleLoadMore"
      >
        <template #loading-text>Loading more products...</template>
        <template #end-text>No more products</template>
      </ScrollPagination>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  Grid,
  QueryParamsStateProvider,
  ScrollPagination,
  useWindowedScroll,
  type Column
} from '@einhasad-vue/datatable-vue'

const router = useRouter()

// Generate products data
const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Toys', 'Beauty', 'Automotive']
const ADJECTIVES = ['Premium', 'Professional', 'Essential', 'Ultimate', 'Classic', 'Modern', 'Smart', 'Portable']
const NOUNS = ['Widget', 'Gadget', 'Device', 'Tool', 'Kit', 'Set', 'Pack', 'Bundle']

interface Product {
  id: number
  name: string
  category: string
  price: number
  rating: number
  stock: number
  sku: string
}

function generateProducts(count: number): Product[] {
  return Array.from({ length: count }, (_, i) => {
    const adjective = ADJECTIVES[i % ADJECTIVES.length]
    const noun = NOUNS[Math.floor(i / ADJECTIVES.length) % NOUNS.length]
    const category = CATEGORIES[i % CATEGORIES.length]

    return {
      id: i + 1,
      name: `${adjective} ${noun} ${i + 1}`,
      category,
      price: parseFloat((Math.random() * 500 + 10).toFixed(2)),
      rating: parseFloat((Math.random() * 2 + 3).toFixed(1)),
      stock: Math.floor(Math.random() * 1000),
      sku: `SKU-${String(i + 1).padStart(6, '0')}`
    }
  })
}

const allProducts = generateProducts(10000)

// State provider for URL state
const stateProvider = new QueryParamsStateProvider({
  router,
  prefix: 'scroll'
})

// Use the composable
const {
  loading,
  hasMore,
  totalCount,
  pagination,
  searchQuery,
  sortBy,
  provider,
  handleLoadMore,
  handleScroll,
  handleSearchInput,
  handleSortChange
} = useWindowedScroll<Product>({
  items: allProducts,
  pageSize: 50,
  bufferSize: 100,
  stateProvider,
  searchFilter: (product, query) =>
    product.name.toLowerCase().includes(query) ||
    product.category.toLowerCase().includes(query) ||
    product.sku.toLowerCase().includes(query)
})

const gridRef = ref<any>(null)
const scrollContainerRef = ref<HTMLElement | null>(null)

// Wrapper for scroll event
function handleScrollEvent(event: Event) {
  handleScroll(event, gridRef.value)
}

// Columns
const columns: Column[] = [
  { key: 'id', label: 'ID', sort: 'id' },
  { key: 'name', label: 'Product Name', sort: 'name' },
  { key: 'category', label: 'Category', sort: 'category' },
  {
    key: 'price',
    label: 'Price',
    sort: 'price',
    value: (row) => `$${row.price.toFixed(2)}`
  },
  {
    key: 'rating',
    label: 'Rating',
    sort: 'rating',
    component: (row) => ({
      is: 'span',
      props: {
        style: {
          color: row.rating >= 4.5 ? '#38a169' : row.rating >= 4 ? '#d69e2e' : '#e53e3e',
          fontWeight: 'bold'
        }
      },
      content: `${row.rating} \u2B50`
    })
  },
  {
    key: 'stock',
    label: 'Stock',
    sort: 'stock',
    value: (row) => row.stock.toLocaleString()
  },
  { key: 'sku', label: 'SKU' }
]
</script>

<style scoped>
.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 200px;
  flex: 1;
}

.control-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #4a5568;
}

.search-input,
.sort-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #cbd5e0;
  border-radius: 0.375rem;
  font-size: 0.9rem;
  color: #2d3748;
  background: white;
  transition: all 0.2s;
}

.search-input:focus,
.sort-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.info-text {
  display: flex;
  align-items: flex-end;
  color: #4a5568;
  font-size: 0.9rem;
}

.scroll-container {
  max-height: 500px;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
}
</style>

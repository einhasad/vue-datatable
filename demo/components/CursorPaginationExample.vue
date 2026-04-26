<template>
  <Grid
    ref="gridRef"
    :data-provider="cursorProvider"
    :columns="cursorPaginationColumns"
  />
  <button
    v-if="hasMore"
    class="grid-load-more demo-load-more-btn"
    :disabled="loading"
    @click="loadMore"
  >
    {{ loading ? 'Loading...' : 'Load More' }}
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Grid, ArrayDataProvider, type Column } from '@einhasad-vue/datatable-vue'

const pageSize = 8
const allProducts = Array.from({ length: 35 }, (_, i) => ({
  id: i + 1,
  name: `Product ${i + 1}`,
  price: `$${(Math.random() * 100 + 10).toFixed(2)}`,
  category: ['Electronics', 'Clothing', 'Books', 'Home'][i % 4]
}))

const gridRef = ref<any>(null)
const loadedCount = ref(pageSize)
const loading = ref(false)
const hasMore = ref(true)

const cursorProvider = new ArrayDataProvider({
  items: allProducts.slice(0, pageSize)
})

function loadMore() {
  if (loading.value || !hasMore.value) return
  loading.value = true
  const nextEnd = Math.min(loadedCount.value + pageSize, allProducts.length)
  loadedCount.value = nextEnd
  cursorProvider.setAllItems(allProducts.slice(0, nextEnd))
  hasMore.value = nextEnd < allProducts.length
  loading.value = false
}

const cursorPaginationColumns: Column[] = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Product Name' },
  { key: 'price', label: 'Price' },
  { key: 'category', label: 'Category' }
]
</script>

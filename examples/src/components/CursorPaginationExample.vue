<template>
  <section id="cursor-pagination" class="section">
    <div>
      <h2>Cursor Pagination Example (Load More)</h2>

      <div class="example-description">
        <p>
          This example demonstrates cursor-based pagination with a "Load More" button.
          This pattern is ideal for infinite scroll implementations and mobile-friendly interfaces.
        </p>
      </div>

      <div class="example-section">
        <h3>Demo</h3>
        <Grid
          ref="gridRef"
          :data-provider="cursorProvider"
          :columns="cursorPaginationColumns"
        />
        <button
          v-if="hasMore"
          class="grid-load-more"
          :disabled="loading"
          @click="loadMore"
        >
          {{ loading ? 'Loading...' : 'Load More' }}
        </button>
      </div>

      <div class="example-section">
        <h3>Code</h3>
        <CodeExample examplePath="/examples/code/CursorPaginationExample.vue" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Grid, ArrayDataProvider, type Column } from '@einhasad-vue/datatable-vue'
import CodeExample from './CodeExample.vue'

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
  if (gridRef.value) {
    gridRef.value.items = cursorProvider.getCurrentItems()
  }
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

<style scoped>
.section {
  margin-bottom: 4rem;
  scroll-margin-top: 2rem;
}

.example-section {
  margin-bottom: 2rem;
}

.example-description {
  margin-bottom: 1.5rem;
  color: #4a5568;
}

.grid-load-more {
  display: block;
  width: 100%;
  padding: 10px;
  margin-top: 8px;
  border: 1px solid var(--grid-button-border, #d9d9d9);
  background: var(--grid-button-bg, #fff);
  color: var(--grid-button-color, #333);
  cursor: pointer;
  font-size: 14px;
  border-radius: 4px;
}

.grid-load-more:hover:not(:disabled) {
  background: var(--grid-button-hover-bg, #f5f5f5);
}

.grid-load-more:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>

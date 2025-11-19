<template>
  <section id="cursor-pagination" class="section">
    <div>
      <h2>Cursor Pagination Example (Load More)</h2>

      <div class="example-description">
        <p>
          This example demonstrates cursor-based pagination with a "Load More" button using the new
          <code>LoadModePagination</code> component. This pattern is ideal for infinite scroll
          implementations and mobile-friendly interfaces.
        </p>
      </div>

      <div class="example-section">
        <h3>Demo</h3>
        <Grid
          :data-provider="cursorPaginationProvider"
          :columns="cursorPaginationColumns"
        >
          <template #pagination="{ pagination, loading }">
            <LoadModePagination
              :pagination="pagination"
              :loading="loading"
              @load-more="cursorPaginationProvider.loadMore()"
            />
          </template>
        </Grid>
      </div>

      <div class="example-section">
        <h3>Code</h3>
        <pre class="code-block"><code>&lt;template&gt;
  &lt;Grid :data-provider="provider" :columns="columns"&gt;
    &lt;template #pagination="{ pagination, loading }"&gt;
      &lt;LoadModePagination
        :pagination="pagination"
        :loading="loading"
        @load-more="provider.loadMore()"
      /&gt;
    &lt;/template&gt;
  &lt;/Grid&gt;
&lt;/template&gt;

&lt;script setup lang="ts"&gt;
import { Grid, ArrayDataProvider, LoadModePagination, type Column } from '@grid-vue/grid'

// Generate sample data
const products = Array.from({ length: 35 }, (_, i) => ({
  id: i + 1,
  name: `Product ${i + 1}`,
  price: `$${(Math.random() * 100 + 10).toFixed(2)}`,
  category: ['Electronics', 'Clothing', 'Books', 'Home'][i % 4]
}))

const provider = new ArrayDataProvider({
  items: products,
  pagination: true,
  paginationMode: 'cursor',
  pageSize: 8
})

const columns: Column[] = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Product Name' },
  { key: 'price', label: 'Price' },
  { key: 'category', label: 'Category' }
]
&lt;/script&gt;</code></pre>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Grid, ArrayDataProvider, LoadModePagination, type Column } from '@grid-vue/grid'
import '@grid-vue/grid/style.css'

const cursorPaginationProducts = Array.from({ length: 35 }, (_, i) => ({
  id: i + 1,
  name: `Product ${i + 1}`,
  price: `$${(Math.random() * 100 + 10).toFixed(2)}`,
  category: ['Electronics', 'Clothing', 'Books', 'Home'][i % 4]
}))

const cursorPaginationProvider = new ArrayDataProvider({
  items: cursorPaginationProducts,
  pagination: true,
  paginationMode: 'cursor',
  pageSize: 8
})

const cursorPaginationColumns: Column[] = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Product Name' },
  { key: 'price', label: 'Price' },
  { key: 'category', label: 'Category' }
]
</script>

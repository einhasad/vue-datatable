<template>
  <section id="array-provider" class="section">
    <div>
      <h2>Array Provider Example</h2>

      <div class="example-description">
        <p>
          The <strong>ArrayDataProvider</strong> is perfect for working with static, in-memory data.
          It supports client-side pagination, sorting, and filtering without requiring a backend API.
          This example demonstrates its key features including offset pagination and sorting capabilities.
        </p>
      </div>

      <div class="example-section">
        <h3>Key Features</h3>
        <ul class="feature-list">
          <li><strong>Client-side pagination:</strong> No backend required for pagination</li>
          <li><strong>Sorting:</strong> Sort by any column with a single click</li>
          <li><strong>Filtering:</strong> Filter data locally in the browser</li>
          <li><strong>Fast:</strong> Perfect for datasets up to thousands of rows</li>
        </ul>
      </div>

      <div class="example-section">
        <h3>Demo</h3>
        <Grid
          :data-provider="arrayProvider"
          :columns="arrayColumns"
        >
          <template #pagination="{ pagination, setPage }">
            <PagePagination
              :current-page="pagination.currentPage"
              :total-pages="pagination.totalPages"
              :total-items="pagination.totalItems"
              :items-per-page="pagination.pageSize"
              @page-change="setPage"
            />
          </template>
        </Grid>
      </div>

      <div class="example-section">
        <h3>Code</h3>
        <CodeExample examplePath="/examples/code/ArrayProviderExample.vue" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Grid, ArrayDataProvider, PagePagination, type Column } from '@einhasad-vue/datatable-vue'
import CodeExample from './CodeExample.vue'

const products = [
  { id: 1, name: 'Laptop Pro', category: 'Electronics', price: 1299, stock: 45 },
  { id: 2, name: 'Wireless Mouse', category: 'Accessories', price: 29, stock: 150 },
  { id: 3, name: 'USB-C Cable', category: 'Accessories', price: 15, stock: 200 },
  { id: 4, name: 'Monitor 27"', category: 'Electronics', price: 399, stock: 30 },
  { id: 5, name: 'Keyboard Mechanical', category: 'Accessories', price: 129, stock: 75 },
  { id: 6, name: 'Webcam HD', category: 'Electronics', price: 79, stock: 60 },
  { id: 7, name: 'Desk Lamp', category: 'Office', price: 45, stock: 90 },
  { id: 8, name: 'Office Chair', category: 'Office', price: 299, stock: 25 },
  { id: 9, name: 'Headphones', category: 'Electronics', price: 199, stock: 40 },
  { id: 10, name: 'Tablet Stand', category: 'Accessories', price: 35, stock: 100 }
]

const arrayProvider = new ArrayDataProvider({ items: products })
arrayProvider.setOffsetPagination({ page: 1, pageSize: 5 })
arrayProvider.setSort({ field: 'id', order: 'asc' })

const arrayColumns: Column[] = [
  { key: 'id', label: 'ID', sort: 'id' },
  { key: 'name', label: 'Product Name', sort: 'name' },
  { key: 'category', label: 'Category', sort: 'category' },
  { key: 'price', label: 'Price ($)', sort: 'price' },
  { key: 'stock', label: 'Stock', sort: 'stock' }
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

.feature-list {
  line-height: 1.8;
}

.feature-list li {
  margin-bottom: 0.5rem;
}
</style>

<template>
  <div>
    <h2>Array Provider Example</h2>

    <div class="example-description">
      <p>
        The <strong>ArrayDataProvider</strong> is perfect for working with static, in-memory data.
        It supports client-side pagination, sorting, and filtering without requiring a backend API.
        This example demonstrates its key features including page-based pagination and sorting capabilities.
      </p>
    </div>

    <div class="example-notice">
      <strong>✅ Living Documentation:</strong> This code is extracted from tests and guaranteed to work!
      <br>
      <small>Source: <code>__tests__/examples/arrayProviderExample.ts</code></small>
    </div>

    <div class="example-section">
      <h3>Demo</h3>
      <Grid
        :data-provider="provider"
        :columns="columns"
      />
    </div>

    <div class="example-section">
      <h3>Code</h3>
      <pre class="code-block"><code>&lt;template&gt;
  &lt;Grid
    :data-provider="provider"
    :columns="columns"
  /&gt;
&lt;/template&gt;

&lt;script setup lang="ts"&gt;
import { Grid, ArrayDataProvider, type Column } from '@grid-vue/grid'

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

const provider = new ArrayDataProvider({
  items: products,
  pagination: true,
  paginationMode: 'page',
  pageSize: 5
})

const columns: Column[] = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'name', label: 'Product Name', sortable: true },
  { key: 'category', label: 'Category', sortable: true },
  { key: 'price', label: 'Price ($)', sortable: true },
  { key: 'stock', label: 'Stock', sortable: true }
]
&lt;/script&gt;</code></pre>
    </div>

    <div class="example-section">
      <h3>Key Features</h3>
      <ul>
        <li><strong>Client-side pagination:</strong> No server requests needed</li>
        <li><strong>Sorting:</strong> Click column headers to sort data</li>
        <li><strong>In-memory processing:</strong> Fast performance for small to medium datasets</li>
        <li><strong>Simple configuration:</strong> Just pass an array and options</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Grid, ArrayDataProvider, type Column } from '@grid-vue/grid'

// This code is extracted from __tests__/examples/arrayProviderExample.ts
// and guaranteed to work because it's tested!
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

const provider = new ArrayDataProvider({
  items: products,
  pagination: true,
  paginationMode: 'page',
  pageSize: 5
})

const columns: Column[] = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'name', label: 'Product Name', sortable: true },
  { key: 'category', label: 'Category', sortable: true },
  { key: 'price', label: 'Price ($)', sortable: true },
  { key: 'stock', label: 'Stock', sortable: true }
]
</script>

<style scoped>
.example-notice {
  background: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 4px;
  padding: 12px;
  margin: 16px 0;
  color: #155724;
}

.example-notice code {
  background: #c3e6cb;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.9em;
}

.example-description {
  margin: 16px 0;
  font-size: 1.05em;
}

.example-section {
  margin: 24px 0;
}

.example-section ul {
  list-style: none;
  padding: 0;
}

.example-section li {
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.example-section li:last-child {
  border-bottom: none;
}

.code-block {
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 16px;
  overflow-x: auto;
  font-size: 14px;
  line-height: 1.5;
}
</style>

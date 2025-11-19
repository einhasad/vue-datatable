<template>
  <section id="array-provider" class="section">
    <div>
      <h2>Array Provider Example</h2>

      <div class="example-description">
        <p>
          The ArrayDataProvider is perfect for working with static, in-memory data. It supports client-side
          pagination, sorting, and filtering without requiring a backend API. This example demonstrates its key
          features including page-based pagination and sorting capabilities.
        </p>
      </div>

      <div class="features">
        <h3>Features</h3>
        <ul>
          <li>Client-side pagination: No server requests needed</li>
          <li>Sorting: Click column headers to sort data</li>
          <li>In-memory processing: Fast performance for small to medium datasets</li>
          <li>Simple configuration: Just pass an array and options</li>
        </ul>
      </div>

      <div class="example-demo" data-qa="array-provider-example">
        <ClientOnly>
          <Grid v-if="provider" :data-provider="provider" :columns="columns" />
        </ClientOnly>
      </div>

      <div class="example-code">
        <h3>Code</h3>
        <pre class="code-block">{{ codeExample }}</pre>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Grid, ArrayDataProvider, type Column } from '@grid-vue/grid'
import '@grid-vue/grid/style.css'

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

const provider = ref<ArrayDataProvider<any> | null>(null)

const columns: Column[] = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'name', label: 'Product Name', sortable: true },
  { key: 'category', label: 'Category', sortable: true },
  { key: 'price', label: 'Price ($)', sortable: true },
  { key: 'stock', label: 'Stock', sortable: true }
]

const codeExample = `const products = [
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
]`

onMounted(() => {
  provider.value = new ArrayDataProvider({
    items: products,
    pagination: true,
    paginationMode: 'page',
    pageSize: 5
  })
})
</script>

<style scoped>
.section {
  margin-bottom: 3rem;
}

.section h2 {
  font-size: 2rem;
  color: #2d3748;
  margin-bottom: 1rem;
}

.example-description {
  background: #f7fafc;
  padding: 1rem;
  border-left: 4px solid #667eea;
  margin-bottom: 2rem;
}

.example-description p {
  margin: 0;
  color: #4a5568;
}

.features {
  margin: 2rem 0;
}

.features h3 {
  font-size: 1.25rem;
  color: #2d3748;
  margin-bottom: 1rem;
}

.features ul {
  list-style: none;
  padding: 0;
}

.features li {
  padding: 0.5rem 0;
  color: #4a5568;
  position: relative;
  padding-left: 1.5rem;
}

.features li:before {
  content: "✓";
  position: absolute;
  left: 0;
  color: #667eea;
  font-weight: bold;
}

.example-demo {
  margin: 2rem 0;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 1rem;
}

.example-code {
  margin-top: 2rem;
}

.example-code h3 {
  font-size: 1.25rem;
  color: #2d3748;
  margin-bottom: 1rem;
}

.code-block {
  background: #2d3748;
  color: #68d391;
  padding: 1rem;
  border-radius: 0.25rem;
  font-family: monospace;
  overflow-x: auto;
  margin: 0;
  font-size: 0.9rem;
}
</style>

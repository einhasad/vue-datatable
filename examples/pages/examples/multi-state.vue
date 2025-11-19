<template>
  <section id="multi-state" class="section">
    <div>
      <h2>Multi-State Example</h2>
      <p>
        This example demonstrates using multiple grids with different state providers and URL prefixes.
        Each grid maintains its own independent state, allowing complex dashboards with multiple data sources.
      </p>
      <p class="info">
        Try sorting or paginating both grids - notice how each maintains its own state with different URL prefixes!
      </p>

      <div class="example-section">
        <h3>Array Provider with "products" prefix</h3>
        <ClientOnly>
          <Grid :data-provider="multiStateArrayProvider" :columns="multiStateArrayColumns" />
        </ClientOnly>
      </div>

      <div class="example-section">
        <h3>Mock HTTP Provider with "users" prefix</h3>
        <ClientOnly>
          <Grid :data-provider="multiStateHttpProvider" :columns="multiStateHttpColumns" />
        </ClientOnly>
      </div>

      <div class="example-section">
        <h3>Code</h3>
        <pre class="code-block"><code>import { useRouter } from 'vue-router'
import { ArrayDataProvider, HttpDataProvider, QueryParamsStateProvider } from '@grid-vue/grid'

const router = useRouter()

// First grid: Array provider with "products" prefix
const productsStateProvider = new QueryParamsStateProvider({
  router,
  prefix: 'products'
})

const productsProvider = new ArrayDataProvider({
  items: products,
  pagination: true,
  paginationMode: 'page',
  pageSize: 5,
  stateProvider: productsStateProvider
})

// Second grid: HTTP provider with "users" prefix
const usersStateProvider = new QueryParamsStateProvider({
  router,
  prefix: 'users'
})

const usersProvider = new HttpDataProvider({
  url: '/api/users',
  pagination: true,
  paginationMode: 'page',
  pageSize: 5,
  stateProvider: usersStateProvider,
  httpClient: mockHttpClient,
  responseAdapter: customAdapter
})

// URL will contain both: ?products-sort=name&products-page=2&users-sort=email&users-page=1</code></pre>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Grid, ArrayDataProvider, HttpDataProvider, QueryParamsStateProvider, type Column, type ResponseAdapter } from '@grid-vue/grid'
import '@grid-vue/grid/style.css'

const router = useRouter()

const products = [
  { id: 1, name: 'Laptop Pro', category: 'Electronics', price: 1299, stock: 45 },
  { id: 2, name: 'Wireless Mouse', category: 'Electronics', price: 29, stock: 120 },
  { id: 3, name: 'Desk Chair', category: 'Furniture', price: 249, stock: 30 },
  { id: 4, name: 'Monitor 27"', category: 'Electronics', price: 399, stock: 55 },
  { id: 5, name: 'Keyboard Mechanical', category: 'Electronics', price: 89, stock: 85 },
  { id: 6, name: 'Standing Desk', category: 'Furniture', price: 599, stock: 20 },
  { id: 7, name: 'Webcam HD', category: 'Electronics', price: 79, stock: 65 },
  { id: 8, name: 'Office Lamp', category: 'Furniture', price: 45, stock: 90 },
  { id: 9, name: 'USB-C Hub', category: 'Electronics', price: 49, stock: 110 },
  { id: 10, name: 'Notebook Pack', category: 'Stationery', price: 12, stock: 200 }
]

// Multi-State Example: Array Provider
const multiStateArrayProvider = new ArrayDataProvider({
  items: products,
  pagination: true,
  paginationMode: 'page',
  pageSize: 5,
  stateProvider: new QueryParamsStateProvider({
    router,
    prefix: 'products'
  })
})

const multiStateArrayColumns: Column[] = [
  { key: 'id', label: 'ID', sortable: true, sort: 'id' },
  { key: 'name', label: 'Product', sortable: true, sort: 'name' },
  { key: 'category', label: 'Category', sortable: true, sort: 'category' },
  { key: 'price', label: 'Price ($)', sortable: true, sort: 'price' }
]

// Multi-State Example: HTTP Provider (mock)
const customAdapter: ResponseAdapter = {
  extractItems: (response) => response.data || [],
  extractPagination: (response) => ({
    currentPage: response.page || 1,
    pageCount: response.totalPages || 1,
    pageSize: response.pageSize || 10,
    totalCount: response.total || 0
  }),
  isSuccess: (response) => response.success === true,
  getErrorMessage: (response) => response.error || 'Unknown error'
}

const mockHttpClient = async (url: string) => {
  await new Promise(resolve => setTimeout(resolve, 500))

  const mockUsers = [
    { id: 1, username: 'alice_smith', email: 'alice@company.com', status: 'Active' },
    { id: 2, username: 'bob_jones', email: 'bob@company.com', status: 'Active' },
    { id: 3, username: 'charlie_brown', email: 'charlie@company.com', status: 'Inactive' },
    { id: 4, username: 'diana_prince', email: 'diana@company.com', status: 'Active' },
    { id: 5, username: 'edward_norton', email: 'edward@company.com', status: 'Active' }
  ]

  return {
    success: true,
    data: mockUsers,
    page: 1,
    totalPages: 1,
    pageSize: 10,
    total: mockUsers.length
  }
}

const multiStateHttpProvider = new HttpDataProvider({
  url: '/api/users',
  pagination: true,
  paginationMode: 'page',
  pageSize: 5,
  httpClient: mockHttpClient,
  responseAdapter: customAdapter,
  stateProvider: new QueryParamsStateProvider({
    router,
    prefix: 'users'
  })
})

const multiStateHttpColumns: Column[] = [
  { key: 'id', label: 'ID', sortable: true, sort: 'id' },
  { key: 'username', label: 'Username', sortable: true, sort: 'username' },
  { key: 'email', label: 'Email', sortable: true, sort: 'email' },
  { key: 'status', label: 'Status', sortable: true, sort: 'status' }
]
</script>

<style scoped>
.info {
  padding: 1rem;
  background-color: #f7fafc;
  border-left: 4px solid #667eea;
  margin: 1rem 0;
  color: #2d3748;
}
</style>

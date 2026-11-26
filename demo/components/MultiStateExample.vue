<template>
  <div class="multi-state-demo">
    <h3>Products grid — prefix <code>{{ PRODUCTS_PREFIX }}</code></h3>
    <Grid
      :data-provider="productsProvider"
      :columns="productColumns"
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

    <h3>Users grid — prefix <code>{{ USERS_PREFIX }}</code></h3>
    <Grid
      :data-provider="usersProvider"
      :columns="userColumns"
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
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import {
  Grid,
  ArrayDataProvider,
  PagePagination,
  QueryParamsStateProvider,
  type Column
} from '@einhasad-vue/datatable-vue'

const router = useRouter()

const PRODUCTS_PREFIX = 'products'
const USERS_PREFIX = 'users'

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

const productsProvider = new ArrayDataProvider({
  items: products,
  stateProvider: new QueryParamsStateProvider({ router, prefix: PRODUCTS_PREFIX })
})
productsProvider.setOffsetPagination({ page: 1, pageSize: 5 })

const productColumns: Column[] = [
  { key: 'id', label: 'ID', sort: 'id' },
  { key: 'name', label: 'Product', sort: 'name', filter: { name: 'name', type: 'text' } },
  { key: 'category', label: 'Category', sort: 'category', filter: { name: 'category', type: 'text' } },
  { key: 'price', label: 'Price ($)', sort: 'price' }
]

const users = [
  { id: 1, username: 'alice_smith', email: 'alice@company.com', status: 'Active' },
  { id: 2, username: 'bob_jones', email: 'bob@company.com', status: 'Active' },
  { id: 3, username: 'charlie_brown', email: 'charlie@company.com', status: 'Inactive' },
  { id: 4, username: 'diana_prince', email: 'diana@company.com', status: 'Active' },
  { id: 5, username: 'edward_norton', email: 'edward@company.com', status: 'Active' },
  { id: 6, username: 'fiona_glenn', email: 'fiona@company.com', status: 'Inactive' },
  { id: 7, username: 'george_hall', email: 'george@company.com', status: 'Active' }
]

const usersProvider = new ArrayDataProvider({
  items: users,
  stateProvider: new QueryParamsStateProvider({ router, prefix: USERS_PREFIX })
})
usersProvider.setOffsetPagination({ page: 1, pageSize: 5 })

const userColumns: Column[] = [
  { key: 'id', label: 'ID', sort: 'id' },
  { key: 'username', label: 'Username', sort: 'username', filter: { name: 'username', type: 'text' } },
  { key: 'email', label: 'Email', sort: 'email' },
  { key: 'status', label: 'Status', sort: 'status', filter: { name: 'status', type: 'text' } }
]
</script>

<style scoped>
.multi-state-demo h3:not(:first-child) {
  margin-top: 24px;
}
</style>

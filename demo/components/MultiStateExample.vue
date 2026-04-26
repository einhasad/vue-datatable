<template>
  <div>
    <h3>Products grid — prefix <code>products</code></h3>
    <Grid
      :data-provider="multiStateArrayProvider"
      :columns="multiStateArrayColumns"
    />

    <h3 style="margin-top: 24px;">
      Users grid — prefix <code>users</code>
    </h3>
    <Grid
      :data-provider="multiStateHttpProvider"
      :columns="multiStateHttpColumns"
    />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import {
  Grid,
  ArrayDataProvider,
  QueryParamsStateProvider,
  type Column
} from '@einhasad-vue/datatable-vue'

const router = useRouter()

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

const multiStateArrayProvider = new ArrayDataProvider({
  items: products,
  stateProvider: new QueryParamsStateProvider({ router, prefix: 'products' })
})
multiStateArrayProvider.setOffsetPagination({ page: 1, pageSize: 5 })

const multiStateArrayColumns: Column[] = [
  { key: 'id', label: 'ID', sort: 'id' },
  { key: 'name', label: 'Product', sort: 'name' },
  { key: 'category', label: 'Category', sort: 'category' },
  { key: 'price', label: 'Price ($)', sort: 'price' }
]

const mockUsers = [
  { id: 1, username: 'alice_smith', email: 'alice@company.com', status: 'Active' },
  { id: 2, username: 'bob_jones', email: 'bob@company.com', status: 'Active' },
  { id: 3, username: 'charlie_brown', email: 'charlie@company.com', status: 'Inactive' },
  { id: 4, username: 'diana_prince', email: 'diana@company.com', status: 'Active' },
  { id: 5, username: 'edward_norton', email: 'edward@company.com', status: 'Active' }
]

const multiStateHttpProvider = new ArrayDataProvider({
  items: mockUsers,
  stateProvider: new QueryParamsStateProvider({ router, prefix: 'users' })
})
multiStateHttpProvider.setOffsetPagination({ page: 1, pageSize: 5 })

const multiStateHttpColumns: Column[] = [
  { key: 'id', label: 'ID', sort: 'id' },
  { key: 'username', label: 'Username', sort: 'username' },
  { key: 'email', label: 'Email', sort: 'email' },
  { key: 'status', label: 'Status', sort: 'status' }
]
</script>

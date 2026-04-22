<template>
  <Grid :data-provider="provider" :columns="columns">
    <template #pagination="{ pagination, setPage }">
      <PagePagination
        :current-page="pagination.currentPage"
        :total-pages="pagination.totalPages"
        :total-items="pagination.totalItems"
        :items-per-page="pagination.pageSize"
        :max-visible-pages="5"
        :show-summary="true"
        @page-change="setPage"
      />
    </template>
  </Grid>
</template>

<script setup lang="ts">
import { ArrayDataProvider, Grid, PagePagination, type Column } from '@einhasad-vue/datatable-vue'

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

const provider = new ArrayDataProvider({ items: products })
provider.setOffsetPagination({ page: 1, pageSize: 5 })

const columns: Column[] = [
  { key: 'id', label: 'ID', sort: 'id' },
  { key: 'name', label: 'Product Name', sort: 'name' },
  { key: 'category', label: 'Category', sort: 'category' },
  { key: 'price', label: 'Price ($)', sort: 'price' },
  { key: 'stock', label: 'Stock', sort: 'stock' }
]
</script>

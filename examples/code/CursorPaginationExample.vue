<template>
  <Grid :data-provider="provider" :columns="columns">
    <template #pagination="{ pagination, loading }">
      <LoadModePagination
        :pagination="pagination"
        :loading="loading"
        @load-more="provider.loadMore()"
      />
    </template>
  </Grid>
</template>

<script setup lang="ts">
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
</script>

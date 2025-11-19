<template>
  <Grid :data-provider="provider" :columns="columns">
    <template #pagination="{ pagination }">
      <PagePagination
        :pagination="pagination"
        :max-visible-pages="5"
        :show-summary="true"
        @page-change="provider.setPage($event)"
      />
    </template>
  </Grid>
</template>

<script setup lang="ts">
import { Grid, ArrayDataProvider, PagePagination, type Column } from '@grid-vue/grid'

// Generate sample data
const users = Array.from({ length: 47 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  status: ['Active', 'Inactive'][i % 2]
}))

const provider = new ArrayDataProvider({
  items: users,
  pagination: true,
  paginationMode: 'page',
  pageSize: 10
})

const columns: Column[] = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'status', label: 'Status' }
]
</script>

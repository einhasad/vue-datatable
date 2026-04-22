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

// Generate sample data
const users = Array.from({ length: 47 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  status: ['Active', 'Inactive'][i % 2]
}))

const provider = new ArrayDataProvider({ items: users })
provider.setOffsetPagination({ page: 1, pageSize: 10 })

const columns: Column[] = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'status', label: 'Status' }
]
</script>

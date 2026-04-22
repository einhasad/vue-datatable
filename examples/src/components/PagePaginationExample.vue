<template>
  <section id="page-pagination" class="section">
    <div>
      <h2>Page Pagination Example</h2>

      <div class="example-description">
        <p>
          This example shows traditional page-based pagination with page numbers using
          <code>ArrayDataProvider</code> with offset pagination. Users can navigate between pages using Previous,
          Next, and numbered page buttons with customizable options.
        </p>
      </div>

      <div class="example-section">
        <h3>Demo</h3>
        <Grid
          :data-provider="pagePaginationProvider"
          :columns="pagePaginationColumns"
        >
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
      </div>

      <div class="example-section">
        <h3>Code</h3>
        <CodeExample examplePath="/examples/code/PagePaginationExample.vue" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ArrayDataProvider, Grid, PagePagination, type Column } from '@einhasad-vue/datatable-vue'
import CodeExample from './CodeExample.vue'

const pagePaginationUsers = Array.from({ length: 47 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  status: ['Active', 'Inactive'][i % 2]
}))

const pagePaginationProvider = new ArrayDataProvider({ items: pagePaginationUsers })
pagePaginationProvider.setOffsetPagination({ page: 1, pageSize: 10 })

const pagePaginationColumns: Column[] = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'status', label: 'Status' }
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
</style>

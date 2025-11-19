<template>
  <section id="page-pagination" class="section">
    <div>
      <h2>Page Pagination Example</h2>

      <div class="example-description">
        <p>
          This example shows traditional page-based pagination with page numbers using the new
          <code>PagePagination</code> component. Users can navigate between pages using Previous,
          Next, and numbered page buttons with customizable options.
        </p>
      </div>

      <div class="example-section">
        <h3>Demo</h3>
        <ClientOnly>
        <Grid :data-provider="pagePaginationProvider"
          :columns="pagePaginationColumns"
        >
          <template #pagination="{ pagination }">
            <PagePagination
              :pagination="pagination"
              :max-visible-pages="5"
              :show-summary="true"
              @page-change="pagePaginationProvider.setPage($event)"
            />
          </template>
        </Grid>
        </ClientOnly>
      </div>

      <div class="example-section">
        <h3>Code</h3>
        <pre class="code-block"><code>&lt;template&gt;
  &lt;Grid :data-provider="provider" :columns="columns"&gt;
    &lt;template #pagination="{ pagination }"&gt;
      &lt;PagePagination
        :pagination="pagination"
        :max-visible-pages="5"
        :show-summary="true"
        @page-change="provider.setPage($event)"
      /&gt;
    &lt;/template&gt;
  &lt;/Grid&gt;
&lt;/template&gt;

&lt;script setup lang="ts"&gt;
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
&lt;/script&gt;</code></pre>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Grid, ArrayDataProvider, PagePagination, type Column } from '@grid-vue/grid'
import '@grid-vue/grid/style.css'

const pagePaginationUsers = Array.from({ length: 47 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  status: ['Active', 'Inactive'][i % 2]
}))

const pagePaginationProvider = new ArrayDataProvider({
  items: pagePaginationUsers,
  pagination: true,
  paginationMode: 'page',
  pageSize: 10
})

const pagePaginationColumns: Column[] = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'status', label: 'Status' }
]
</script>

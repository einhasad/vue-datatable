<template>
  <div>
    <h2>Page Pagination Example</h2>

    <div class="example-description">
      <p>
        This example shows traditional page-based pagination with page numbers.
        Users can navigate between pages using Previous, Next, and numbered page buttons.
      </p>
    </div>

    <div class="example-section">
      <h3>Demo</h3>
      <Grid
        :data-provider="provider"
        :columns="columns"
      />
    </div>

    <div class="example-section">
      <h3>Code</h3>
      <pre class="code-block"><code>&lt;script setup lang="ts"&gt;
import { Grid, ArrayDataProvider, type Column } from '@grid-vue/grid'

// Generate sample data
const users = Array.from({ length: 47 }, (_, i) => ({
  id: i + 1,
  name: \`User \${i + 1}\`,
  email: \`user\${i + 1}@example.com\`,
  status: ['Active', 'Inactive'][i % 2]
}))

const provider = new ArrayDataProvider(users, {
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
</template>

<script setup lang="ts">
import { Grid, ArrayDataProvider, type Column } from '@grid-vue/grid'

// Generate sample data
const users = Array.from({ length: 47 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  status: ['Active', 'Inactive'][i % 2]
}))

const provider = new ArrayDataProvider(users, {
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

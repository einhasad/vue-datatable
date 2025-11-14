<template>
  <div>
    <h2>Basic Example</h2>

    <div class="example-description">
      <p>
        This example demonstrates the most basic usage of Grid Vue with an ArrayDataProvider.
        The grid displays static data without pagination, showing how simple it is to get started.
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
      <pre class="code-block"><code>&lt;template&gt;
  &lt;Grid
    :data-provider="provider"
    :columns="columns"
  /&gt;
&lt;/template&gt;

&lt;script setup lang="ts"&gt;
import { Grid, ArrayDataProvider, type Column } from '@grid-vue/grid'

const users = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Editor' },
  { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', role: 'User' }
]

const provider = new ArrayDataProvider(users, {
  pagination: false,
  paginationMode: 'cursor'
})

const columns: Column[] = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' }
]
&lt;/script&gt;</code></pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Grid, ArrayDataProvider, type Column } from '@grid-vue/grid'

const users = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Editor' },
  { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', role: 'User' }
]

const provider = new ArrayDataProvider(users, {
  pagination: false,
  paginationMode: 'cursor'
})

const columns: Column[] = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' }
]
</script>

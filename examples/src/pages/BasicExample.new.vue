<template>
  <div>
    <h2>Basic Example</h2>

    <div class="example-description">
      <p>
        This example demonstrates the most basic usage of Grid Vue with an ArrayDataProvider.
        The grid displays static data without pagination, showing how simple it is to get started.
      </p>
    </div>

    <div class="example-notice">
      <strong>✅ Living Documentation:</strong> This code is extracted from tests and guaranteed to work!
      <br>
      <small>Source: <code>__tests__/examples/basicExample.ts</code></small>
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

const provider = new ArrayDataProvider({
  items: users,
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

// This code is extracted from __tests__/examples/basicExample.ts
// and guaranteed to work because it's tested!
const users = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Editor' },
  { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', role: 'User' }
]

const provider = new ArrayDataProvider({
  items: users,
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

<style scoped>
.example-notice {
  background: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 4px;
  padding: 12px;
  margin: 16px 0;
  color: #155724;
}

.example-notice code {
  background: #c3e6cb;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.9em;
}

.example-description {
  margin: 16px 0;
  font-size: 1.05em;
}

.example-section {
  margin: 24px 0;
}

.code-block {
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 16px;
  overflow-x: auto;
  font-size: 14px;
  line-height: 1.5;
}
</style>

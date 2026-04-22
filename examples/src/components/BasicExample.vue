<template>
  <section id="basic" class="section">
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
          :data-provider="basicProvider"
          :columns="basicColumns"
        />
      </div>

      <div class="example-section">
        <h3>Code</h3>
        <CodeExample examplePath="/examples/code/BasicExample.vue" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Grid, ArrayDataProvider, type Column } from '@einhasad-vue/datatable-vue'
import CodeExample from './CodeExample.vue'

const basicUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Editor' },
  { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', role: 'User' }
]

const basicProvider = new ArrayDataProvider({
  items: basicUsers
})

const basicColumns: Column[] = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' }
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

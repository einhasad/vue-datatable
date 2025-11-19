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

      <div class="example-demo" data-qa="basic-example">
        <Grid v-if="provider" :data-provider="provider" :columns="columns" />
      </div>

      <div class="example-code">
        <h3>Code</h3>
        <pre class="code-block">{{ codeExample }}</pre>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Grid, ArrayDataProvider, type Column } from '@grid-vue/grid'
import '@grid-vue/grid/style.css'

const users = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Editor' },
  { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', role: 'User' }
]

const provider = ref<ArrayDataProvider<any> | null>(null)

const columns: Column[] = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' }
]

const codeExample = `const users = [
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
]`

onMounted(() => {
  provider.value = new ArrayDataProvider({
    items: users,
    pagination: false,
    paginationMode: 'cursor'
  })
})
</script>

<style scoped>
.section {
  margin-bottom: 3rem;
}

.section h2 {
  font-size: 2rem;
  color: #2d3748;
  margin-bottom: 1rem;
}

.example-description {
  background: #f7fafc;
  padding: 1rem;
  border-left: 4px solid #667eea;
  margin-bottom: 2rem;
}

.example-description p {
  margin: 0;
  color: #4a5568;
}

.example-demo {
  margin: 2rem 0;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 1rem;
}

.example-code {
  margin-top: 2rem;
}

.example-code h3 {
  font-size: 1.25rem;
  color: #2d3748;
  margin-bottom: 1rem;
}

.code-block {
  background: #2d3748;
  color: #68d391;
  padding: 1rem;
  border-radius: 0.25rem;
  font-family: monospace;
  overflow-x: auto;
  margin: 0;
  font-size: 0.9rem;
}
</style>

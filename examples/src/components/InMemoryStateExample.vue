<template>
  <section id="state-inmemory" class="section">
    <div>
      <h2>InMemory State Provider</h2>
      <p>
        Stores state in memory. State is lost on page refresh. Useful for temporary filtering/sorting or testing.
      </p>
      <div class="example-section">
        <h3>Demo</h3>
        <Grid :data-provider="inMemoryProvider" :columns="stateColumns" />
      </div>
      <div class="example-section">
        <h3>Code</h3>
        <CodeExample examplePath="/examples/code/InMemoryStateProvider.ts" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  Grid,
  ArrayDataProvider,
  InMemoryStateProvider,
  type Column
} from '@einhasad-vue/datatable-vue'
import CodeExample from './CodeExample.vue'

// Data for InMemory state provider
const inMemoryUsers = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin', status: 'Active' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'User', status: 'Active' },
  { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', role: 'User', status: 'Active' },
  { id: 4, name: 'Diana Prince', email: 'diana@example.com', role: 'User', status: 'Active' },
  { id: 5, name: 'Eve Davis', email: 'eve@example.com', role: 'User', status: 'Active' },
  { id: 6, name: 'Frank Miller', email: 'frank@example.com', role: 'Admin', status: 'Active' },
  { id: 7, name: 'Grace Lee', email: 'grace@example.com', role: 'User', status: 'Active' },
  { id: 8, name: 'Henry Wilson', email: 'henry@example.com', role: 'User', status: 'Active' },
  { id: 9, name: 'Ivy Chen', email: 'ivy@example.com', role: 'User', status: 'Active' },
  { id: 10, name: 'Jack Ryan', email: 'jack@example.com', role: 'Admin', status: 'Active' },
  { id: 11, name: 'Kate Morgan', email: 'kate@example.com', role: 'User', status: 'Active' },
  { id: 12, name: 'Leo Turner', email: 'leo@example.com', role: 'User', status: 'Active' }
]

const stateColumns: Column[] = [
  { sort: 'id', label: 'ID', value: (m: any) => m.id.toString(), filter: { name: 'id', type: 'text', placeholder: 'Search ID...' } },
  { sort: 'name', label: 'Name', value: (m: any) => m.name, filter: { name: 'name', type: 'text', placeholder: 'Search Name...' } },
  { sort: 'email', label: 'Email', value: (m: any) => m.email, filter: { name: 'email', type: 'text', placeholder: 'Search Email...' } },
  { sort: 'role', label: 'Role', value: (m: any) => m.role, filter: { name: 'role', type: 'text', placeholder: 'Search Role...' } },
  { sort: 'status', label: 'Status', value: (m: any) => m.status, filter: { name: 'status', type: 'text', placeholder: 'Search Status...' } }
]

const inMemoryStateProvider = new InMemoryStateProvider()
const inMemoryProvider = new ArrayDataProvider({
  items: inMemoryUsers,
  stateProvider: inMemoryStateProvider
})
inMemoryProvider.setOffsetPagination({ page: 1, pageSize: 5 })
</script>

<style scoped>
.section {
  margin-bottom: 4rem;
  scroll-margin-top: 2rem;
}

.example-section {
  margin-bottom: 2rem;
}
</style>

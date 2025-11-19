<template>
  <section id="state-localstorage" class="section">
    <div>
      <h2>LocalStorage State Provider</h2>
      <p>
        Stores state in browser localStorage. State persists across page refreshes and browser sessions.
        Useful for preserving user preferences.
      </p>
      <p class="info">
        Try sorting, then refresh the page - your preferences will be restored!
      </p>
      <div class="example-section">
        <h3>Demo</h3>
        <ClientOnly>
          <Grid :data-provider="localStorageProvider" :columns="stateColumns" />
        </ClientOnly>
      </div>
      <div class="example-section">
        <h3>Code</h3>
        <pre class="code-block"><code>import { ArrayDataProvider, LocalStorageStateProvider } from '@grid-vue/grid'

const stateProvider = new LocalStorageStateProvider({
  storageKey: 'my-grid-state' // default: 'grid-state'
})

const provider = new ArrayDataProvider({
  items: users,
  pagination: true,
  paginationMode: 'page',
  pageSize: 5,
  stateProvider
})</code></pre>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Grid, ArrayDataProvider, LocalStorageStateProvider, type Column } from '@grid-vue/grid'
import '@grid-vue/grid/style.css'

const stateUsers = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin', status: 'Active' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'User', status: 'Active' },
  { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', role: 'User', status: 'Inactive' },
  { id: 4, name: 'Diana Prince', email: 'diana@example.com', role: 'Manager', status: 'Active' },
  { id: 5, name: 'Eve Davis', email: 'eve@example.com', role: 'User', status: 'Active' },
  { id: 6, name: 'Frank Miller', email: 'frank@example.com', role: 'Admin', status: 'Active' },
  { id: 7, name: 'Grace Lee', email: 'grace@example.com', role: 'User', status: 'Inactive' },
  { id: 8, name: 'Henry Wilson', email: 'henry@example.com', role: 'Manager', status: 'Active' },
  { id: 9, name: 'Ivy Chen', email: 'ivy@example.com', role: 'User', status: 'Active' },
  { id: 10, name: 'Jack Ryan', email: 'jack@example.com', role: 'Admin', status: 'Inactive' },
  { id: 11, name: 'Kate Morgan', email: 'kate@example.com', role: 'User', status: 'Active' },
  { id: 12, name: 'Leo Turner', email: 'leo@example.com', role: 'Manager', status: 'Active' }
]

const stateColumns: Column[] = [
  { key: 'id', label: 'ID', sort: 'id', value: (m) => m.id.toString() },
  { key: 'name', label: 'Name', sort: 'name', value: (m) => m.name },
  { key: 'email', label: 'Email', sort: 'email', value: (m) => m.email },
  { key: 'role', label: 'Role', sort: 'role', value: (m) => m.role },
  { key: 'status', label: 'Status', sort: 'status', value: (m) => m.status }
]

const localStorageProvider = new ArrayDataProvider({
  items: stateUsers,
  pagination: true,
  paginationMode: 'page',
  pageSize: 5,
  stateProvider: new LocalStorageStateProvider({ storageKey: 'grid-demo-state' })
})
</script>

<style scoped>
.info {
  padding: 1rem;
  background-color: #f7fafc;
  border-left: 4px solid #667eea;
  margin: 1rem 0;
  color: #2d3748;
}
</style>

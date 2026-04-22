<template>
  <section id="state-localstorage" class="section">
    <div>
      <h2>LocalStorage State Provider</h2>
      <p>
        Stores state in browser localStorage. State persists across page refreshes and browser sessions.
        Useful for preserving user preferences.
      </p>
      <p class="info">
        Try sorting or filtering, then refresh the page - your preferences will be restored!
      </p>
      <div class="example-section">
        <h3>Demo</h3>
        <Grid :data-provider="localStorageProvider" :columns="stateColumns" />
      </div>
      <div class="example-section">
        <h3>Code</h3>
        <CodeExample examplePath="/examples/code/LocalStorageStateProvider.ts" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  Grid,
  ArrayDataProvider,
  LocalStorageStateProvider,
  type Column
} from '@einhasad-vue/datatable-vue'
import CodeExample from './CodeExample.vue'

const stateUsers = [
  { id: 1, name: 'Eve Davis', email: 'eve@example.com', role: 'Manager', status: 'Inactive' },
  { id: 2, name: 'Steve Eve', email: 'steve@example.com', role: 'Manager', status: 'Inactive' },
  { id: 3, name: 'Diana Prince', email: 'diana@example.com', role: 'Manager', status: 'Inactive' },
  { id: 4, name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin', status: 'Active' },
  { id: 5, name: 'Bob Smith', email: 'bob@example.com', role: 'User', status: 'Active' },
  { id: 6, name: 'Charlie Brown', email: 'charlie@example.com', role: 'User', status: 'Active' },
  { id: 7, name: 'Frank Miller', email: 'frank@example.com', role: 'Admin', status: 'Active' },
  { id: 8, name: 'Henry Wilson', email: 'henry@example.com', role: 'User', status: 'Active' },
  { id: 9, name: 'Grace Lee', email: 'grace@example.com', role: 'User', status: 'Active' },
  { id: 10, name: 'Ivy Chen', email: 'ivy@example.com', role: 'User', status: 'Active' },
  { id: 11, name: 'Jack Ryan', email: 'jack@example.com', role: 'Admin', status: 'Active' },
  { id: 12, name: 'Kate Morgan', email: 'kate@example.com', role: 'User', status: 'Active' }
]

const stateColumns: Column[] = [
  { sort: 'id', label: 'ID', value: (m: any) => m.id.toString(), filter: { name: 'id', type: 'text' } },
  { sort: 'name', label: 'Name', value: (m: any) => m.name, filter: { name: 'name', type: 'text' } },
  { sort: 'email', label: 'Email', value: (m: any) => m.email, filter: { name: 'email', type: 'text' } },
  { sort: 'role', label: 'Role', value: (m: any) => m.role, filter: { name: 'role', type: 'text' } },
  { sort: 'status', label: 'Status', value: (m: any) => m.status, filter: { name: 'status', type: 'text' } }
]

const localStorageStateProvider = new LocalStorageStateProvider({ storageKey: 'grid-demo-state' })
const localStorageProvider = new ArrayDataProvider({
  items: stateUsers,
  stateProvider: localStorageStateProvider
})
localStorageProvider.setOffsetPagination({ page: 1, pageSize: 5 })
</script>

<style scoped>
.section {
  margin-bottom: 4rem;
  scroll-margin-top: 2rem;
}

.example-section {
  margin-bottom: 2rem;
}

.info {
  padding: 0.75rem 1rem;
  background: #ebf8ff;
  border-left: 4px solid #4299e1;
  border-radius: 0.25rem;
  margin: 1rem 0;
  font-size: 0.9rem;
}
</style>

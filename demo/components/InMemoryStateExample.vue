<template>
  <Grid
    :data-provider="inMemoryProvider"
    :columns="stateColumns"
  />
  <StateInspector
    :state-provider="inMemoryStateProvider"
    lifetime="Lost on reload"
    storage-hint="Storage: none — kept in JS memory only"
  />
</template>

<script setup lang="ts">
import {
  Grid,
  ArrayDataProvider,
  InMemoryStateProvider,
  type Column
} from '@einhasad-vue/datatable-vue'
import StateInspector from './StateInspector.vue'

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

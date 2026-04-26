<template>
  <Grid
    :data-provider="localStorageProvider"
    :columns="stateColumns"
  />
  <StateInspector
    :state-provider="localStorageStateProvider"
    lifetime="Survives reload"
    storage-hint="Storage: localStorage['grid-demo-state']"
  />
</template>

<script setup lang="ts">
import {
  Grid,
  ArrayDataProvider,
  LocalStorageStateProvider,
  type Column
} from '@einhasad-vue/datatable-vue'
import StateInspector from './StateInspector.vue'

interface StateUser {
  id: number
  name: string
  email: string
  role: string
  status: string
}

const stateUsers: StateUser[] = [
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

const stateColumns: Column<StateUser>[] = [
  { sort: 'id', label: 'ID', value: (m) => m.id.toString(), filter: { name: 'id', type: 'text' } },
  { sort: 'name', label: 'Name', value: (m) => m.name, filter: { name: 'name', type: 'text' } },
  { sort: 'email', label: 'Email', value: (m) => m.email, filter: { name: 'email', type: 'text' } },
  { sort: 'role', label: 'Role', value: (m) => m.role, filter: { name: 'role', type: 'text' } },
  { sort: 'status', label: 'Status', value: (m) => m.status, filter: { name: 'status', type: 'text' } }
]

const localStorageStateProvider = new LocalStorageStateProvider({ storageKey: 'grid-demo-state' })
const localStorageProvider = new ArrayDataProvider({
  items: stateUsers,
  stateProvider: localStorageStateProvider
})
localStorageProvider.setOffsetPagination({ page: 1, pageSize: 5 })
</script>

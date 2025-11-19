<template>
  <div v-if="selectedUser">
    Selected: {{ selectedUser.name }}
  </div>
  <Grid
    :data-provider="provider"
    :columns="columns"
    :on-row-click="handleRowClick"
    :row-options="getRowOptions"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Grid, ArrayDataProvider, type Column, type RowOptions } from '@grid-vue/grid'

const selectedUser = ref(null)

const users = [
  { id: 1, name: 'John Doe', email: 'john@example.com', active: true },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', active: true },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', active: false },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', active: true }
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
  {
    key: 'active',
    label: 'Status',
    value: (row) => row.active ? 'Active' : 'Inactive'
  }
]

function handleRowClick(user: any) {
  selectedUser.value = user
}

function getRowOptions(user: any): RowOptions {
  return {
    class: {
      'row-clickable': true,
      'row-selected': selectedUser.value?.id === user.id,
      'row-inactive': !user.active
    },
    style: {
      cursor: 'pointer'
    }
  }
}
</script>

<style>
.row-clickable:hover {
  background: #f7fafc !important;
}

.row-selected {
  background: #e6fffa !important;
  border-left: 4px solid #38b2ac !important;
}

.row-inactive {
  opacity: 0.6;
}
</style>

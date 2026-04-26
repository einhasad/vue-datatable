<template>
  <div
    v-if="selectedUser"
    class="demo-selected-info"
  >
    <strong>Selected:</strong> {{ selectedUser.name }} — {{ selectedUser.email }}
  </div>
  <Grid
    :data-provider="rowActionsProvider"
    :columns="rowActionsColumns"
    :on-row-click="handleRowClick"
    :row-options="getRowOptions"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Grid, ArrayDataProvider, type Column, type RowOptions } from '@einhasad-vue/datatable-vue'

const rowActionsUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', active: true },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', active: true },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', active: false },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', active: true },
  { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', active: true },
  { id: 6, name: 'Diana Prince', email: 'diana@example.com', active: false }
]

const rowActionsProvider = new ArrayDataProvider({
  items: rowActionsUsers
})

const selectedUser = ref<any>(null)

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

const rowActionsColumns: Column[] = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  {
    key: 'active',
    label: 'Status',
    component: (row) => ({
      is: 'span',
      props: {
        style: {
          padding: '0.25rem 0.5rem',
          borderRadius: '0.25rem',
          fontSize: '0.875rem',
          fontWeight: 'bold',
          background: row.active ? '#48bb78' : '#cbd5e0',
          color: 'white'
        }
      },
      content: row.active ? 'Active' : 'Inactive'
    })
  }
]
</script>

<style scoped>
:deep(.row-clickable:hover) {
  background: var(--surface-sunk) !important;
}

:deep(.row-selected) {
  background: rgba(255, 200, 51, 0.15) !important;
  border-left: 3px solid var(--accent) !important;
}

:deep(.row-inactive) {
  opacity: 0.6;
}
</style>

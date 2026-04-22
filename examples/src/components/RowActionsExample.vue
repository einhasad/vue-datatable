<template>
  <section id="row-actions" class="section">
    <div>
      <h2>Row Actions Example</h2>

      <div class="example-description">
        <p>
          This example demonstrates interactive rows with click handlers and custom row styling.
          Try clicking on different rows to see the action handler in action.
        </p>
        <div v-if="selectedUser" style="margin-top: 1rem; padding: 1rem; background: #edf2f7; border-radius: 0.375rem;">
          <strong>Selected User:</strong> {{ selectedUser.name }} ({{ selectedUser.email }})
        </div>
      </div>

      <div class="example-section">
        <h3>Demo</h3>
        <Grid
          :data-provider="rowActionsProvider"
          :columns="rowActionsColumns"
          :on-row-click="handleRowClick"
          :row-options="getRowOptions"
        />
      </div>

      <div class="example-section">
        <h3>Code</h3>
        <CodeExample examplePath="/examples/code/RowActionsExample.vue" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Grid, ArrayDataProvider, type Column, type RowOptions } from '@einhasad-vue/datatable-vue'
import CodeExample from './CodeExample.vue'

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

:deep(.row-clickable:hover) {
  background: #f7fafc !important;
}

:deep(.row-selected) {
  background: #e6fffa !important;
  border-left: 4px solid #38b2ac !important;
}

:deep(.row-inactive) {
  opacity: 0.6;
}
</style>

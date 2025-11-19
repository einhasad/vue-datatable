<template>
  <Grid
    :data-provider="provider"
    :columns="columns"
  >
    <template #filters>
      <td
        v-for="column in columns"
        :key="column.key"
        class="grid-filter-cell"
      >
        <input
          v-model="filters[column.key]"
          type="text"
          class="filter-input"
          :placeholder="`Search ${column.label}...`"
          @input="onFilterChange"
        >
      </td>
    </template>
  </Grid>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Grid, ArrayDataProvider, InMemoryStateProvider, type Column } from '@grid-vue/grid'

// Sample dataset
const employees = [
  { id: 1, name: 'Alice Johnson', department: 'Engineering', position: 'Senior Developer', salary: 95000 },
  { id: 2, name: 'Bob Smith', department: 'Marketing', position: 'Marketing Manager', salary: 75000 },
  { id: 3, name: 'Carol Williams', department: 'Engineering', position: 'Tech Lead', salary: 120000 },
  { id: 4, name: 'David Brown', department: 'Sales', position: 'Sales Representative', salary: 65000 },
  { id: 5, name: 'Emma Davis', department: 'HR', position: 'HR Specialist', salary: 60000 },
  { id: 6, name: 'Frank Miller', department: 'Engineering', position: 'Junior Developer', salary: 70000 },
  { id: 7, name: 'Grace Wilson', department: 'Marketing', position: 'Content Writer', salary: 55000 },
  { id: 8, name: 'Henry Moore', department: 'Sales', position: 'Sales Manager', salary: 85000 },
  { id: 9, name: 'Iris Taylor', department: 'Engineering', position: 'DevOps Engineer', salary: 90000 },
  { id: 10, name: 'Jack Anderson', department: 'HR', position: 'Recruiter', salary: 58000 }
]

// Create state provider for managing filter state
const stateProvider = new InMemoryStateProvider()

// Configure ArrayDataProvider with state provider
const provider = new ArrayDataProvider({
  items: employees,
  pagination: true,
  paginationMode: 'page',
  pageSize: 5,
  stateProvider
})

// Reactive filters object
const filters = ref<Record<string, string>>({
  id: '',
  name: '',
  department: '',
  position: '',
  salary: ''
})

// Handle filter changes
const onFilterChange = async () => {
  // Update state provider with filter values
  Object.entries(filters.value).forEach(([key, value]) => {
    if (value.trim()) {
      stateProvider.setFilter(key, value)
    } else {
      stateProvider.clearFilter(key)
    }
  })

  // Refresh data with new filters
  await provider.refresh()
}

const columns: Column[] = [
  { key: 'id', label: 'ID', sortable: true, sort: 'id' },
  { key: 'name', label: 'Name', sortable: true, sort: 'name' },
  { key: 'department', label: 'Department', sortable: true, sort: 'department' },
  { key: 'position', label: 'Position', sortable: true, sort: 'position' },
  { key: 'salary', label: 'Salary ($)', sortable: true, sort: 'salary' }
]
</script>

<style scoped>
.filter-input {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
}

.filter-input:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.1);
}

:deep(.grid-filter-cell) {
  padding: 8px;
  background: #f9f9f9;
}
</style>

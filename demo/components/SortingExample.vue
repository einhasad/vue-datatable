<template>
  <div
    data-qa="select-search"
    style="margin-bottom: 12px;"
  >
    <select
      v-model="sortingSelectValue"
      data-qa="sort-select"
      class="demo-select"
      @change="handleSortingSelect"
    >
      <option value="">Default</option>
      <option value="position-desc">Position Desc</option>
      <option value="position-asc">Position Asc</option>
    </select>
  </div>
  <Grid
    ref="sortingGridRef"
    :data-provider="sortingProvider"
    :columns="sortingColumns"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Grid, ArrayDataProvider, type Column } from '@einhasad-vue/datatable-vue'

const employees = [
  { id: 1, name: 'Alice Johnson', department: 'Engineering', salary: 95000, position: 5 },
  { id: 2, name: 'Bob Smith', department: 'Marketing', salary: 75000, position: 6 },
  { id: 3, name: 'Charlie Brown', department: 'Sales', salary: 82000, position: 7 },
  { id: 4, name: 'Diana Prince', department: 'Engineering', salary: 105000, position: 1 },
  { id: 5, name: 'Ethan Hunt', department: 'Operations', salary: 88000, position: 8 },
  { id: 6, name: 'Fiona Gallagher', department: 'Marketing', salary: 78000, position: 4 },
  { id: 7, name: 'George Miller', department: 'Engineering', salary: 98000, position: 3 },
  { id: 8, name: 'Hannah Montana', department: 'Sales', salary: 85000, position: 2 }
]

const DEFAULT_SORT = { field: 'id', order: 'asc' as const }

const sortingProvider = new ArrayDataProvider({
  items: employees
})
sortingProvider.setSort(DEFAULT_SORT)

const sortingColumns: Column[] = [
  { key: 'id', label: 'ID', sort: 'id' },
  { key: 'name', label: 'Name', sort: 'name' },
  { key: 'department', label: 'Department', sort: 'department' },
  {
    key: 'salary',
    label: 'Salary',
    sort: 'salary',
    value: (row) => `$${row.salary.toLocaleString()}`
  }
]

const sortingSelectValue = ref('')
const sortingGridRef = ref<any>(null)

function handleSortingSelect() {
  const value = sortingSelectValue.value
  if (value === 'position-desc') {
    sortingProvider.setSort({ field: 'position', order: 'desc' })
  } else if (value === 'position-asc') {
    sortingProvider.setSort({ field: 'position', order: 'asc' })
  } else {
    sortingProvider.setSort(DEFAULT_SORT)
  }
}
</script>

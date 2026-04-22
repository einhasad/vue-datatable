<template>
  <section id="sorting" class="section">
    <div>
      <h2>Sorting Example</h2>

      <div class="example-description">
        <p>
          Click on column headers to sort the data. Columns with the 'sort' property enabled
          will display sort indicators and allow users to toggle between ascending and descending order.
        </p>
      </div>

      <div class="example-section">
        <h3>Demo</h3>
        <div
          ref="sortingSelectWrapperRef"
          data-qa="select-search"
        >
          <select
            v-model="sortingSelectValue"
            class="sort-select"
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
      </div>

      <div class="example-section">
        <h3>Code</h3>
        <CodeExample examplePath="/examples/code/SortingExample.vue" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Grid, ArrayDataProvider, type Column } from '@einhasad-vue/datatable-vue'
import CodeExample from './CodeExample.vue'

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

const sortingProvider = new ArrayDataProvider({
  items: employees
})
sortingProvider.setSort('id', 'asc')

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
const sortingSelectWrapperRef = ref<HTMLElement | null>(null)
const sortingGridRef = ref<any>(null)

async function handleSortingSelect(e: Event) {
  const event = e as CustomEvent & { value?: string }
  const value = event.detail?.value ?? (event as any).value
  if (value === 'position-desc') {
    sortingProvider.setSort('position', 'desc')
    if (sortingGridRef.value) {
      sortingGridRef.value.items = sortingProvider.getCurrentItems()
    }
  } else if (value === 'position-asc') {
    sortingProvider.setSort('position', 'asc')
    if (sortingGridRef.value) {
      sortingGridRef.value.items = sortingProvider.getCurrentItems()
    }
  }
}

onMounted(() => {
  if (sortingSelectWrapperRef.value) {
    sortingSelectWrapperRef.value.addEventListener('select', handleSortingSelect)
  }
})

onUnmounted(() => {
  if (sortingSelectWrapperRef.value) {
    sortingSelectWrapperRef.value.removeEventListener('select', handleSortingSelect)
  }
})
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

.sort-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--grid-border-color, #cbd5e0);
  border-radius: 0.375rem;
  font-size: 0.9rem;
  color: var(--grid-input-color, #2d3748);
  background: var(--grid-input-bg, white);
  margin-bottom: 1rem;
}

.sort-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}
</style>

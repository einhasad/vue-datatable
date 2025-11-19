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
        <ClientOnly>
          <Grid :data-provider="sortingProvider"
            :columns="sortingColumns"
          />
        </ClientOnly>
      </div>

      <div class="example-section">
        <h3>Code</h3>
        <pre class="code-block"><code>&lt;script setup lang="ts"&gt;
import { Grid, ArrayDataProvider, type Column } from '@grid-vue/grid'

const employees = [
  { id: 1, name: 'Alice Johnson', department: 'Engineering', salary: 95000 },
  { id: 2, name: 'Bob Smith', department: 'Marketing', salary: 75000 },
  { id: 3, name: 'Charlie Brown', department: 'Sales', salary: 82000 },
  { id: 4, name: 'Diana Prince', department: 'Engineering', salary: 105000 },
  { id: 5, name: 'Ethan Hunt', department: 'Operations', salary: 88000 },
  { id: 6, name: 'Fiona Gallagher', department: 'Marketing', salary: 78000 },
  { id: 7, name: 'George Miller', department: 'Engineering', salary: 98000 },
  { id: 8, name: 'Hannah Montana', department: 'Sales', salary: 85000 }
]

const provider = new ArrayDataProvider({
  items: employees,
  pagination: false,
  paginationMode: 'cursor'
})

// Add 'sort' property to enable sorting on columns
const columns: Column[] = [
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
&lt;/script&gt;</code></pre>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Grid, ArrayDataProvider, type Column } from '@grid-vue/grid'
import '@grid-vue/grid/style.css'

const employees = [
  { id: 1, name: 'Alice Johnson', department: 'Engineering', salary: 95000 },
  { id: 2, name: 'Bob Smith', department: 'Marketing', salary: 75000 },
  { id: 3, name: 'Charlie Brown', department: 'Sales', salary: 82000 },
  { id: 4, name: 'Diana Prince', department: 'Engineering', salary: 105000 },
  { id: 5, name: 'Ethan Hunt', department: 'Operations', salary: 88000 },
  { id: 6, name: 'Fiona Gallagher', department: 'Marketing', salary: 78000 },
  { id: 7, name: 'George Miller', department: 'Engineering', salary: 98000 },
  { id: 8, name: 'Hannah Montana', department: 'Sales', salary: 85000 }
]

const sortingProvider = new ArrayDataProvider({
  items: employees,
  pagination: false,
  paginationMode: 'cursor'
})

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
</script>

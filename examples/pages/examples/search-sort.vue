<template>
  <section id="search-sort" class="section">
    <div>
      <h2>Inline Search & Sort Example</h2>

      <div class="example-description">
        <p>
          This example demonstrates <strong>inline search and sort</strong> functionality.
          Each column header includes a search input field, allowing you to filter data
          in real-time. Click on column headers to sort, and type in the search boxes
          to filter results.
        </p>
      </div>

      <div class="example-section">
        <h3>Demo</h3>
        <ClientOnly>
        <Grid :data-provider="searchSortProvider"
          :columns="searchSortColumns"
        >
          <template #filters>
            <td
              v-for="column in searchSortColumns"
              :key="column.key"
              class="grid-filter-cell"
            >
              <input
                v-if="column.key !== 'actions'"
                v-model="searchFilters[column.key]"
                type="text"
                class="filter-input"
                :placeholder="`Search ${column.label || column.key}...`"
                @input="onSearchFilterChange"
              >
            </td>
          </template>
        </Grid>
        </ClientOnly>
      </div>

      <div class="example-section">
        <h3>Code</h3>
        <pre class="code-block"><code>&lt;template&gt;
  &lt;Grid
    :data-provider="provider"
    :columns="columns"
  &gt;
    &lt;template #filters&gt;
      &lt;td
        v-for="column in columns"
        :key="column.key"
        class="grid-filter-cell"
      &gt;
        &lt;input
          v-model="filters[column.key]"
          type="text"
          class="filter-input"
          :placeholder="\`Search \${column.label}...\`"
          @input="onFilterChange"
        &gt;
      &lt;/td&gt;
    &lt;/template&gt;
  &lt;/Grid&gt;
&lt;/template&gt;

&lt;script setup lang="ts"&gt;
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
const filters = ref&lt;Record&lt;string, string&gt;&gt;({
  id: '',
  name: '',
  department: '',
  position: '',
  salary: ''
})

// Handle filter changes
const onFilterChange = async () =&gt; {
  // Update state provider with filter values
  Object.entries(filters.value).forEach(([key, value]) =&gt; {
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
&lt;/script&gt;

&lt;style scoped&gt;
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
&lt;/style&gt;</code></pre>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Grid, ArrayDataProvider, InMemoryStateProvider, type Column } from '@grid-vue/grid'
import '@grid-vue/grid/style.css'

const searchSortEmployees = [
  { id: 1, name: 'Alice Johnson', department: 'Engineering', position: 'Senior Developer', salary: 95000 },
  { id: 2, name: 'Bob Smith', department: 'Marketing', position: 'Marketing Manager', salary: 75000 },
  { id: 3, name: 'Carol Williams', department: 'Engineering', position: 'Tech Lead', salary: 120000 },
  { id: 4, name: 'David Brown', department: 'Sales', position: 'Sales Representative', salary: 65000 },
  { id: 5, name: 'Emma Davis', department: 'HR', position: 'HR Specialist', salary: 60000 },
  { id: 6, name: 'Frank Miller', department: 'Engineering', position: 'Junior Developer', salary: 70000 },
  { id: 7, name: 'Grace Wilson', department: 'Marketing', position: 'Content Writer', salary: 55000 },
  { id: 8, name: 'Henry Moore', department: 'Sales', position: 'Sales Manager', salary: 85000 },
  { id: 9, name: 'Iris Taylor', department: 'Engineering', position: 'DevOps Engineer', salary: 90000 },
  { id: 10, name: 'Jack Anderson', department: 'HR', position: 'Recruiter', salary: 58000 },
  { id: 11, name: 'Karen Thomas', department: 'Marketing', position: 'Social Media Manager', salary: 62000 },
  { id: 12, name: 'Larry Jackson', department: 'Engineering', position: 'Full Stack Developer', salary: 98000 },
  { id: 13, name: 'Megan White', department: 'Sales', position: 'Account Executive', salary: 72000 },
  { id: 14, name: 'Nathan Harris', department: 'Engineering', position: 'Backend Developer', salary: 92000 },
  { id: 15, name: 'Olivia Martin', department: 'HR', position: 'HR Manager', salary: 82000 }
]

const searchSortStateProvider = new InMemoryStateProvider()

const searchSortProvider = new ArrayDataProvider({
  items: searchSortEmployees,
  pagination: true,
  paginationMode: 'page',
  pageSize: 5,
  stateProvider: searchSortStateProvider
})

const searchFilters = ref<Record<string, string>>({
  id: '',
  name: '',
  department: '',
  position: '',
  salary: ''
})

const onSearchFilterChange = async () => {
  Object.entries(searchFilters.value).forEach(([key, value]) => {
    if (value.trim()) {
      searchSortStateProvider.setFilter(key, value)
    } else {
      searchSortStateProvider.clearFilter(key)
    }
  })

  await searchSortProvider.refresh()
}

const searchSortColumns: Column[] = [
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

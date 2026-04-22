<template>
  <section id="search-sort" class="section">
    <div>
      <h2>Sorting Example</h2>

      <div class="example-description">
        <p>
          This example demonstrates <strong>sorting functionality</strong> with hidden field search
          and column-level filters. Use the search box to filter by email (not displayed in table),
          or use the column-specific filters for targeted searches.
        </p>
      </div>

      <div class="example-section">
        <h3>Search & Filters</h3>
        <div class="controls">
          <div class="control-group">
            <label for="global-search">Search by Email:</label>
            <input
              id="global-search"
              :value="globalSearchQuery"
              type="text"
              placeholder="Search by email..."
              class="search-input"
              @input="handleGlobalSearchInput"
            />
          </div>
        </div>
      </div>

      <div class="example-section">
        <h3>Demo</h3>
        <Grid
          ref="searchSortGridRef"
          :data-provider="searchSortProvider"
          :columns="searchSortColumns"
        />
      </div>

      <div class="example-section">
        <h3>Code</h3>
        <CodeExample examplePath="/examples/code/SearchSortExample.vue" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  Grid,
  ArrayDataProvider,
  InMemoryStateProvider,
  type Column
} from '@einhasad-vue/datatable-vue'
import CodeExample from './CodeExample.vue'

const searchSortEmployees = [
  { id: 6, name: 'Alice Johnson', email: 'alice@example.com', department: 'Engineering', position: 'Tech Lead', salary: 100000 },
  { id: 1, name: 'Jon Doe', email: 'jon.doe@example.com', department: 'Engineering', position: 'Developer', salary: 90000 },
  { id: 2, name: 'Jon Smith', email: 'jon.smith@example.com', department: 'Marketing', position: 'Manager', salary: 85000 },
  { id: 3, name: 'Jon Williams', email: 'jon.williams@example.com', department: 'Sales', position: 'Lead', salary: 80000 },
  { id: 4, name: 'Jon Brown', email: 'jon.brown@example.com', department: 'HR', position: 'Specialist', salary: 70000 },
  { id: 5, name: 'Jon Davis', email: 'jon.davis@example.com', department: 'Engineering', position: 'Senior Dev', salary: 95000 },
  { id: 7, name: 'Bob Martin', email: 'bob@example.com', department: 'Marketing', position: 'Director', salary: 110000 },
  { id: 8, name: 'Carol White', email: 'carol@example.com', department: 'Sales', position: 'Rep', salary: 65000 },
  { id: 9, name: 'David Lee', email: 'david@example.com', department: 'HR', position: 'Manager', salary: 85000 },
  { id: 20, name: 'Emma Wilson', email: 'emma@example.com', department: 'Engineering', position: 'DevOps', salary: 92000 },
  { id: 22, name: 'Frank Miller', email: 'frank@example.com', department: 'Marketing', position: 'Analyst', salary: 72000 },
  { id: 23, name: 'Grace Taylor', email: 'grace@example.com', department: 'Sales', position: 'Executive', salary: 78000 },
  { id: 24, name: 'Henry Anderson', email: 'henry@example.com', department: 'HR', position: 'Recruiter', salary: 68000 },
  { id: 34, name: 'Quinn Young', email: 'quinn@example.com', department: 'Engineering', position: 'Architect', salary: 120000 },
  { id: 25, name: 'Ivy Thomas', email: 'ivy@company.com', department: 'Engineering', position: 'QA', salary: 75000 },
  { id: 26, name: 'Jack Robinson', email: 'jack@company.com', department: 'Marketing', position: 'Writer', salary: 60000 },
  { id: 27, name: 'Karen Clark', email: 'karen@company.com', department: 'Sales', position: 'Manager', salary: 88000 },
  { id: 28, name: 'Leo Rodriguez', email: 'leo@company.com', department: 'HR', position: 'Coordinator', salary: 55000 },
  { id: 29, name: 'Mia Lewis', email: 'mia@company.com', department: 'Engineering', position: 'Junior Dev', salary: 65000 },
  { id: 30, name: 'Nathan Lee', email: 'nathan@company.com', department: 'Marketing', position: 'Designer', salary: 70000 },
  { id: 32, name: 'Olivia Walker', email: 'olivia@company.com', department: 'Sales', position: 'Support', salary: 50000 },
  { id: 33, name: 'Peter Hall', email: 'peter@company.com', department: 'HR', position: 'Trainer', salary: 62000 }
]

const searchSortStateProvider = new InMemoryStateProvider()

const searchSortProvider = new ArrayDataProvider({
  items: searchSortEmployees,
  stateProvider: searchSortStateProvider
})

const searchSortGridRef = ref<any>(null)
const globalSearchQuery = ref('')

const searchSortColumns: Column[] = [
  { sort: 'id', label: 'ID', filter: { name: 'id', type: 'text' } },
  { sort: 'name', label: 'Name', filter: { name: 'name', type: 'text' } },
  { sort: 'department', label: 'Department', filter: { name: 'department', type: 'text' } },
  { sort: 'position', label: 'Position', filter: { name: 'position', type: 'text' } },
  { sort: 'salary', label: 'Salary ($)', filter: { name: 'salary', type: 'text' } }
]

const handleGlobalSearchInput = async (event: Event) => {
  const value = (event.target as HTMLInputElement).value
  globalSearchQuery.value = value

  if (value.trim()) {
    const query = value.toLowerCase()
    const filtered = searchSortEmployees.filter(emp =>
      emp.email.toLowerCase().includes(query)
    )
    searchSortProvider.setAllItems(filtered)
  } else {
    searchSortProvider.setAllItems(searchSortEmployees)
  }

  // Clear column filters when using global search
  ;['id', 'name', 'department', 'position', 'salary'].forEach(key => {
    searchSortStateProvider.clearFilter(key)
  })

  if (searchSortGridRef.value) {
    searchSortGridRef.value.items = searchSortProvider.getCurrentItems()
  }
}
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

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 200px;
  flex: 1;
}

.control-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #4a5568;
}

.search-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--grid-border-color, #cbd5e0);
  border-radius: 0.375rem;
  font-size: 0.9rem;
  color: var(--grid-input-color, #2d3748);
  background: var(--grid-input-bg, white);
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}
</style>

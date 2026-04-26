<template>
  <div class="demo-controls">
    <div class="demo-control-group">
      <label for="global-search">Search by Email:</label>
      <input
        id="global-search"
        :value="globalSearchQuery"
        type="text"
        placeholder="Search by email..."
        class="demo-input"
        @input="handleGlobalSearchInput"
      />
    </div>
  </div>
  <Grid
    ref="searchSortGridRef"
    :data-provider="searchSortProvider"
    :columns="searchSortColumns"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  Grid,
  ArrayDataProvider,
  InMemoryStateProvider,
  type Column
} from '@einhasad-vue/datatable-vue'

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

  ;['id', 'name', 'department', 'position', 'salary'].forEach(key => {
    searchSortStateProvider.clearFilter(key)
  })
}
</script>

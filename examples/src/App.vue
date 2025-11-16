<template>
  <div class="app">
    <header class="header">
      <div class="header-content">
        <h1>Grid Vue</h1>
        <p class="tagline">A flexible, configurable grid component library for Vue 3</p>
      </div>
    </header>

    <div class="layout">
      <!-- Left Sidebar Menu -->
      <aside class="sidebar">
        <nav class="nav">
          <a href="#introduction" :class="['nav-link', { active: activeSection === 'introduction' }]" @click="scrollToSection">Introduction</a>
          <a href="#basic" :class="['nav-link', { active: activeSection === 'basic' }]" @click="scrollToSection">Basic Example</a>
          <div class="nav-section">
            <span class="nav-section-title">Data Providers</span>
            <a href="#array-provider" :class="['nav-link', 'nav-sub-link', { active: activeSection === 'array-provider' }]" @click="scrollToSection">Array Provider</a>
            <a href="#http-provider" :class="['nav-link', 'nav-sub-link', { active: activeSection === 'http-provider' }]" @click="scrollToSection">HTTP Provider</a>
          </div>
          <div class="nav-section">
            <span class="nav-section-title">State Providers</span>
            <a href="#state-inmemory" :class="['nav-link', 'nav-sub-link', { active: activeSection === 'state-inmemory' }]" @click="scrollToStateProvider('inmemory')">InMemory</a>
            <a href="#state-localstorage" :class="['nav-link', 'nav-sub-link', { active: activeSection === 'state-localstorage' }]" @click="scrollToStateProvider('localstorage')">LocalStorage</a>
          </div>
          <a href="#page-pagination" :class="['nav-link', { active: activeSection === 'page-pagination' }]" @click="scrollToSection">Page Pagination</a>
          <a href="#cursor-pagination" :class="['nav-link', { active: activeSection === 'cursor-pagination' }]" @click="scrollToSection">Cursor Pagination</a>
          <a href="#sorting" :class="['nav-link', { active: activeSection === 'sorting' }]" @click="scrollToSection">Sorting</a>
          <a href="#search-sort" :class="['nav-link', { active: activeSection === 'search-sort' }]" @click="scrollToSection">Search & Sort</a>
          <a href="#custom-columns" :class="['nav-link', { active: activeSection === 'custom-columns' }]" @click="scrollToSection">Custom Columns</a>
          <a href="#row-actions" :class="['nav-link', { active: activeSection === 'row-actions' }]" @click="scrollToSection">Row Actions</a>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="main">
        <div class="content">
          <!-- Introduction Section -->
          <section id="introduction" class="section">
            <div class="hero">
              <h2>Welcome to Grid Vue Examples</h2>
              <p>
                Explore interactive examples demonstrating the features and capabilities of Grid Vue,
                a flexible and configurable grid component library for Vue 3 applications.
              </p>
            </div>

            <div class="example-section">
              <h3>Features</h3>
              <ul class="feature-list">
                <li>Dual Pagination Modes: Cursor-based (Load More) and page-based (1, 2, 3...)</li>
                <li>Data Provider Pattern: Pluggable data sources (HTTP, Array, custom)</li>
                <li>State Provider Pattern: Pluggable state management (URL, localStorage, hash, in-memory)</li>
                <li>Framework Agnostic: No dependencies on UI frameworks</li>
                <li>TypeScript First: Full TypeScript support</li>
                <li>Customizable: Extensive props, slots, and CSS custom properties</li>
                <li>Sorting: Built-in column sorting support</li>
                <li>Footer Row: Calculations and aggregations</li>
                <li>Row & Cell Options: Custom classes, styles, and attributes</li>
                <li>Dynamic Components: Render custom components in cells</li>
              </ul>
            </div>

            <div class="example-section">
              <h3>Installation</h3>
              <div class="code-block">npm install @grid-vue/grid</div>
              <p>Then import the CSS in your main entry file:</p>
              <div class="code-block">import '@grid-vue/grid/style.css'</div>
            </div>

            <div class="example-section">
              <h3>Quick Links</h3>
              <div class="actions">
                <a href="https://github.com/einhasad/vue-datatable" target="_blank" class="btn">
                  View on GitHub
                </a>
                <a href="https://www.npmjs.com/package/@grid-vue/grid" target="_blank" class="btn btn-secondary">
                  View on npm
                </a>
              </div>
            </div>
          </section>

          <!-- Basic Example Section -->
          <section id="basic" class="section">
            <div>
              <h2>Basic Example</h2>

              <div class="example-notice">
                <strong>Living Documentation:</strong> This example is generated from
                <code>__tests__/examples/basicExample.ts</code> - the code you see here is tested and guaranteed to work.
              </div>

              <div class="example-description">
                <p>
                  This example demonstrates the most basic usage of Grid Vue with an ArrayDataProvider.
                  The grid displays static data without pagination, showing how simple it is to get started.
                </p>
              </div>

              <div class="example-section">
                <h3>Demo</h3>
                <Grid
                  :data-provider="basicProvider"
                  :columns="basicColumns"
                />
              </div>

              <div class="example-section">
                <h3>Code</h3>
                <pre class="code-block"><code>&lt;template&gt;
  &lt;Grid
    :data-provider="provider"
    :columns="columns"
  /&gt;
&lt;/template&gt;

&lt;script setup lang="ts"&gt;
import { Grid, ArrayDataProvider, type Column } from '@grid-vue/grid'

const users = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Editor' },
  { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', role: 'User' }
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
  { key: 'role', label: 'Role' }
]
&lt;/script&gt;</code></pre>
              </div>
            </div>
          </section>

          <!-- Array Provider Section -->
          <section id="array-provider" class="section">
            <div>
              <h2>Array Provider Example</h2>

              <div class="example-notice">
                <strong>Living Documentation:</strong> This example is generated from
                <code>__tests__/examples/arrayProviderExample.ts</code> - the code you see here is tested and guaranteed to work.
              </div>

              <div class="example-description">
                <p>
                  The <strong>ArrayDataProvider</strong> is perfect for working with static, in-memory data.
                  It supports client-side pagination, sorting, and filtering without requiring a backend API.
                  This example demonstrates its key features including page-based pagination and sorting capabilities.
                </p>
              </div>

              <div class="example-section">
                <h3>Key Features</h3>
                <ul class="feature-list">
                  <li><strong>Client-side pagination:</strong> No server requests needed</li>
                  <li><strong>Sorting:</strong> Click column headers to sort data</li>
                  <li>In-memory processing: Fast performance for small to medium datasets</li>
                  <li>Simple configuration: Just pass an array and options</li>
                </ul>
              </div>

              <div class="example-section">
                <h3>Demo</h3>
                <Grid
                  :data-provider="arrayProvider"
                  :columns="arrayColumns"
                />
              </div>

              <div class="example-section">
                <h3>Code</h3>
                <pre class="code-block"><code>&lt;template&gt;
  &lt;Grid
    :data-provider="provider"
    :columns="columns"
  /&gt;
&lt;/template&gt;

&lt;script setup lang="ts"&gt;
import { Grid, ArrayDataProvider, type Column } from '@grid-vue/grid'

const products = [
  { id: 1, name: 'Laptop Pro', category: 'Electronics', price: 1299, stock: 45 },
  { id: 2, name: 'Wireless Mouse', category: 'Accessories', price: 29, stock: 150 },
  { id: 3, name: 'USB-C Cable', category: 'Accessories', price: 15, stock: 200 },
  { id: 4, name: 'Monitor 27"', category: 'Electronics', price: 399, stock: 30 },
  { id: 5, name: 'Keyboard Mechanical', category: 'Accessories', price: 129, stock: 75 },
  { id: 6, name: 'Webcam HD', category: 'Electronics', price: 79, stock: 60 },
  { id: 7, name: 'Desk Lamp', category: 'Office', price: 45, stock: 90 },
  { id: 8, name: 'Office Chair', category: 'Office', price: 299, stock: 25 },
  { id: 9, name: 'Headphones', category: 'Electronics', price: 199, stock: 40 },
  { id: 10, name: 'Tablet Stand', category: 'Accessories', price: 35, stock: 100 }
]

const provider = new ArrayDataProvider({
  items: products,
  pagination: true,
  paginationMode: 'page',
  pageSize: 5
})

const columns: Column[] = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'name', label: 'Product Name', sortable: true },
  { key: 'category', label: 'Category', sortable: true },
  { key: 'price', label: 'Price ($)', sortable: true },
  { key: 'stock', label: 'Stock', sortable: true }
]
&lt;/script&gt;</code></pre>
              </div>
            </div>
          </section>

          <!-- HTTP Provider Section -->
          <section id="http-provider" class="section">
            <div>
              <h2>HTTP Provider Example</h2>

              <div class="example-description">
                <p>
                  The <strong>HttpDataProvider</strong> is designed for fetching data from REST APIs.
                  It supports both cursor-based and page-based pagination, custom HTTP clients, response adapters,
                  and automatic URL parameter management. This example shows how to configure it with a mock HTTP client
                  to simulate API responses.
                </p>
              </div>

              <div class="example-section">
                <h3>Demo</h3>
                <Grid
                  :data-provider="httpProvider"
                  :columns="httpColumns"
                />
              </div>

              <div class="example-section">
                <h3>Code</h3>
                <pre class="code-block"><code>&lt;template&gt;
  &lt;Grid
    :data-provider="provider"
    :columns="columns"
  /&gt;
&lt;/template&gt;

&lt;script setup lang="ts"&gt;
import { Grid, HttpDataProvider, type Column, type ResponseAdapter } from '@grid-vue/grid'

// Custom response adapter for your API format
const customAdapter: ResponseAdapter = {
  extractItems: (response) => response.data || [],
  extractPagination: (response) => ({
    currentPage: response.page || 1,
    pageCount: response.totalPages || 1,
    pageSize: response.pageSize || 10,
    totalCount: response.total || 0
  }),
  isSuccess: (response) => response.success === true,
  getErrorMessage: (response) => response.error || 'Unknown error'
}

// Mock HTTP client that simulates API responses
const mockHttpClient = async (url: string) => {
  await new Promise(resolve => setTimeout(resolve, 500)) // Simulate network delay

  const mockUsers = [
    { id: 1, username: 'alice_smith', email: 'alice@company.com', status: 'Active' },
    { id: 2, username: 'bob_jones', email: 'bob@company.com', status: 'Active' },
    { id: 3, username: 'charlie_brown', email: 'charlie@company.com', status: 'Inactive' },
    { id: 4, username: 'diana_prince', email: 'diana@company.com', status: 'Active' },
    { id: 5, username: 'edward_norton', email: 'edward@company.com', status: 'Active' }
  ]

  return {
    success: true,
    data: mockUsers,
    page: 1,
    totalPages: 1,
    pageSize: 10,
    total: mockUsers.length
  }
}

// Configure HttpDataProvider
const provider = new HttpDataProvider({
  url: '/api/users',
  pagination: true,
  paginationMode: 'page',
  pageSize: 10,
  httpClient: mockHttpClient,
  responseAdapter: customAdapter,
  headers: {
    'Authorization': 'Bearer token123'
  }
})

const columns: Column[] = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'username', label: 'Username', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'status', label: 'Status', sortable: true }
]
&lt;/script&gt;</code></pre>
              </div>

              <div class="example-section">
                <h3>Real-World Example</h3>
                <pre class="code-block"><code>// Using with a real API endpoint
import axios from 'axios'

const provider = new HttpDataProvider({
  url: 'https://api.example.com/users',
  pagination: true,
  paginationMode: 'page',
  pageSize: 20,
  httpClient: async (url) => {
    const response = await axios.get(url)
    return response.data
  },
  responseAdapter: customAdapter,
  headers: {
    'Authorization': `Bearer ${authToken}`
  }
})</code></pre>
              </div>
            </div>
          </section>

          <!-- State Providers Section -->
          <section id="state-providers" class="section">
            <div>
              <h2>State Providers</h2>
              <p>
                State Providers manage grid state (filters, sorting, pagination) independently from data fetching.
                This separation allows you to choose where and how state is persisted.
              </p>

              <div class="tabs">
                <button
                  v-for="tab in stateTabs"
                  :key="tab.id"
                  :class="['tab', { active: stateActiveTab === tab.id }]"
                  @click="stateActiveTab = tab.id"
                >
                  {{ tab.label }}
                </button>
              </div>

              <div class="tab-content">
                <!-- InMemory State Provider -->
                <div v-if="stateActiveTab === 'inmemory'" class="example">
                  <h3>InMemoryStateProvider</h3>
                  <p>
                    Stores state in memory. State is lost on page refresh. Useful for temporary filtering/sorting or testing.
                  </p>
                  <div class="grid-container">
                    <Grid :data-provider="inMemoryProvider" :columns="stateColumns" />
                  </div>
                  <div class="code-example">
                    <h4>Code Example:</h4>
                    <pre><code>import { ArrayDataProvider, InMemoryStateProvider } from '@grid-vue/grid'

const stateProvider = new InMemoryStateProvider()

const provider = new ArrayDataProvider({
  items: users,
  pagination: true,
  paginationMode: 'page',
  pageSize: 5,
  stateProvider
})</code></pre>
                  </div>
                </div>

                <!-- LocalStorage State Provider -->
                <div v-if="stateActiveTab === 'localstorage'" class="example">
                  <h3>LocalStorageStateProvider</h3>
                  <p>
                    Stores state in browser localStorage. State persists across page refreshes and browser sessions.
                    Useful for preserving user preferences.
                  </p>
                  <p class="info">
                    Try filtering or sorting, then refresh the page - your preferences will be restored!
                  </p>
                  <div class="grid-container">
                    <Grid :data-provider="localStorageProvider" :columns="stateColumns" />
                  </div>
                  <div class="code-example">
                    <h4>Code Example:</h4>
                    <pre><code>import { ArrayDataProvider, LocalStorageStateProvider } from '@grid-vue/grid'

const stateProvider = new LocalStorageStateProvider({
  storageKey: 'my-grid-state' // default: 'grid-state'
})

const provider = new ArrayDataProvider({
  items: users,
  pagination: true,
  paginationMode: 'page',
  pageSize: 5,
  stateProvider
})</code></pre>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Page Pagination Section -->
          <section id="page-pagination" class="section">
            <div>
              <h2>Page Pagination Example</h2>

              <div class="example-description">
                <p>
                  This example shows traditional page-based pagination with page numbers.
                  Users can navigate between pages using Previous, Next, and numbered page buttons.
                </p>
              </div>

              <div class="example-section">
                <h3>Demo</h3>
                <Grid
                  :data-provider="pagePaginationProvider"
                  :columns="pagePaginationColumns"
                />
              </div>

              <div class="example-section">
                <h3>Code</h3>
                <pre class="code-block"><code>&lt;script setup lang="ts"&gt;
import { Grid, ArrayDataProvider, type Column } from '@grid-vue/grid'

// Generate sample data
const users = Array.from({ length: 47 }, (_, i) => ({
  id: i + 1,
  name: \`User \${i + 1}\`,
  email: \`user\${i + 1}@example.com\`,
  status: ['Active', 'Inactive'][i % 2]
}))

const provider = new ArrayDataProvider({
  items: users,
  pagination: true,
  paginationMode: 'page',
  pageSize: 10
})

const columns: Column[] = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'status', label: 'Status' }
]
&lt;/script&gt;</code></pre>
              </div>
            </div>
          </section>

          <!-- Cursor Pagination Section -->
          <section id="cursor-pagination" class="section">
            <div>
              <h2>Cursor Pagination Example</h2>

              <div class="example-description">
                <p>
                  This example demonstrates cursor-based pagination with a "Load More" button.
                  This pattern is ideal for infinite scroll implementations and mobile-friendly interfaces.
                </p>
              </div>

              <div class="example-section">
                <h3>Demo</h3>
                <Grid
                  :data-provider="cursorPaginationProvider"
                  :columns="cursorPaginationColumns"
                />
              </div>

              <div class="example-section">
                <h3>Code</h3>
                <pre class="code-block"><code>&lt;script setup lang="ts"&gt;
import { Grid, ArrayDataProvider, type Column } from '@grid-vue/grid'

// Generate sample data
const products = Array.from({ length: 35 }, (_, i) => ({
  id: i + 1,
  name: \`Product \${i + 1}\`,
  price: \`$\${(Math.random() * 100 + 10).toFixed(2)}\`,
  category: ['Electronics', 'Clothing', 'Books', 'Home'][i % 4]
}))

const provider = new ArrayDataProvider({
  items: products,
  pagination: true,
  paginationMode: 'cursor',
  pageSize: 8
})

const columns: Column[] = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Product Name' },
  { key: 'price', label: 'Price' },
  { key: 'category', label: 'Category' }
]
&lt;/script&gt;</code></pre>
              </div>
            </div>
          </section>

          <!-- Sorting Section -->
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
                <Grid
                  :data-provider="sortingProvider"
                  :columns="sortingColumns"
                />
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
    value: (row) => \`$\${row.salary.toLocaleString()}\`
  }
]
&lt;/script&gt;</code></pre>
              </div>
            </div>
          </section>

          <!-- Search & Sort Section -->
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
                <Grid
                  :data-provider="searchSortProvider"
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

          <!-- Custom Columns Section -->
          <section id="custom-columns" class="section">
            <div>
              <h2>Custom Columns Example</h2>

              <div class="example-description">
                <p>
                  This example shows how to customize column rendering using the 'value' and 'component' properties.
                  You can format data, add badges, buttons, and any custom content.
                </p>
              </div>

              <div class="example-section">
                <h3>Demo</h3>
                <Grid
                  :data-provider="customColumnsProvider"
                  :columns="customColumnsColumns"
                />
              </div>

              <div class="example-section">
                <h3>Code</h3>
                <pre class="code-block"><code>&lt;script setup lang="ts"&gt;
import { Grid, ArrayDataProvider, type Column } from '@grid-vue/grid'

const tasks = [
  { id: 1, title: 'Update documentation', priority: 'high', status: 'completed', progress: 100 },
  { id: 2, title: 'Fix login bug', priority: 'critical', status: 'in_progress', progress: 75 },
  { id: 3, title: 'Add dark mode', priority: 'medium', status: 'in_progress', progress: 40 },
  { id: 4, title: 'Optimize performance', priority: 'low', status: 'pending', progress: 0 },
  { id: 5, title: 'Write tests', priority: 'high', status: 'in_progress', progress: 60 }
]

const provider = new ArrayDataProvider({
  items: tasks,
  pagination: false,
  paginationMode: 'cursor'
})

const columns: Column[] = [
  { key: 'id', label: 'ID' },
  { key: 'title', label: 'Task' },
  {
    key: 'priority',
    label: 'Priority',
    component: (row) => ({
      is: 'span',
      props: {
        style: {
          padding: '0.25rem 0.5rem',
          borderRadius: '0.25rem',
          fontSize: '0.875rem',
          fontWeight: 'bold',
          background: getPriorityColor(row.priority),
          color: 'white'
        }
      },
      content: row.priority.toUpperCase()
    })
  },
  {
    key: 'status',
    label: 'Status',
    value: (row) => row.status.replace('_', ' ').toUpperCase()
  },
  {
    key: 'progress',
    label: 'Progress',
    component: (row) => ({
      is: 'div',
      props: { style: { width: '100%' } },
      children: [
        {
          is: 'div',
          props: {
            style: {
              width: '100%',
              height: '20px',
              background: '#e2e8f0',
              borderRadius: '10px',
              overflow: 'hidden'
            }
          },
          children: [
            {
              is: 'div',
              props: {
                style: {
                  width: row.progress + '%',
                  height: '100%',
                  background: '#667eea',
                  transition: 'width 0.3s'
                }
              }
            }
          ]
        },
        {
          is: 'span',
          props: {
            style: {
              fontSize: '0.75rem',
              color: '#4a5568',
              marginTop: '0.25rem',
              display: 'block'
            }
          },
          content: row.progress + '%'
        }
      ]
    })
  }
]

function getPriorityColor(priority: string) {
  const colors = {
    critical: '#e53e3e',
    high: '#dd6b20',
    medium: '#d69e2e',
    low: '#38a169'
  }
  return colors[priority] || '#718096'
}
&lt;/script&gt;</code></pre>
              </div>
            </div>
          </section>

          <!-- Row Actions Section -->
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
                <pre class="code-block" v-pre><code>&lt;template&gt;
  &lt;div v-if="selectedUser"&gt;
    Selected: {{ selectedUser.name }}
  &lt;/div&gt;
  &lt;Grid
    :data-provider="provider"
    :columns="columns"
    :on-row-click="handleRowClick"
    :row-options="getRowOptions"
  /&gt;
&lt;/template&gt;

&lt;script setup lang="ts"&gt;
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
  console.log('Row clicked:', user)
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
&lt;/script&gt;

&lt;style&gt;
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
&lt;/style&gt;</code></pre>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>

    <footer class="footer">
      <div class="footer-content">
        <p>
          <a href="https://github.com/einhasad/vue-datatable" target="_blank">GitHub</a> •
          <a href="https://www.npmjs.com/package/@grid-vue/grid" target="_blank">npm</a>
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Grid, ArrayDataProvider, HttpDataProvider, InMemoryStateProvider, LocalStorageStateProvider, type Column, type ResponseAdapter, type RowOptions } from '@grid-vue/grid'

const activeSection = ref('introduction')
const stateProviderTab = ref<string | null>(null)

// Basic Example
const basicUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Editor' },
  { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', role: 'User' }
]

const basicProvider = new ArrayDataProvider({
  items: basicUsers,
  pagination: false,
  paginationMode: 'cursor'
})

const basicColumns: Column[] = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' }
]

// Array Provider Example
const products = [
  { id: 1, name: 'Laptop Pro', category: 'Electronics', price: 1299, stock: 45 },
  { id: 2, name: 'Wireless Mouse', category: 'Accessories', price: 29, stock: 150 },
  { id: 3, name: 'USB-C Cable', category: 'Accessories', price: 15, stock: 200 },
  { id: 4, name: 'Monitor 27"', category: 'Electronics', price: 399, stock: 30 },
  { id: 5, name: 'Keyboard Mechanical', category: 'Accessories', price: 129, stock: 75 },
  { id: 6, name: 'Webcam HD', category: 'Electronics', price: 79, stock: 60 },
  { id: 7, name: 'Desk Lamp', category: 'Office', price: 45, stock: 90 },
  { id: 8, name: 'Office Chair', category: 'Office', price: 299, stock: 25 },
  { id: 9, name: 'Headphones', category: 'Electronics', price: 199, stock: 40 },
  { id: 10, name: 'Tablet Stand', category: 'Accessories', price: 35, stock: 100 }
]

const arrayProvider = new ArrayDataProvider({
  items: products,
  pagination: true,
  paginationMode: 'page',
  pageSize: 5
})

const arrayColumns: Column[] = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'name', label: 'Product Name', sortable: true },
  { key: 'category', label: 'Category', sortable: true },
  { key: 'price', label: 'Price ($)', sortable: true },
  { key: 'stock', label: 'Stock', sortable: true }
]

// HTTP Provider Example
const customAdapter: ResponseAdapter = {
  extractItems: (response) => response.data || [],
  extractPagination: (response) => ({
    currentPage: response.page || 1,
    pageCount: response.totalPages || 1,
    pageSize: response.pageSize || 10,
    totalCount: response.total || 0
  }),
  isSuccess: (response) => response.success === true,
  getErrorMessage: (response) => response.error || 'Unknown error'
}

const mockHttpClient = async (url: string) => {
  await new Promise(resolve => setTimeout(resolve, 500))

  const mockUsers = [
    { id: 1, username: 'alice_smith', email: 'alice@company.com', status: 'Active' },
    { id: 2, username: 'bob_jones', email: 'bob@company.com', status: 'Active' },
    { id: 3, username: 'charlie_brown', email: 'charlie@company.com', status: 'Inactive' },
    { id: 4, username: 'diana_prince', email: 'diana@company.com', status: 'Active' },
    { id: 5, username: 'edward_norton', email: 'edward@company.com', status: 'Active' }
  ]

  return {
    success: true,
    data: mockUsers,
    page: 1,
    totalPages: 1,
    pageSize: 10,
    total: mockUsers.length
  }
}

const httpProvider = new HttpDataProvider({
  url: '/api/users',
  pagination: true,
  paginationMode: 'page',
  pageSize: 10,
  httpClient: mockHttpClient,
  responseAdapter: customAdapter,
  headers: {
    'Authorization': 'Bearer token123'
  }
})

const httpColumns: Column[] = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'username', label: 'Username', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'status', label: 'Status', sortable: true }
]

// State Providers Example
const stateUsers = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin', status: 'Active' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'User', status: 'Active' },
  { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', role: 'User', status: 'Inactive' },
  { id: 4, name: 'Diana Prince', email: 'diana@example.com', role: 'Manager', status: 'Active' },
  { id: 5, name: 'Eve Davis', email: 'eve@example.com', role: 'User', status: 'Active' },
  { id: 6, name: 'Frank Miller', email: 'frank@example.com', role: 'Admin', status: 'Active' },
  { id: 7, name: 'Grace Lee', email: 'grace@example.com', role: 'User', status: 'Inactive' },
  { id: 8, name: 'Henry Wilson', email: 'henry@example.com', role: 'Manager', status: 'Active' },
  { id: 9, name: 'Ivy Chen', email: 'ivy@example.com', role: 'User', status: 'Active' },
  { id: 10, name: 'Jack Ryan', email: 'jack@example.com', role: 'Admin', status: 'Inactive' },
  { id: 11, name: 'Kate Morgan', email: 'kate@example.com', role: 'User', status: 'Active' },
  { id: 12, name: 'Leo Turner', email: 'leo@example.com', role: 'Manager', status: 'Active' }
]

const stateColumns: Column[] = [
  { key: 'id', label: 'ID', sort: 'id', value: (m) => m.id.toString() },
  { key: 'name', label: 'Name', sort: 'name', value: (m) => m.name },
  { key: 'email', label: 'Email', sort: 'email', value: (m) => m.email },
  { key: 'role', label: 'Role', sort: 'role', value: (m) => m.role },
  { key: 'status', label: 'Status', sort: 'status', value: (m) => m.status }
]

const stateActiveTab = ref('inmemory')
const stateTabs = [
  { id: 'inmemory', label: 'InMemory' },
  { id: 'localstorage', label: 'LocalStorage' }
]

const inMemoryProvider = new ArrayDataProvider({
  items: stateUsers,
  pagination: true,
  paginationMode: 'page',
  pageSize: 5,
  stateProvider: new InMemoryStateProvider()
})

const localStorageProvider = new ArrayDataProvider({
  items: stateUsers,
  pagination: true,
  paginationMode: 'page',
  pageSize: 5,
  stateProvider: new LocalStorageStateProvider({ storageKey: 'grid-demo-state' })
})

// Page Pagination Example
const pagePaginationUsers = Array.from({ length: 47 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  status: ['Active', 'Inactive'][i % 2]
}))

const pagePaginationProvider = new ArrayDataProvider({
  items: pagePaginationUsers,
  pagination: true,
  paginationMode: 'page',
  pageSize: 10
})

const pagePaginationColumns: Column[] = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'status', label: 'Status' }
]

// Cursor Pagination Example
const cursorPaginationProducts = Array.from({ length: 35 }, (_, i) => ({
  id: i + 1,
  name: `Product ${i + 1}`,
  price: `$${(Math.random() * 100 + 10).toFixed(2)}`,
  category: ['Electronics', 'Clothing', 'Books', 'Home'][i % 4]
}))

const cursorPaginationProvider = new ArrayDataProvider({
  items: cursorPaginationProducts,
  pagination: true,
  paginationMode: 'cursor',
  pageSize: 8
})

const cursorPaginationColumns: Column[] = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Product Name' },
  { key: 'price', label: 'Price' },
  { key: 'category', label: 'Category' }
]

// Sorting Example
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

// Search & Sort Example
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
  { id: 11, name: 'Karen Thomas', department: 'Engineering', position: 'Senior Developer', salary: 98000 },
  { id: 12, name: 'Leo Jackson', department: 'Marketing', position: 'SEO Specialist', salary: 62000 },
  { id: 13, name: 'Maria White', department: 'Sales', position: 'Account Executive', salary: 70000 },
  { id: 14, name: 'Nathan Harris', department: 'Engineering', position: 'Frontend Developer', salary: 88000 },
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

// Custom Columns Example
const tasks = [
  { id: 1, title: 'Update documentation', priority: 'high', status: 'completed', progress: 100 },
  { id: 2, title: 'Fix login bug', priority: 'critical', status: 'in_progress', progress: 75 },
  { id: 3, title: 'Add dark mode', priority: 'medium', status: 'in_progress', progress: 40 },
  { id: 4, title: 'Optimize performance', priority: 'low', status: 'pending', progress: 0 },
  { id: 5, title: 'Write tests', priority: 'high', status: 'in_progress', progress: 60 }
]

const customColumnsProvider = new ArrayDataProvider({
  items: tasks,
  pagination: false,
  paginationMode: 'cursor'
})

function getPriorityColor(priority: string) {
  const colors: Record<string, string> = {
    critical: '#e53e3e',
    high: '#dd6b20',
    medium: '#d69e2e',
    low: '#38a169'
  }
  return colors[priority] || '#718096'
}

const customColumnsColumns: Column[] = [
  { key: 'id', label: 'ID' },
  { key: 'title', label: 'Task' },
  {
    key: 'priority',
    label: 'Priority',
    component: (row) => ({
      is: 'span',
      props: {
        style: {
          padding: '0.25rem 0.5rem',
          borderRadius: '0.25rem',
          fontSize: '0.875rem',
          fontWeight: 'bold',
          background: getPriorityColor(row.priority),
          color: 'white'
        }
      },
      content: row.priority.toUpperCase()
    })
  },
  {
    key: 'status',
    label: 'Status',
    value: (row) => row.status.replace('_', ' ').toUpperCase()
  },
  {
    key: 'progress',
    label: 'Progress',
    component: (row) => ({
      is: 'div',
      props: { style: { width: '100%' } },
      children: [
        {
          is: 'div',
          props: {
            style: {
              width: '100%',
              height: '20px',
              background: '#e2e8f0',
              borderRadius: '10px',
              overflow: 'hidden'
            }
          },
          children: [
            {
              is: 'div',
              props: {
                style: {
                  width: row.progress + '%',
                  height: '100%',
                  background: '#667eea',
                  transition: 'width 0.3s'
                }
              }
            }
          ]
        },
        {
          is: 'span',
          props: {
            style: {
              fontSize: '0.75rem',
              color: '#4a5568',
              marginTop: '0.25rem',
              display: 'block'
            }
          },
          content: row.progress + '%'
        }
      ]
    })
  }
]

// Row Actions Example
const rowActionsUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', active: true },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', active: true },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', active: false },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', active: true },
  { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', active: true },
  { id: 6, name: 'Diana Prince', email: 'diana@example.com', active: false }
]

const rowActionsProvider = new ArrayDataProvider({
  items: rowActionsUsers,
  pagination: false,
  paginationMode: 'cursor'
})

const selectedUser = ref<any>(null)

function handleRowClick(user: any) {
  selectedUser.value = user
  console.log('Row clicked:', user)
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

// Scroll handlers
const scrollToSection = (event: Event) => {
  event.preventDefault()
  const target = event.target as HTMLAnchorElement
  const id = target.getAttribute('href')?.slice(1)
  if (id) {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      activeSection.value = id
    }
  }
}

const scrollToStateProvider = (tab: string) => {
  return (event: Event) => {
    event.preventDefault()
    stateProviderTab.value = tab
    stateActiveTab.value = tab
    const element = document.getElementById('state-providers')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      activeSection.value = `state-${tab}`
    }
  }
}

const updateActiveSection = () => {
  const sections = [
    'introduction',
    'basic',
    'array-provider',
    'http-provider',
    'state-providers',
    'page-pagination',
    'cursor-pagination',
    'sorting',
    'search-sort',
    'custom-columns',
    'row-actions'
  ]

  const scrollPosition = window.scrollY + 150

  for (let i = sections.length - 1; i >= 0; i--) {
    const section = document.getElementById(sections[i])
    if (section && section.offsetTop <= scrollPosition) {
      if (sections[i] === 'state-providers' && stateProviderTab.value) {
        activeSection.value = `state-${stateProviderTab.value}`
      } else {
        activeSection.value = sections[i]
      }
      break
    }
  }
}

onMounted(() => {
  window.addEventListener('scroll', updateActiveSection)
  updateActiveSection()
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateActiveSection)
})
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
}

.header h1 {
  margin: 0;
  font-size: 2.5rem;
}

.tagline {
  margin: 0.5rem 0 0;
  opacity: 0.9;
  font-size: 1.1rem;
  color: white;
}

.layout {
  display: flex;
  flex: 1;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.sidebar {
  width: 250px;
  background: #f7fafc;
  border-right: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  height: calc(100vh - 10rem);
  overflow-y: auto;
  flex-shrink: 0;
}

.nav {
  padding: 1.5rem 0;
}

.nav-section {
  margin: 0.5rem 0;
}

.nav-section-title {
  display: block;
  padding: 0.75rem 1.5rem 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #667eea;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.nav-sub-link {
  padding-left: 2.5rem !important;
  font-size: 0.9rem;
}

.nav-link {
  display: block;
  padding: 0.75rem 1.5rem;
  text-decoration: none;
  color: #4a5568;
  transition: all 0.2s;
  border-left: 3px solid transparent;
}

.nav-link:hover {
  background: #edf2f7;
  color: #667eea;
  border-left-color: #667eea;
}

.nav-link.active {
  background: #edf2f7;
  color: #667eea;
  border-left-color: #667eea;
  font-weight: 600;
}

.main {
  flex: 1;
  overflow-y: auto;
}

.content {
  padding: 2rem;
  max-width: 1100px;
}

.section {
  margin-bottom: 4rem;
  scroll-margin-top: 2rem;
}

.section:last-child {
  margin-bottom: 2rem;
}

.hero {
  text-align: center;
  margin-bottom: 2rem;
  padding: 2rem;
}

.hero h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.feature-list {
  line-height: 1.8;
}

.feature-list li {
  margin-bottom: 0.5rem;
}

.example-section {
  margin-bottom: 2rem;
}

.example-description {
  margin-bottom: 1.5rem;
  color: #4a5568;
}

.example-notice {
  padding: 1rem;
  margin-bottom: 1.5rem;
  background: #f0f4ff;
  border-left: 4px solid #667eea;
  border-radius: 0.25rem;
  font-size: 0.9rem;
  color: #4a5568;
}

.example-notice code {
  background: #e0e7ff;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  color: #4338ca;
}

.actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  text-decoration: none;
  border-radius: 0.375rem;
  transition: all 0.2s;
}

.btn:hover {
  background: #5a67d8;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.btn-secondary {
  background: #48bb78;
}

.btn-secondary:hover {
  background: #38a169;
}

.code-block {
  background: #2d3748;
  color: #e2e8f0;
  padding: 1rem;
  border-radius: 0.375rem;
  overflow-x: auto;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
}

.code-block code {
  color: #e2e8f0;
}

.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  border-bottom: 2px solid #e2e8f0;
}

.tab {
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  color: #4a5568;
  transition: all 0.2s;
  margin-bottom: -2px;
}

.tab:hover {
  color: #667eea;
  background: #f7fafc;
}

.tab.active {
  color: #667eea;
  border-bottom-color: #667eea;
  font-weight: 600;
}

.tab-content {
  padding: 1rem 0;
}

.example {
  margin-bottom: 2rem;
}

.grid-container {
  margin: 1.5rem 0;
}

.code-example {
  margin-top: 1.5rem;
}

.code-example h4 {
  margin-bottom: 0.5rem;
  color: #2d3748;
}

.code-example pre {
  background: #2d3748;
  color: #e2e8f0;
  padding: 1rem;
  border-radius: 0.375rem;
  overflow-x: auto;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
}

.info {
  padding: 0.75rem 1rem;
  background: #ebf8ff;
  border-left: 4px solid #4299e1;
  border-radius: 0.25rem;
  margin: 1rem 0;
  font-size: 0.9rem;
}

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

.footer {
  background: #f7fafc;
  padding: 2rem;
  text-align: center;
  border-top: 1px solid #e2e8f0;
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
}

.footer a {
  color: #667eea;
  text-decoration: none;
}

.footer a:hover {
  text-decoration: underline;
}

/* Row Actions Styles */
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

/* Responsive Design */
@media (max-width: 768px) {
  .layout {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    height: auto;
    position: relative;
    border-right: none;
    border-bottom: 1px solid #e2e8f0;
  }

  .nav {
    display: flex;
    overflow-x: auto;
    padding: 0.5rem 0;
  }

  .nav-link {
    white-space: nowrap;
    border-left: none;
    border-bottom: 3px solid transparent;
  }

  .nav-link:hover {
    border-left-color: transparent;
    border-bottom-color: #667eea;
  }

  .content {
    padding: 1rem;
  }
}
</style>

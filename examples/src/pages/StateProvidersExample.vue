<template>
  <div>
    <h2>State Providers</h2>
    <p>
      State Providers manage grid state (filters, sorting, pagination) independently from data fetching.
      This separation allows you to choose where and how state is persisted.
    </p>

    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="['tab', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="tab-content">
      <!-- InMemory State Provider -->
      <div v-if="activeTab === 'inmemory'" class="example">
        <h3>InMemoryStateProvider</h3>
        <p>
          Stores state in memory. State is lost on page refresh. Useful for temporary filtering/sorting or testing.
        </p>
        <div class="grid-container">
          <Grid :provider="inMemoryProvider" :columns="columns" />
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

      <!-- QueryParams State Provider -->
      <div v-if="activeTab === 'queryparams'" class="example">
        <h3>QueryParamsStateProvider (Default)</h3>
        <p>
          Stores state in URL query parameters with a prefix. State persists across page refreshes and can be shared via URL.
          Default prefix is <code>search</code>, so filters appear as <code>?search-name=John&search-sort=email</code>.
        </p>
        <p class="info">
          Note: This example uses router integration. Try sorting or filtering, then refresh the page - your state will be preserved!
        </p>
        <div class="grid-container">
          <Grid :provider="queryParamsProvider" :columns="columns" />
        </div>
        <div class="code-example">
          <h4>Code Example:</h4>
          <pre><code>import { ArrayDataProvider, QueryParamsStateProvider } from '@grid-vue/grid'
import { useRouter } from 'vue-router'

const router = useRouter()
const stateProvider = new QueryParamsStateProvider({
  router,
  prefix: 'search' // default prefix
})

const provider = new ArrayDataProvider({
  items: users,
  pagination: true,
  paginationMode: 'page',
  pageSize: 5,
  stateProvider
})

// Backward compatibility: HttpDataProvider creates QueryParamsStateProvider
// if router is provided without explicit stateProvider
const httpProvider = new HttpDataProvider({
  url: '/api/users',
  router, // automatically uses QueryParamsStateProvider with prefix='search'
  pagination: true,
  paginationMode: 'page'
})</code></pre>
        </div>
      </div>

      <!-- LocalStorage State Provider -->
      <div v-if="activeTab === 'localstorage'" class="example">
        <h3>LocalStorageStateProvider</h3>
        <p>
          Stores state in browser localStorage. State persists across page refreshes and browser sessions.
          Useful for preserving user preferences.
        </p>
        <p class="info">
          Try filtering or sorting, then refresh the page - your preferences will be restored!
        </p>
        <div class="grid-container">
          <Grid :provider="localStorageProvider" :columns="columns" />
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

      <!-- Hash State Provider -->
      <div v-if="activeTab === 'hash'" class="example">
        <h3>HashStateProvider</h3>
        <p>
          Stores state in URL hash. State persists across page refreshes and can be shared via URL.
          Format: <code>#search-name=John&search-sort=email</code>
        </p>
        <p class="info">
          Watch the URL hash change as you filter and sort!
        </p>
        <div class="grid-container">
          <Grid :provider="hashProvider" :columns="columns" />
        </div>
        <div class="code-example">
          <h4>Code Example:</h4>
          <pre><code>import { ArrayDataProvider, HashStateProvider } from '@grid-vue/grid'
import { useRouter } from 'vue-router'

const router = useRouter()
const stateProvider = new HashStateProvider({
  router,
  prefix: 'search' // default prefix
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
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Grid, ArrayDataProvider, InMemoryStateProvider, QueryParamsStateProvider, LocalStorageStateProvider, HashStateProvider } from '../../../src'
import type { Column } from '../../../src'

const router = useRouter()

// Sample data
const users = [
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

// Columns definition
const columns: Column[] = [
  { key: 'id', label: 'ID', sort: 'id', value: (m) => m.id.toString() },
  { key: 'name', label: 'Name', sort: 'name', value: (m) => m.name },
  { key: 'email', label: 'Email', sort: 'email', value: (m) => m.email },
  { key: 'role', label: 'Role', sort: 'role', value: (m) => m.role },
  { key: 'status', label: 'Status', sort: 'status', value: (m) => m.status }
]

// Tab state
const activeTab = ref('inmemory')
const tabs = [
  { id: 'inmemory', label: 'InMemory' },
  { id: 'queryparams', label: 'Query Params (Default)' },
  { id: 'localstorage', label: 'LocalStorage' },
  { id: 'hash', label: 'Hash' }
]

// Create providers with different state providers
const inMemoryProvider = new ArrayDataProvider({
  items: users,
  pagination: true,
  paginationMode: 'page',
  pageSize: 5,
  stateProvider: new InMemoryStateProvider()
})

const queryParamsProvider = new ArrayDataProvider({
  items: users,
  pagination: true,
  paginationMode: 'page',
  pageSize: 5,
  stateProvider: new QueryParamsStateProvider({ router, prefix: 'search' })
})

const localStorageProvider = new ArrayDataProvider({
  items: users,
  pagination: true,
  paginationMode: 'page',
  pageSize: 5,
  stateProvider: new LocalStorageStateProvider({ storageKey: 'grid-demo-state' })
})

const hashProvider = new ArrayDataProvider({
  items: users,
  pagination: true,
  paginationMode: 'page',
  pageSize: 5,
  stateProvider: new HashStateProvider({ router, prefix: 'grid' })
})
</script>

<style scoped>
.tabs {
  display: flex;
  gap: 0.5rem;
  margin: 1.5rem 0;
  border-bottom: 2px solid #e2e8f0;
}

.tab {
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-size: 1rem;
  color: #4a5568;
  transition: all 0.2s;
  margin-bottom: -2px;
}

.tab:hover {
  color: #667eea;
}

.tab.active {
  color: #667eea;
  border-bottom-color: #667eea;
  font-weight: 600;
}

.tab-content {
  margin-top: 2rem;
}

.example {
  margin-bottom: 2rem;
}

.example h3 {
  margin-bottom: 1rem;
  color: #2d3748;
}

.example p {
  margin-bottom: 1rem;
  line-height: 1.6;
  color: #4a5568;
}

.info {
  background: #ebf8ff;
  border-left: 4px solid #4299e1;
  padding: 1rem;
  margin: 1rem 0;
  border-radius: 0.25rem;
}

code {
  background: #f7fafc;
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.875rem;
  color: #e53e3e;
}

.grid-container {
  margin: 1.5rem 0;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  overflow: hidden;
}

.code-example {
  margin-top: 2rem;
}

.code-example h4 {
  margin-bottom: 0.5rem;
  color: #2d3748;
}

.code-example pre {
  background: #2d3748;
  color: #f7fafc;
  padding: 1.5rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 0;
}

.code-example code {
  background: none;
  color: inherit;
  padding: 0;
  font-size: 0.875rem;
  line-height: 1.6;
}
</style>

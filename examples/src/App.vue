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
            <a href="#state-inmemory" :class="['nav-link', 'nav-sub-link', { active: activeSection === 'state-inmemory' }]" @click="scrollToSection">InMemory</a>
            <a href="#state-localstorage" :class="['nav-link', 'nav-sub-link', { active: activeSection === 'state-localstorage' }]" @click="scrollToSection">LocalStorage</a>
            <a href="#state-queryparams" :class="['nav-link', 'nav-sub-link', { active: activeSection === 'state-queryparams' }]" @click="scrollToSection">QueryParams</a>
            <a href="#state-hash" :class="['nav-link', 'nav-sub-link', { active: activeSection === 'state-hash' }]" @click="scrollToSection">Hash</a>
          </div>
          <div class="nav-section">
            <span class="nav-section-title">Advanced</span>
            <a href="#multi-state" :class="['nav-link', 'nav-sub-link', { active: activeSection === 'multi-state' }]" @click="scrollToSection">Multi-State Example</a>
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
                  <li><strong>Client-side pagination:</strong> No backend required for pagination</li>
                  <li><strong>Sorting:</strong> Sort by any column with a single click</li>
                  <li><strong>Filtering:</strong> Filter data locally in the browser</li>
                  <li><strong>Fast:</strong> Perfect for datasets up to thousands of rows</li>
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
              <h2>HTTP Provider Example - GitHub API</h2>
              <p>
                This example demonstrates <strong>HttpDataProvider</strong> with the real GitHub API.
                Search for repositories, sort by stars/forks/updated, and navigate pages - all state synced with URL!
              </p>

              <div class="example-section">
                <h3>Search & Filters</h3>
                <div class="controls">
                  <div class="control-group">
                    <label for="search">Search Repositories:</label>
                    <input
                      id="search"
                      v-model="githubSearchQuery"
                      type="text"
                      placeholder="e.g., vue datatable"
                      class="search-input"
                      @keyup.enter="handleGithubSearch"
                    />
                    <button @click="handleGithubSearch" class="btn btn-primary">Search</button>
                  </div>

                  <div class="control-group">
                    <label for="sort">Sort By:</label>
                    <select id="sort" v-model="githubSortBy" @change="handleGithubSearch" class="sort-select">
                      <option value="stars">⭐ Stars</option>
                      <option value="forks">🔱 Forks</option>
                      <option value="updated">🕐 Recently Updated</option>
                      <option value="help-wanted-issues">🙋 Help Wanted</option>
                    </select>
                  </div>

                  <div class="control-group" v-if="githubTotalCount > 0">
                    <span>Results: {{ githubTotalCount.toLocaleString() }} repositories</span>
                  </div>
                </div>
              </div>

              <div class="example-section">
                <h3>Results</h3>
                <Grid
                  ref="githubGridRef"
                  :data-provider="githubProvider"
                  :columns="githubColumns"
                />
              </div>

              <div class="example-section">
                <h3>Code</h3>
                <pre class="code-block"><code>// Custom adapter for GitHub API response format
class GitHubSearchAdapter {
  private currentPage = 1

  setCurrentPage(page: number) {
    this.currentPage = page
  }

  extractItems(response: any): any[] {
    return response.items || []
  }

  extractPagination(response: any) {
    const totalCount = response.total_count || 0
    return {
      currentPage: this.currentPage,
      perPage: 10,
      pageCount: Math.min(Math.ceil(totalCount / 10), 100),
      totalCount: Math.min(totalCount, 1000)
    }
  }

  isSuccess(response: any): boolean {
    return !response.message
  }

  getErrorMessage(response: any): string {
    return response.message || 'API request failed'
  }
}

const adapter = new GitHubSearchAdapter()

async function githubHttpClient(fullUrl: string): Promise&lt;any&gt; {
  const urlObj = new URL(fullUrl)
  const q = urlObj.searchParams.get('gh-q') || 'vue table'
  const sort = urlObj.searchParams.get('gh-sort') || 'stars'
  const page = urlObj.searchParams.get('page') || '1'

  adapter.setCurrentPage(parseInt(page))

  const params = new URLSearchParams({
    q, sort, order: 'desc', per_page: '10', page
  })

  const response = await fetch(\`https://api.github.com/search/repositories?\${params}\`)
  return response.json()
}

const provider = new HttpDataProvider({
  url: 'https://api.github.com/search/repositories',
  pagination: true,
  paginationMode: 'page',
  pageSize: 10,
  responseAdapter: adapter,
  httpClient: githubHttpClient,
  stateProvider: new QueryParamsStateProvider({
    router,
    prefix: 'gh'
  })
})</code></pre>
              </div>
            </div>
          </section>

          <!-- InMemory State Provider Section -->
          <section id="state-inmemory" class="section">
            <div>
              <h2>InMemory State Provider</h2>
              <p>
                Stores state in memory. State is lost on page refresh. Useful for temporary filtering/sorting or testing.
              </p>
              <div class="example-section">
                <h3>Demo</h3>
                <Grid :data-provider="inMemoryProvider" :columns="stateColumns" />
              </div>
              <div class="example-section">
                <h3>Code</h3>
                <pre class="code-block"><code>import { ArrayDataProvider, InMemoryStateProvider } from '@grid-vue/grid'

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
          </section>

          <!-- LocalStorage State Provider Section -->
          <section id="state-localstorage" class="section">
            <div>
              <h2>LocalStorage State Provider</h2>
              <p>
                Stores state in browser localStorage. State persists across page refreshes and browser sessions.
                Useful for preserving user preferences.
              </p>
              <p class="info">
                Try sorting, then refresh the page - your preferences will be restored!
              </p>
              <div class="example-section">
                <h3>Demo</h3>
                <Grid :data-provider="localStorageProvider" :columns="stateColumns" />
              </div>
              <div class="example-section">
                <h3>Code</h3>
                <pre class="code-block"><code>import { ArrayDataProvider, LocalStorageStateProvider } from '@grid-vue/grid'

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
          </section>

          <!-- QueryParams State Provider Section -->
          <section id="state-queryparams" class="section">
            <div>
              <h2>QueryParams State Provider</h2>
              <p>
                Stores state in URL query parameters. State is shareable via URL and works with browser navigation (back/forward).
                Perfect for bookmarkable filtered views and SEO-friendly pages. Requires Vue Router.
              </p>
              <p class="info">
                Try sorting - notice how the URL updates! You can share this URL or use browser back/forward.
              </p>
              <div class="example-section">
                <h3>Demo</h3>
                <Grid :data-provider="queryParamsProvider" :columns="stateColumns" />
              </div>
              <div class="example-section">
                <h3>Code</h3>
                <pre class="code-block"><code>import { useRouter } from 'vue-router'
import { ArrayDataProvider, QueryParamsStateProvider } from '@grid-vue/grid'

const router = useRouter()

const stateProvider = new QueryParamsStateProvider({
  router,
  prefix: 'qp' // query params will be: ?qp-sort=name
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
          </section>

          <!-- Hash State Provider Section -->
          <section id="state-hash" class="section">
            <div>
              <h2>Hash State Provider</h2>
              <p>
                Stores state in URL hash fragment. Similar to QueryParams but doesn't interfere with query parameters.
                Useful for hash-based routing or when query params are used by other parts of the application.
              </p>
              <p class="info">
                Try sorting - notice how the hash fragment updates!
              </p>
              <div class="example-section">
                <h3>Demo</h3>
                <Grid :data-provider="hashProvider" :columns="stateColumns" />
              </div>
              <div class="example-section">
                <h3>Code</h3>
                <pre class="code-block"><code>import { useRouter } from 'vue-router'
import { ArrayDataProvider, HashStateProvider } from '@grid-vue/grid'

const router = useRouter()

const stateProvider = new HashStateProvider({
  router,
  prefix: 'hash' // hash will be: #hash-sort=name
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
          </section>

          <!-- Multi-State Example Section -->
          <section id="multi-state" class="section">
            <div>
              <h2>Multi-State Example</h2>
              <p>
                This example demonstrates using multiple grids with different state providers and URL prefixes.
                Each grid maintains its own independent state, allowing complex dashboards with multiple data sources.
              </p>
              <p class="info">
                Try sorting or paginating both grids - notice how each maintains its own state with different URL prefixes!
              </p>

              <div class="example-section">
                <h3>Array Provider with "products" prefix</h3>
                <Grid :data-provider="multiStateArrayProvider" :columns="multiStateArrayColumns" />
              </div>

              <div class="example-section">
                <h3>Mock HTTP Provider with "users" prefix</h3>
                <Grid :data-provider="multiStateHttpProvider" :columns="multiStateHttpColumns" />
              </div>

              <div class="example-section">
                <h3>Code</h3>
                <pre class="code-block"><code>import { useRouter } from 'vue-router'
import { ArrayDataProvider, HttpDataProvider, QueryParamsStateProvider } from '@grid-vue/grid'

const router = useRouter()

// First grid: Array provider with "products" prefix
const productsStateProvider = new QueryParamsStateProvider({
  router,
  prefix: 'products'
})

const productsProvider = new ArrayDataProvider({
  items: products,
  pagination: true,
  paginationMode: 'page',
  pageSize: 5,
  stateProvider: productsStateProvider
})

// Second grid: HTTP provider with "users" prefix
const usersStateProvider = new QueryParamsStateProvider({
  router,
  prefix: 'users'
})

const usersProvider = new HttpDataProvider({
  url: '/api/users',
  pagination: true,
  paginationMode: 'page',
  pageSize: 5,
  stateProvider: usersStateProvider,
  httpClient: mockHttpClient,
  responseAdapter: customAdapter
})

// URL will contain both: ?products-sort=name&products-page=2&users-sort=email&users-page=1</code></pre>
              </div>
            </div>
          </section>

          <!-- Page Pagination Section -->
          <section id="page-pagination" class="section">
            <div>
              <h2>Page Pagination Example</h2>

              <div class="example-description">
                <p>
                  This example shows traditional page-based pagination with page numbers using the new
                  <code>PagePagination</code> component. Users can navigate between pages using Previous,
                  Next, and numbered page buttons with customizable options.
                </p>
              </div>

              <div class="example-section">
                <h3>Demo</h3>
                <Grid
                  :data-provider="pagePaginationProvider"
                  :columns="pagePaginationColumns"
                >
                  <template #pagination="{ pagination }">
                    <PagePagination
                      :pagination="pagination"
                      :max-visible-pages="5"
                      :show-summary="true"
                      @page-change="pagePaginationProvider.setPage($event)"
                    />
                  </template>
                </Grid>
              </div>

              <div class="example-section">
                <h3>Code</h3>
                <pre class="code-block"><code>&lt;template&gt;
  &lt;Grid :data-provider="provider" :columns="columns"&gt;
    &lt;template #pagination="{ pagination }"&gt;
      &lt;PagePagination
        :pagination="pagination"
        :max-visible-pages="5"
        :show-summary="true"
        @page-change="provider.setPage($event)"
      /&gt;
    &lt;/template&gt;
  &lt;/Grid&gt;
&lt;/template&gt;

&lt;script setup lang="ts"&gt;
import { Grid, ArrayDataProvider, PagePagination, type Column } from '@grid-vue/grid'

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
              <h2>Cursor Pagination Example (Load More)</h2>

              <div class="example-description">
                <p>
                  This example demonstrates cursor-based pagination with a "Load More" button using the new
                  <code>LoadModePagination</code> component. This pattern is ideal for infinite scroll
                  implementations and mobile-friendly interfaces.
                </p>
              </div>

              <div class="example-section">
                <h3>Demo</h3>
                <Grid
                  :data-provider="cursorPaginationProvider"
                  :columns="cursorPaginationColumns"
                >
                  <template #pagination="{ pagination, loading }">
                    <LoadModePagination
                      :pagination="pagination"
                      :loading="loading"
                      @load-more="cursorPaginationProvider.loadMore()"
                    />
                  </template>
                </Grid>
              </div>

              <div class="example-section">
                <h3>Code</h3>
                <pre class="code-block"><code>&lt;template&gt;
  &lt;Grid :data-provider="provider" :columns="columns"&gt;
    &lt;template #pagination="{ pagination, loading }"&gt;
      &lt;LoadModePagination
        :pagination="pagination"
        :loading="loading"
        @load-more="provider.loadMore()"
      /&gt;
    &lt;/template&gt;
  &lt;/Grid&gt;
&lt;/template&gt;

&lt;script setup lang="ts"&gt;
import { Grid, ArrayDataProvider, LoadModePagination, type Column } from '@grid-vue/grid'

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
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  Grid,
  ArrayDataProvider,
  HttpDataProvider,
  InMemoryStateProvider,
  LocalStorageStateProvider,
  QueryParamsStateProvider,
  HashStateProvider,
  LoadModePagination,
  PagePagination,
  PaginationRequest,
  type Column,
  type ResponseAdapter,
  type RowOptions
} from '@grid-vue/grid'

const router = useRouter()
const route = useRoute()

const activeSection = ref('introduction')

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

const queryParamsProvider = new ArrayDataProvider({
  items: stateUsers,
  pagination: true,
  paginationMode: 'page',
  pageSize: 5,
  stateProvider: new QueryParamsStateProvider({
    router,
    prefix: 'qp'
  })
})

const hashProvider = new ArrayDataProvider({
  items: stateUsers,
  pagination: true,
  paginationMode: 'page',
  pageSize: 5,
  stateProvider: new HashStateProvider({
    router,
    prefix: 'hash'
  })
})

// Multi-State Example: Array Provider
const multiStateArrayProvider = new ArrayDataProvider({
  items: products,
  pagination: true,
  paginationMode: 'page',
  pageSize: 5,
  stateProvider: new QueryParamsStateProvider({
    router,
    prefix: 'products'
  })
})

const multiStateArrayColumns: Column[] = [
  { key: 'id', label: 'ID', sortable: true, sort: 'id' },
  { key: 'name', label: 'Product', sortable: true, sort: 'name' },
  { key: 'category', label: 'Category', sortable: true, sort: 'category' },
  { key: 'price', label: 'Price ($)', sortable: true, sort: 'price' }
]

// Multi-State Example: HTTP Provider (mock)
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

const multiStateHttpProvider = new HttpDataProvider({
  url: '/api/users',
  pagination: true,
  paginationMode: 'page',
  pageSize: 5,
  httpClient: mockHttpClient,
  responseAdapter: customAdapter,
  stateProvider: new QueryParamsStateProvider({
    router,
    prefix: 'users'
  })
})

const multiStateHttpColumns: Column[] = [
  { key: 'id', label: 'ID', sortable: true, sort: 'id' },
  { key: 'username', label: 'Username', sortable: true, sort: 'username' },
  { key: 'email', label: 'Email', sortable: true, sort: 'email' },
  { key: 'status', label: 'Status', sortable: true, sort: 'status' }
]

// GitHub API Example
class GitHubSearchAdapter {
  private currentPage = 1

  setCurrentPage(page: number) {
    this.currentPage = page
  }

  extractItems(response: any): any[] {
    return response.items || []
  }

  extractPagination(response: any) {
    const totalCount = response.total_count || 0
    const perPage = 10
    return {
      currentPage: this.currentPage,
      perPage,
      pageCount: Math.min(Math.ceil(totalCount / perPage), 100),
      totalCount: Math.min(totalCount, 1000)
    }
  }

  isSuccess(response: any): boolean {
    return !response.message
  }

  getErrorMessage(response: any): string {
    return response.message || 'API request failed'
  }
}

// Initialize from URL params or use defaults
const githubSearchQuery = ref((route.query['gh-q'] as string) || 'vue table')
const githubSortBy = ref((route.query['gh-sort'] as string) || 'stars')
const githubTotalCount = ref(0)
const githubGridRef = ref<any>(null)

const githubAdapter = new GitHubSearchAdapter()

async function githubHttpClient(fullUrl: string): Promise<any> {
  const urlObj = new URL(fullUrl)
  const q = urlObj.searchParams.get('gh-q') || githubSearchQuery.value || 'vue table'
  const sort = urlObj.searchParams.get('gh-sort')?.replace('-', '') || githubSortBy.value
  const page = urlObj.searchParams.get('page') || '1'

  githubAdapter.setCurrentPage(parseInt(page))

  const params = new URLSearchParams({
    q,
    sort,
    order: 'desc',
    per_page: '10',
    page
  })

  const url = `https://api.github.com/search/repositories?${params.toString()}`

  const response = await fetch(url, {
    headers: {
      'Accept': 'application/vnd.github.v3+json'
    }
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

const githubProvider = new HttpDataProvider({
  url: 'https://api.github.com/search/repositories',
  pagination: true,
  paginationMode: 'page',
  pageSize: 10,
  responseAdapter: githubAdapter,
  httpClient: githubHttpClient,
  stateProvider: new QueryParamsStateProvider({
    router,
    prefix: 'gh'
  })
})

const githubColumns: Column[] = [
  {
    key: 'full_name',
    label: 'Repository',
    component: (row) => ({
      is: 'a',
      props: {
        href: row.html_url,
        target: '_blank',
        style: {
          color: '#667eea',
          fontWeight: 'bold',
          textDecoration: 'none'
        }
      },
      content: row.full_name
    })
  },
  {
    key: 'description',
    label: 'Description',
    value: (row) => {
      const desc = row.description || 'No description'
      return desc.length > 100 ? desc.substring(0, 100) + '...' : desc
    }
  },
  {
    key: 'stargazers_count',
    label: '⭐ Stars',
    value: (row) => row.stargazers_count.toLocaleString()
  },
  {
    key: 'forks_count',
    label: '🔱 Forks',
    value: (row) => row.forks_count.toLocaleString()
  },
  {
    key: 'language',
    label: 'Language',
    value: (row) => row.language || 'Unknown'
  },
  {
    key: 'updated_at',
    label: 'Updated',
    value: (row) => new Date(row.updated_at).toLocaleDateString()
  }
]

async function handleGithubSearch() {
  await router.push({
    query: {
      ...route.query,
      'gh-q': githubSearchQuery.value,
      'gh-sort': githubSortBy.value,
      page: '1'
    }
  })

  if (githubGridRef.value) {
    await githubGridRef.value.refresh()
    const paginationData = githubGridRef.value.pagination
    if (paginationData) {
      githubTotalCount.value = (paginationData as any).totalCount || 0
    }
  }
}

// Update total count when grid data loads
watch(() => githubGridRef.value?.pagination, (paginationData) => {
  if (paginationData) {
    githubTotalCount.value = (paginationData as any).totalCount || 0
  }
}, { deep: true })

// Sync local state with URL params
watch(() => route.query, () => {
  const urlQuery = route.query['gh-q'] as string
  const urlSort = route.query['gh-sort'] as string

  if (urlQuery && urlQuery !== githubSearchQuery.value) {
    githubSearchQuery.value = urlQuery
  }
  if (urlSort && urlSort !== githubSortBy.value) {
    githubSortBy.value = urlSort
  }
}, { immediate: true })

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

const updateActiveSection = () => {
  const sections = [
    'introduction',
    'basic',
    'array-provider',
    'http-provider',
    'state-inmemory',
    'state-localstorage',
    'state-queryparams',
    'state-hash',
    'multi-state',
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
      activeSection.value = sections[i]
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

.search-input,
.sort-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #cbd5e0;
  border-radius: 0.375rem;
  font-size: 0.9rem;
  color: #2d3748;
  background: white;
  transition: all 0.2s;
}

.search-input:focus,
.sort-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.btn-primary {
  padding: 0.5rem 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  align-self: flex-end;
}

.btn-primary:hover {
  background: #5a67d8;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-primary:active {
  transform: translateY(0);
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

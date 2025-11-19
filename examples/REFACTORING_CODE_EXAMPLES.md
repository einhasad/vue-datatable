# Refactoring Code Examples: Templates and Boilerplate

This document provides ready-to-use code snippets for key files during the refactoring.

---

## 1. LAYOUT FILES

### layouts/default.vue

```vue
<template>
  <div class="app">
    <AppHeader />

    <div class="layout">
      <SidebarNav
        :navigation-items="navigationItems"
      />

      <main class="main">
        <div class="content">
          <slot />
        </div>
      </main>
    </div>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import AppHeader from '~/components/AppHeader.vue'
import SidebarNav from '~/components/SidebarNav.vue'
import AppFooter from '~/components/AppFooter.vue'
import { useNavigation } from '~/composables/useNavigation'

const { navigationItems } = useNavigation()

// Optional: Add scroll tracking if single-page (not routing)
// import { useScrollNavigation } from '~/composables/useScrollNavigation'
// const { activeSection } = useScrollNavigation()
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.layout {
  display: flex;
  flex: 1;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.main {
  flex: 1;
  overflow-y: auto;
}

.content {
  padding: 2rem;
  max-width: 1100px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .layout {
    flex-direction: column;
  }

  .content {
    padding: 1rem;
  }
}
</style>
```

---

## 2. SHARED COMPONENTS

### components/AppHeader.vue

```vue
<template>
  <header class="header">
    <div class="header-content">
      <h1>Grid Vue</h1>
      <p class="tagline">A flexible, configurable grid component library for Vue 3</p>
    </div>
  </header>
</template>

<style scoped>
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
</style>
```

---

### components/SidebarNav.vue

```vue
<template>
  <aside class="sidebar">
    <nav class="nav">
      <template v-for="item in navigationItems" :key="item.id || item.title">
        <!-- Regular nav link -->
        <NuxtLink
          v-if="!item.title"
          :to="item.route"
          :class="['nav-link', { active: isActive(item.id) }]"
        >
          {{ item.label }}
        </NuxtLink>

        <!-- Section with sub-links -->
        <div v-else class="nav-section">
          <span class="nav-section-title">{{ item.title }}</span>
          <NuxtLink
            v-for="link in item.links"
            :key="link.id"
            :to="link.route"
            :class="['nav-link', 'nav-sub-link', { active: isActive(link.id) }]"
          >
            {{ link.label }}
          </NuxtLink>
        </div>
      </template>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

interface NavLink {
  label: string
  id: string
  route: string
}

interface NavSection {
  title: string
  links: NavLink[]
}

defineProps<{
  navigationItems: (NavLink | NavSection)[]
}>()

const route = useRoute()

const isActive = (id: string) => {
  // Match against route path
  return route.path.includes(`/${id}`)
}
</script>

<style scoped>
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

/* Responsive Design */
@media (max-width: 768px) {
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
}
</style>
```

---

### components/AppFooter.vue

```vue
<template>
  <footer class="footer">
    <div class="footer-content">
      <p>
        <a href="https://github.com/einhasad/vue-datatable" target="_blank">GitHub</a> •
        <a href="https://www.npmjs.com/package/@grid-vue/grid" target="_blank">npm</a>
      </p>
    </div>
  </footer>
</template>

<style scoped>
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
</style>
```

---

### components/ExampleSection.vue

```vue
<template>
  <section :id="id" class="section">
    <h2>{{ title }}</h2>
    <div v-if="description" class="example-description">
      <p>{{ description }}</p>
    </div>
    <slot />
  </section>
</template>

<script setup lang="ts">
defineProps<{
  id: string
  title: string
  description?: string
}>()
</script>

<style scoped>
.section {
  margin-bottom: 4rem;
  scroll-margin-top: 2rem;
}

.section:last-child {
  margin-bottom: 2rem;
}

.example-description {
  margin-bottom: 1.5rem;
  color: #4a5568;
}
</style>
```

---

### components/ExampleCode.vue

```vue
<template>
  <div class="example-section">
    <h3>Code</h3>
    <pre class="code-block"><code>{{ code }}</code></pre>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  code: string
}>()
</script>

<style scoped>
.example-section {
  margin-bottom: 2rem;
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
</style>
```

---

## 3. SAMPLE PAGES

### pages/examples/introduction.vue

```vue
<template>
  <ExampleSection
    id="introduction"
    title="Welcome to Grid Vue Examples"
  >
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
  </ExampleSection>
</template>

<style scoped>
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

.actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
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
</style>
```

---

### pages/examples/basic.vue

```vue
<template>
  <ExampleSection
    id="basic"
    title="Basic Example"
    description="This example demonstrates the most basic usage of Grid Vue with an ArrayDataProvider. The grid displays static data without pagination, showing how simple it is to get started."
  >
    <div class="example-section">
      <h3>Demo</h3>
      <Grid
        :data-provider="basicProvider"
        :columns="basicColumns"
      />
    </div>

    <ExampleCode :code="codeExample" />
  </ExampleSection>
</template>

<script setup lang="ts">
import { Grid, ArrayDataProvider, type Column } from '@grid-vue/grid'
import ExampleSection from '~/components/ExampleSection.vue'
import ExampleCode from '~/components/ExampleCode.vue'

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

const codeExample = `<template>
  <Grid
    :data-provider="provider"
    :columns="columns"
  />
</template>

<script setup lang="ts">
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
<\/script>`
</script>
```

---

### pages/examples/sorting.vue

```vue
<template>
  <ExampleSection
    id="sorting"
    title="Sorting Example"
    description="Click on column headers to sort the data. Columns with the 'sort' property enabled will display sort indicators and allow users to toggle between ascending and descending order."
  >
    <div class="example-section">
      <h3>Demo</h3>
      <Grid
        :data-provider="sortingProvider"
        :columns="sortingColumns"
      />
    </div>

    <ExampleCode :code="codeExample" />
  </ExampleSection>
</template>

<script setup lang="ts">
import { Grid, ArrayDataProvider, type Column } from '@grid-vue/grid'
import ExampleSection from '~/components/ExampleSection.vue'
import ExampleCode from '~/components/ExampleCode.vue'

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

const codeExample = `<script setup lang="ts">
import { Grid, ArrayDataProvider, type Column } from '@grid-vue/grid'

const employees = [
  { id: 1, name: 'Alice Johnson', department: 'Engineering', salary: 95000 },
  { id: 2, name: 'Bob Smith', department: 'Marketing', salary: 75000 },
  // ... more employees
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
<\/script>`
</script>
```

---

## 4. COMPOSABLES

### composables/useNavigation.ts

```typescript
export interface NavLink {
  label: string
  id: string
  route: string
}

export interface NavSection {
  title: string
  links: NavLink[]
}

export const useNavigation = () => {
  const navigationItems: (NavLink | NavSection)[] = [
    {
      label: 'Introduction',
      id: 'introduction',
      route: '/examples/introduction'
    },
    {
      label: 'Basic Example',
      id: 'basic',
      route: '/examples/basic'
    },
    {
      title: 'Data Providers',
      links: [
        {
          label: 'Array Provider',
          id: 'array-provider',
          route: '/examples/array-provider'
        },
        {
          label: 'HTTP Provider',
          id: 'http-provider',
          route: '/examples/http-provider'
        }
      ]
    },
    {
      title: 'State Providers',
      links: [
        {
          label: 'InMemory',
          id: 'state-inmemory',
          route: '/examples/state-inmemory'
        },
        {
          label: 'LocalStorage',
          id: 'state-localstorage',
          route: '/examples/state-localstorage'
        },
        {
          label: 'QueryParams',
          id: 'state-queryparams',
          route: '/examples/state-queryparams'
        },
        {
          label: 'Hash',
          id: 'state-hash',
          route: '/examples/state-hash'
        }
      ]
    },
    {
      title: 'Advanced',
      links: [
        {
          label: 'Multi-State Example',
          id: 'multi-state',
          route: '/examples/multi-state'
        }
      ]
    },
    {
      label: 'Page Pagination',
      id: 'page-pagination',
      route: '/examples/page-pagination'
    },
    {
      label: 'Cursor Pagination',
      id: 'cursor-pagination',
      route: '/examples/cursor-pagination'
    },
    {
      label: 'Sorting',
      id: 'sorting',
      route: '/examples/sorting'
    },
    {
      label: 'Search & Sort',
      id: 'search-sort',
      route: '/examples/search-sort'
    },
    {
      label: 'Custom Columns',
      id: 'custom-columns',
      route: '/examples/custom-columns'
    },
    {
      label: 'Row Actions',
      id: 'row-actions',
      route: '/examples/row-actions'
    }
  ]

  return { navigationItems }
}
```

---

### composables/useScrollNavigation.ts (Optional - if single-page needed)

```typescript
import { ref, onMounted, onUnmounted } from 'vue'

export const useScrollNavigation = () => {
  const activeSection = ref('introduction')

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

  const updateActiveSection = () => {
    const scrollPosition = window.scrollY + 150

    for (let i = sections.length - 1; i >= 0; i--) {
      const section = document.getElementById(sections[i])
      if (section && section.offsetTop <= scrollPosition) {
        activeSection.value = sections[i]
        break
      }
    }
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      activeSection.value = sectionId
    }
  }

  onMounted(() => {
    window.addEventListener('scroll', updateActiveSection)
    updateActiveSection()
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', updateActiveSection)
  })

  return { activeSection, scrollToSection }
}
```

---

## 5. CONFIGURATION FILES

### nuxt.config.ts

```typescript
export default defineNuxtConfig({
  ssr: false,
  modules: [],

  app: {
    head: {
      title: 'Grid Vue Examples',
      meta: [
        { name: 'description', content: 'Interactive examples for Grid Vue component library' }
      ]
    }
  },

  runtimeConfig: {
    public: {
      mockApiUrl: process.env.VITE_MOCK_API_URL || 'http://localhost:3001'
    }
  },

  vite: {
    define: {
      'process.env.VITE_MOCK_API_URL': JSON.stringify(process.env.VITE_MOCK_API_URL)
    }
  }
})
```

---

### .env.example

```env
# Mock API Configuration
VITE_MOCK_API_URL=http://localhost:3001
```

---

## 6. ENTRY POINT

### app.vue (Nuxt Root)

```vue
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
```

---

## 7. UTILITY EXAMPLES

### utils/logging.ts

```typescript
export const logInitialization = () => {
  console.log('='.repeat(80))
  console.log('[Grid Vue Examples] Application initialized')
  console.log('[Grid Vue Examples] Timestamp:', new Date().toISOString())
  console.log('[Grid Vue Examples] Environment:')
  console.log('  - MOCK_API_URL:', import.meta.env.VITE_MOCK_API_URL)
  console.log('  - MODE:', import.meta.env.MODE)
  console.log('[Grid Vue Examples] Location:', window.location.href)
  console.log('='.repeat(80))
}

export const logHttpRequest = (url: string, params?: Record<string, any>) => {
  console.log('[HTTP Request]', { url, params })
}

export const logHttpResponse = (status: number, data?: any) => {
  console.log('[HTTP Response]', { status, dataKeys: Object.keys(data || {}) })
}
```

---

### utils/data-generators.ts

```typescript
interface User {
  id: number
  name: string
  email: string
  role: string
  status?: string
}

interface Product {
  id: number
  name: string
  category: string
  price: number
  stock: number
}

export const generateUsers = (count: number): User[] => {
  const roles = ['Admin', 'User', 'Editor', 'Manager']
  const statuses = ['Active', 'Inactive']
  const firstNames = ['John', 'Jane', 'Bob', 'Alice', 'Charlie', 'Diana', 'Eve', 'Frank']
  const lastNames = ['Doe', 'Smith', 'Johnson', 'Brown', 'Wilson', 'Moore', 'Taylor', 'Anderson']

  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`,
    email: `user${i + 1}@example.com`,
    role: roles[i % roles.length],
    status: statuses[i % 2]
  }))
}

export const generateProducts = (count: number): Product[] => {
  const categories = ['Electronics', 'Accessories', 'Office', 'Home']
  const names = ['Laptop', 'Mouse', 'Cable', 'Monitor', 'Keyboard', 'Webcam', 'Lamp', 'Chair']

  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `${names[i % names.length]} ${i + 1}`,
    category: categories[i % categories.length],
    price: Math.floor(Math.random() * 2000) + 10,
    stock: Math.floor(Math.random() * 200) + 10
  }))
}
```

---

## 8. PACKAGE.JSON SCRIPTS

```json
{
  "scripts": {
    "dev": "nuxi dev",
    "build": "nuxi build",
    "preview": "nuxi preview",
    "generate": "nuxi generate",
    "type-check": "nuxi typecheck",
    "lint": "eslint .",
    "format": "prettier --write ."
  },
  "devDependencies": {
    "nuxt": "^3.x.x",
    "vue": "^3.x.x",
    "vue-router": "^4.x.x",
    "typescript": "^5.x.x",
    "@grid-vue/grid": "latest"
  }
}
```

---

## 9. QUICK START CHECKLIST

```
REFACTORING CHECKLIST
====================

Foundation:
[ ] Create directory structure
[ ] Create layouts/default.vue
[ ] Create shared components (Header, Footer, Sidebar, ExampleSection, ExampleCode)
[ ] Create composables/useNavigation.ts
[ ] Create app.vue entry point
[ ] Create nuxt.config.ts
[ ] Test layout rendering

Low-Complexity Pages:
[ ] pages/examples/introduction.vue
[ ] pages/examples/basic.vue
[ ] pages/examples/sorting.vue
[ ] pages/examples/state-inmemory.vue
[ ] pages/examples/state-localstorage.vue
[ ] pages/examples/state-queryparams.vue
[ ] pages/examples/state-hash.vue

Medium-Complexity Pages:
[ ] pages/examples/array-provider.vue
[ ] pages/examples/page-pagination.vue
[ ] pages/examples/cursor-pagination.vue
[ ] pages/examples/row-actions.vue

High-Complexity Pages:
[ ] pages/examples/http-provider.vue
[ ] pages/examples/multi-state.vue
[ ] pages/examples/search-sort.vue
[ ] pages/examples/custom-columns.vue

Utilities:
[ ] Create composables/useScrollNavigation.ts
[ ] Create utils/logging.ts
[ ] Create utils/data-generators.ts
[ ] Create utils/api-clients.ts

Styles:
[ ] Move global styles to assets/styles/
[ ] Verify responsive design
[ ] Test on mobile

Final:
[ ] Test all pages and navigation
[ ] Test with mock API
[ ] Verify TypeScript compilation
[ ] Remove backup files
[ ] Update documentation
```

---

## 10. COMMON PATTERNS

### Pattern 1: Simple Grid Example
```vue
<template>
  <ExampleSection id="example-id" title="Example Title" description="...">
    <div class="example-section">
      <h3>Demo</h3>
      <Grid :data-provider="provider" :columns="columns" />
    </div>
    <ExampleCode :code="codeExample" />
  </ExampleSection>
</template>

<script setup lang="ts">
import { Grid, ArrayDataProvider, type Column } from '@grid-vue/grid'
import ExampleSection from '~/components/ExampleSection.vue'
import ExampleCode from '~/components/ExampleCode.vue'

// Define data
const data = [...]

// Create provider
const provider = new ArrayDataProvider({...})

// Define columns
const columns: Column[] = [...]

// Define code example string
const codeExample = `...`
</script>
```

### Pattern 2: Grid with Event Handlers
```vue
<script setup lang="ts">
const selectedItem = ref(null)

function handleSelect(item: any) {
  selectedItem.value = item
}

function getRowOptions(item: any) {
  return {
    class: { selected: selectedItem.value?.id === item.id },
    style: { cursor: 'pointer' }
  }
}
</script>

<template>
  <div v-if="selectedItem">Selected: {{ selectedItem.name }}</div>
  <Grid
    :data-provider="provider"
    :columns="columns"
    :on-row-click="handleSelect"
    :row-options="getRowOptions"
  />
</template>
```

### Pattern 3: Grid with Custom Filters
```vue
<script setup lang="ts">
const filters = ref({})

const onFilterChange = async () => {
  Object.entries(filters.value).forEach(([key, value]) => {
    if (value) {
      stateProvider.setFilter(key, value)
    } else {
      stateProvider.clearFilter(key)
    }
  })
  await provider.refresh()
}
</script>

<template>
  <Grid :data-provider="provider" :columns="columns">
    <template #filters>
      <td v-for="column in columns" :key="column.key">
        <input
          v-model="filters[column.key]"
          type="text"
          :placeholder="`Search ${column.label}...`"
          @input="onFilterChange"
        />
      </td>
    </template>
  </Grid>
</template>
```

---

This provides comprehensive code templates to accelerate your refactoring process.

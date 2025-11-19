# Nuxt File Structure for Refactored Examples

This document shows the recommended file organization after refactoring `App.vue` into a Nuxt application.

---

## Complete Directory Tree

```
examples/
├── app.vue                                    # Nuxt root component (minimal)
├── nuxt.config.ts                            # Nuxt configuration
├── tsconfig.json
├── package.json
├── .env.example
│
├── layouts/
│   └── default.vue                           # Main layout (header, sidebar, footer)
│
├── pages/
│   └── examples/
│       ├── index.vue                         # Redirects to introduction
│       ├── introduction.vue                  # Introduction & features
│       ├── basic.vue                         # Basic example (ArrayDataProvider, no pagination)
│       │
│       ├── array-provider.vue                # Array Provider example
│       ├── http-provider.vue                 # HTTP Provider with GitHub API
│       │
│       ├── state-inmemory.vue                # InMemory state provider
│       ├── state-localstorage.vue            # LocalStorage state provider
│       ├── state-queryparams.vue             # QueryParams state provider
│       ├── state-hash.vue                    # Hash state provider
│       │
│       ├── multi-state.vue                   # Multi-grid example
│       ├── page-pagination.vue               # Page-based pagination
│       ├── cursor-pagination.vue             # Cursor-based pagination (load more)
│       │
│       ├── sorting.vue                       # Column sorting
│       ├── search-sort.vue                   # Inline search and sort filters
│       ├── custom-columns.vue                # Custom column rendering
│       └── row-actions.vue                   # Row click handlers and styling
│
├── components/
│   ├── AppHeader.vue                         # Page header (purple gradient)
│   ├── SidebarNav.vue                        # Left sidebar navigation
│   ├── AppFooter.vue                         # Page footer with links
│   ├── ExampleSection.vue                    # Section wrapper component
│   └── ExampleCode.vue                       # Code block display component
│
├── composables/
│   ├── useScrollNavigation.ts                # Scroll-based section tracking
│   ├── useNavigation.ts                      # Navigation data and utilities
│   └── useMockApi.ts                         # Mock API utilities
│
├── utils/
│   ├── logging.ts                            # Console logging utilities
│   ├── data-generators.ts                    # Mock data generation
│   └── api-clients.ts                        # HTTP client utilities
│
├── assets/
│   └── styles/
│       ├── global.css                        # Global styles
│       ├── layout.css                        # Layout and grid styles
│       ├── components.css                    # Component-specific styles
│       ├── buttons.css                       # Button styles
│       ├── forms.css                         # Form input styles
│       └── responsive.css                    # Responsive design
│
├── public/
│   └── (static assets)
│
└── server/
    └── api/
        └── search/
            └── repositories.ts               # Mock GitHub API endpoint
```

---

## 1. KEY FILE DESCRIPTIONS

### layouts/default.vue
**Purpose:** Main application layout with header, sidebar, and footer

**Responsibilities:**
- Render header and footer
- Display sidebar navigation
- Manage navigation state (active section, scroll tracking)
- Render page content in main area
- Handle scroll event listener setup/cleanup

**Key Props/Data:**
```typescript
const activeSection = ref('introduction')
const navigationItems = ref([...]) // navigation structure
const route = useRoute()
```

**Size:** ~80-100 lines

---

### pages/examples/introduction.vue
**Purpose:** Introduction page with features and quick links

**Content:**
- Hero section with welcome message
- Feature list (10 features)
- Installation instructions with code block
- Quick links to GitHub and npm

**Complexity:** Low
**Size:** ~40-50 lines
**Dependencies:** ExampleSection, ExampleCode

---

### pages/examples/basic.vue
**Purpose:** Most basic Grid usage without pagination

**Data:**
```typescript
const basicUsers = [5 users] // hardcoded
const basicProvider = new ArrayDataProvider({
  items: basicUsers,
  pagination: false,
  paginationMode: 'cursor'
})
const basicColumns = [id, name, email, role]
```

**Template:**
- Description of example
- Grid component
- Code example

**Complexity:** Low
**Size:** ~60-80 lines
**Dependencies:** Grid, ArrayDataProvider, ExampleSection, ExampleCode

---

### pages/examples/array-provider.vue
**Purpose:** Demonstrate ArrayDataProvider with page-based pagination

**Data:**
```typescript
const products = [10 products] // hardcoded
const arrayProvider = new ArrayDataProvider({
  items: products,
  pagination: true,
  paginationMode: 'page',
  pageSize: 5
})
const arrayColumns = [id, name, category, price, stock] (sortable)
```

**Template:**
- Description with key features
- Grid component with pagination
- Code example

**Complexity:** Low
**Size:** ~70-90 lines

---

### pages/examples/http-provider.vue
**Purpose:** Demonstrate HttpDataProvider with real API (GitHub)

**Data:**
```typescript
const githubSearchQuery = ref('vue table')
const githubSortBy = ref('stars')
const githubTotalCount = ref(0)
const githubGridRef = ref(null)

const githubAdapter = new GitHubSearchAdapter()
const githubProvider = new HttpDataProvider({
  url: '...',
  pagination: true,
  paginationMode: 'page',
  pageSize: 10,
  responseAdapter: githubAdapter,
  httpClient: githubHttpClient,
  stateProvider: new QueryParamsStateProvider({ router, prefix: 'gh' })
})
```

**Features:**
- Search input for repositories
- Sort dropdown (stars, forks, updated, help-wanted)
- Results counter
- Grid component with pagination
- Custom adapter for GitHub API format

**Event Handlers:**
- handleGithubSearch() - search and update results
- watch route.query - sync URL params with local state
- watch githubGridRef.pagination - update result count

**Complexity:** High
**Size:** ~120-150 lines
**Dependencies:** Grid, HttpDataProvider, QueryParamsStateProvider, ExampleSection

---

### pages/examples/state-inmemory.vue
**Purpose:** Demonstrate InMemoryStateProvider

**Data:**
```typescript
const stateUsers = [12 users]
const inMemoryProvider = new ArrayDataProvider({
  items: stateUsers,
  pagination: true,
  paginationMode: 'page',
  pageSize: 5,
  stateProvider: new InMemoryStateProvider()
})
const stateColumns = [5 sortable columns]
```

**Note:** State is lost on page refresh

**Complexity:** Low
**Size:** ~50-60 lines

---

### pages/examples/state-localstorage.vue
**Purpose:** Demonstrate LocalStorageStateProvider

**Data:**
```typescript
const localStorageProvider = new ArrayDataProvider({
  items: stateUsers,
  pagination: true,
  paginationMode: 'page',
  pageSize: 5,
  stateProvider: new LocalStorageStateProvider({
    storageKey: 'grid-demo-state'
  })
})
```

**Note:** State persists across sessions

**Complexity:** Low
**Size:** ~50-60 lines

---

### pages/examples/state-queryparams.vue
**Purpose:** Demonstrate QueryParamsStateProvider

**Data:**
```typescript
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
```

**Features:**
- URL query parameters updated on sort/filter/pagination
- Shareable URLs
- Browser back/forward support

**Complexity:** Low
**Size:** ~50-60 lines

---

### pages/examples/state-hash.vue
**Purpose:** Demonstrate HashStateProvider

**Data:**
```typescript
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
```

**Features:**
- URL hash fragment updated on sort/filter
- Doesn't interfere with query params

**Complexity:** Low
**Size:** ~50-60 lines

---

### pages/examples/multi-state.vue
**Purpose:** Demonstrate multiple grids with independent state

**Data:**
```typescript
// Array Provider Grid
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

// HTTP Provider Grid
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
```

**Features:**
- Two grids on same page
- Independent pagination/sorting/filtering
- URL contains state for both: `?products-page=2&users-sort=email`

**Complexity:** High
**Size:** ~100-130 lines

---

### pages/examples/page-pagination.vue
**Purpose:** Demonstrate page-based pagination with numbered buttons

**Data:**
```typescript
const pagePaginationUsers = [47 users generated]
const pagePaginationProvider = new ArrayDataProvider({
  items: pagePaginationUsers,
  pagination: true,
  paginationMode: 'page',
  pageSize: 10
})
```

**Template:**
- Grid with custom pagination slot
- PagePagination component with:
  - Previous/Next buttons
  - Numbered page buttons
  - Summary text
  - Max visible pages setting

**Complexity:** Medium
**Size:** ~80-100 lines

---

### pages/examples/cursor-pagination.vue
**Purpose:** Demonstrate cursor-based pagination with Load More button

**Data:**
```typescript
const cursorPaginationProducts = [35 products generated]
const cursorPaginationProvider = new ArrayDataProvider({
  items: cursorPaginationProducts,
  pagination: true,
  paginationMode: 'cursor',
  pageSize: 8
})
```

**Template:**
- Grid with custom pagination slot
- LoadModePagination component with:
  - "Load More" button
  - Loading state handling
  - Row accumulation on load more

**Complexity:** Medium
**Size:** ~80-100 lines

---

### pages/examples/sorting.vue
**Purpose:** Demonstrate column sorting capabilities

**Data:**
```typescript
const employees = [8 employees]
const sortingProvider = new ArrayDataProvider({
  items: employees,
  pagination: false,
  paginationMode: 'cursor'
})
const sortingColumns = [
  { key: 'id', label: 'ID', sort: 'id' },
  { key: 'name', label: 'Name', sort: 'name' },
  { key: 'department', label: 'Department', sort: 'department' },
  { key: 'salary', label: 'Salary', sort: 'salary', value: (row) => `$${...}` }
]
```

**Features:**
- Click column headers to sort
- Toggle between ascending/descending
- Formatted salary display

**Complexity:** Low
**Size:** ~70-90 lines

---

### pages/examples/search-sort.vue
**Purpose:** Demonstrate inline filter inputs in column headers

**Data:**
```typescript
const searchSortEmployees = [15 employees]
const searchSortStateProvider = new InMemoryStateProvider()
const searchSortProvider = new ArrayDataProvider({
  items: searchSortEmployees,
  pagination: true,
  paginationMode: 'page',
  pageSize: 5,
  stateProvider: searchSortStateProvider
})
const searchFilters = ref<Record<string, string>>({
  id: '', name: '', department: '', position: '', salary: ''
})
```

**Features:**
- Filter input row using #filters slot
- Real-time filtering as user types
- Sortable columns
- State provider manages filter state

**Event Handlers:**
- onSearchFilterChange() - update filters and refresh grid

**Template:**
- Custom filters slot with input fields
- Grid component
- Code example

**Complexity:** High
**Size:** ~110-140 lines

---

### pages/examples/custom-columns.vue
**Purpose:** Demonstrate custom cell rendering

**Data:**
```typescript
const tasks = [5 tasks]
const customColumnsProvider = new ArrayDataProvider({
  items: tasks,
  pagination: false,
  paginationMode: 'cursor'
})

const customColumnsColumns: Column[] = [
  { key: 'id', label: 'ID' },
  { key: 'title', label: 'Task' },
  {
    key: 'priority',
    label: 'Priority',
    component: (row) => ({ // Badge with color
      is: 'span',
      props: { style: { background: getPriorityColor(...), ... } },
      content: row.priority.toUpperCase()
    })
  },
  { key: 'status', label: 'Status', value: (row) => row.status.replace('_', ' ') },
  {
    key: 'progress',
    label: 'Progress',
    component: (row) => ({ // Progress bar visualization
      is: 'div',
      children: [ /* progress bar elements */ ]
    })
  }
]
```

**Features:**
- Badge rendering for priority
- Progress bar for task progress
- Status formatting
- Helper function: getPriorityColor()

**Complexity:** High
**Size:** ~120-150 lines

---

### pages/examples/row-actions.vue
**Purpose:** Demonstrate row click handlers and dynamic row styling

**Data:**
```typescript
const rowActionsUsers = [6 users]
const rowActionsProvider = new ArrayDataProvider({
  items: rowActionsUsers,
  pagination: false,
  paginationMode: 'cursor'
})
const selectedUser = ref(null)

const rowActionsColumns: Column[] = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  {
    key: 'active',
    label: 'Status',
    component: (row) => ({ // Status badge
      is: 'span',
      props: {
        style: {
          background: row.active ? '#48bb78' : '#cbd5e0',
          ...
        }
      },
      content: row.active ? 'Active' : 'Inactive'
    })
  }
]
```

**Features:**
- Row click handler updates selectedUser
- Dynamic row styling based on selection/active state
- Display selected user info
- Helper function: getRowOptions()

**Event Handlers:**
- handleRowClick(user) - set selected user
- getRowOptions(user) - return dynamic row classes/styles

**Template:**
- Display selected user info
- Grid with row click handler
- Code example

**Complexity:** Medium
**Size:** ~100-120 lines

---

## 2. COMPONENT DETAILS

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

<script setup lang="ts">
// No data needed - static header
</script>

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

**Size:** ~35 lines
**Complexity:** Low

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
  // Check if current route matches the nav item
  return route.path.includes(id)
}
</script>

<style scoped>
/* ... styles from original ... */
</style>
```

**Size:** ~70 lines
**Complexity:** Low

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

**Size:** ~40 lines
**Complexity:** Low

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

**Size:** ~35 lines
**Complexity:** Low

---

## 3. COMPOSABLES

### composables/useScrollNavigation.ts
**Purpose:** Track active section based on scroll position

**Exports:**
```typescript
export const useScrollNavigation = () => {
  const activeSection = ref('introduction')
  const sections = [
    'introduction', 'basic', 'array-provider', 'http-provider',
    'state-inmemory', 'state-localstorage', 'state-queryparams', 'state-hash',
    'multi-state', 'page-pagination', 'cursor-pagination', 'sorting',
    'search-sort', 'custom-columns', 'row-actions'
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

**Size:** ~50 lines

---

### composables/useNavigation.ts
**Purpose:** Provide navigation structure and utilities

**Exports:**
```typescript
export const useNavigation = () => {
  const navigationItems = [
    { label: 'Introduction', id: 'introduction', route: '/examples/introduction' },
    { label: 'Basic Example', id: 'basic', route: '/examples/basic' },
    {
      title: 'Data Providers',
      links: [
        { label: 'Array Provider', id: 'array-provider', route: '/examples/array-provider' },
        { label: 'HTTP Provider', id: 'http-provider', route: '/examples/http-provider' }
      ]
    },
    // ... rest of navigation structure
  ]

  return { navigationItems }
}
```

**Size:** ~40 lines

---

### composables/useMockApi.ts
**Purpose:** Mock API utilities and handlers

**Exports:**
```typescript
export const useMockApi = () => {
  const mockHttpClient = async (url: string) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    return { /* mock data */ }
  }

  return { mockHttpClient }
}
```

**Size:** ~30 lines

---

## 4. UTILITIES

### utils/data-generators.ts
**Purpose:** Generate mock data sets

**Functions:**
- `generateUsers(count): User[]`
- `generateProducts(count): Product[]`
- `generateEmployees(count): Employee[]`
- `generateTasks(count): Task[]`

**Size:** ~80 lines

---

### utils/api-clients.ts
**Purpose:** HTTP client setup and adapters

**Exports:**
- `GitHubSearchAdapter` class
- `githubHttpClient(url)` function
- Custom response adapters

**Size:** ~100 lines

---

### utils/logging.ts
**Purpose:** Console logging utilities

**Functions:**
- `logInitialization()`
- `logHttpRequest(url, params)`
- `logHttpResponse(status, data)`

**Size:** ~30 lines

---

## 5. STYLING STRUCTURE

### assets/styles/global.css
Global variables, resets, fonts

### assets/styles/layout.css
Layout utilities, flex helpers, containers

### assets/styles/components.css
Component-specific styles (buttons, cards, etc.)

### assets/styles/forms.css
Form input styling, validation states

### assets/styles/responsive.css
Mobile-first responsive design, breakpoints

**Total Styles:** ~2,000 lines (extracted from original)

---

## 6. CONFIGURATION FILES

### nuxt.config.ts
```typescript
export default defineNuxtConfig({
  ssr: false,
  modules: [
    // optional: add UI framework, analytics, etc.
  ],
  vite: {
    define: {
      'process.env.VITE_MOCK_API_URL': JSON.stringify(process.env.VITE_MOCK_API_URL)
    }
  }
})
```

### .env.example
```env
VITE_MOCK_API_URL=http://localhost:3001
```

### tsconfig.json
Standard Nuxt TypeScript configuration

---

## 7. SUMMARY STATISTICS

| Category | Count | Lines |
|---|---|---|
| Layout files | 1 | 100 |
| Page files | 15 | 1,200 |
| Components | 5 | 200 |
| Composables | 3 | 120 |
| Utilities | 3 | 210 |
| Styles | 5 CSS files | 2,000 |
| Config files | 3 | 50 |
| **TOTAL** | **35 files** | **~3,880 lines** |

**Compared to original:**
- Original App.vue: 2,295 lines (1 file)
- Refactored: ~3,880 lines (35 files)
- Increase: Split into focused, reusable modules with better organization
- Maintainability: Greatly improved through modular structure

---

## 8. NEXT STEPS

1. Create the directory structure
2. Extract shared components first (header, footer, sidebar)
3. Create the layout wrapper
4. Move page content one by one (start with low-complexity pages)
5. Move styles to CSS files
6. Create composables and utilities
7. Test navigation and routing
8. Verify all examples work correctly
9. Test responsive design
10. Remove backup files

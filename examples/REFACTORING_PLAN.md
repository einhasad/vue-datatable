# App.vue Refactoring Plan: Nuxt Structure Breakdown

This document provides a complete structural analysis of `/home/user/vue-datatable/examples/src/App.vue.backup` to guide the refactoring into a Nuxt layout with individual pages and shared components.

---

## 1. EXAMPLE SECTIONS INVENTORY

### Complete List of All Example Sections

| ID | Title | Category | Lines | Complexity |
|---|---|---|---|---|
| `introduction` | Welcome to Grid Vue Examples | Intro | 44-88 | Low |
| `basic` | Basic Example | Fundamentals | 90-145 | Low |
| `array-provider` | Array Provider Example | Data Providers | 147-220 | Medium |
| `http-provider` | HTTP Provider Example | Data Providers | 222-337 | High |
| `state-inmemory` | InMemory State Provider | State Providers | 339-365 | Low |
| `state-localstorage` | LocalStorage State Provider | State Providers | 367-399 | Low |
| `state-queryparams` | QueryParams State Provider | State Providers | 401-437 | Low |
| `state-hash` | Hash State Provider | State Providers | 439-475 | Low |
| `multi-state` | Multi-State Example | Advanced | 477-539 | High |
| `page-pagination` | Page Pagination Example | Pagination | 541-613 | Medium |
| `cursor-pagination` | Cursor Pagination Example | Pagination | 615-685 | Medium |
| `sorting` | Sorting Example | Features | 687-744 | Low |
| `search-sort` | Inline Search & Sort Example | Features | 746-895 | High |
| `custom-columns` | Custom Columns Example | Features | 897-1023 | High |
| `row-actions` | Row Actions Example | Features | 1025-1128 | Medium |

**Total Examples:** 15 sections

---

## 2. NAVIGATION STRUCTURE

### Sidebar Navigation Hierarchy

```
Navigation Root
├── Primary Links (No Grouping)
│   ├── Introduction (#introduction)
│   ├── Basic Example (#basic)
│
├── Data Providers (nav-section)
│   ├── Array Provider (#array-provider) [nav-sub-link]
│   ├── HTTP Provider (#http-provider) [nav-sub-link]
│
├── State Providers (nav-section)
│   ├── InMemory (#state-inmemory) [nav-sub-link]
│   ├── LocalStorage (#state-localstorage) [nav-sub-link]
│   ├── QueryParams (#state-queryparams) [nav-sub-link]
│   ├── Hash (#state-hash) [nav-sub-link]
│
├── Advanced (nav-section)
│   ├── Multi-State Example (#multi-state) [nav-sub-link]
│
└── Primary Links (Continued)
    ├── Page Pagination (#page-pagination)
    ├── Cursor Pagination (#cursor-pagination)
    ├── Sorting (#sorting)
    ├── Search & Sort (#search-sort)
    ├── Custom Columns (#custom-columns)
    └── Row Actions (#row-actions)
```

### Navigation Data Structure for Nuxt

```typescript
interface NavLink {
  label: string
  id: string
  route?: string
  children?: NavLink[]
}

interface NavSection {
  title: string
  links: NavLink[]
}

const navigation: (NavLink | NavSection)[] = [
  { label: 'Introduction', id: 'introduction', route: '/examples/introduction' },
  { label: 'Basic Example', id: 'basic', route: '/examples/basic' },
  {
    title: 'Data Providers',
    links: [
      { label: 'Array Provider', id: 'array-provider', route: '/examples/array-provider' },
      { label: 'HTTP Provider', id: 'http-provider', route: '/examples/http-provider' }
    ]
  },
  {
    title: 'State Providers',
    links: [
      { label: 'InMemory', id: 'state-inmemory', route: '/examples/state-inmemory' },
      { label: 'LocalStorage', id: 'state-localstorage', route: '/examples/state-localstorage' },
      { label: 'QueryParams', id: 'state-queryparams', route: '/examples/state-queryparams' },
      { label: 'Hash', id: 'state-hash', route: '/examples/state-hash' }
    ]
  },
  {
    title: 'Advanced',
    links: [
      { label: 'Multi-State Example', id: 'multi-state', route: '/examples/multi-state' }
    ]
  },
  { label: 'Page Pagination', id: 'page-pagination', route: '/examples/page-pagination' },
  { label: 'Cursor Pagination', id: 'cursor-pagination', route: '/examples/cursor-pagination' },
  { label: 'Sorting', id: 'sorting', route: '/examples/sorting' },
  { label: 'Search & Sort', id: 'search-sort', route: '/examples/search-sort' },
  { label: 'Custom Columns', id: 'custom-columns', route: '/examples/custom-columns' },
  { label: 'Row Actions', id: 'row-actions', route: '/examples/row-actions' }
]
```

---

## 3. SHARED COMPONENTS TO EXTRACT

### Component 1: Header
**Path:** `components/AppHeader.vue`

**Template Sections:**
- Purple gradient background
- Title: "Grid Vue"
- Tagline: "A flexible, configurable grid component library for Vue 3"

**Styles:**
- `.header` - gradient background (lines 1926-1930)
- `.header-content` - max-width container (lines 1932-1935)
- `.header h1` - title styling (lines 1937-1940)
- `.tagline` - subtitle styling (lines 1942-1947)

**Props:** None (hardcoded values)

**Template Structure:**
```vue
<template>
  <header class="header">
    <div class="header-content">
      <h1>Grid Vue</h1>
      <p class="tagline">A flexible, configurable grid component library for Vue 3</p>
    </div>
  </header>
</template>
```

---

### Component 2: Sidebar Navigation
**Path:** `components/SidebarNav.vue`

**Template Sections:**
- `<aside class="sidebar">`
- `<nav class="nav">`
- Navigation links and sections
- Active state tracking

**Styles:**
- `.sidebar` (lines 1957-1966)
- `.nav` (lines 1968-1970)
- `.nav-section` (lines 1972-1974)
- `.nav-section-title` (lines 1976-1984)
- `.nav-sub-link` (lines 1986-1989)
- `.nav-link` (lines 1991-2011)

**Props:**
- `navigationItems: (NavLink | NavSection)[]`
- `activeSection: string`

**Events:**
- `@section-changed(id: string)` - when navigation changes

**Key Features:**
- Sticky positioning
- Horizontal scrolling on mobile
- Active state highlighting
- Sub-link indentation

**Template Structure:**
```vue
<template>
  <aside class="sidebar">
    <nav class="nav">
      <template v-for="item in navigationItems">
        <a v-if="!item.title" :href="`#${item.id}`" ...>{{ item.label }}</a>
        <div v-else class="nav-section">
          <span class="nav-section-title">{{ item.title }}</span>
          <a v-for="link in item.links" ...>{{ link.label }}</a>
        </div>
      </template>
    </nav>
  </aside>
</template>
```

---

### Component 3: Footer
**Path:** `components/AppFooter.vue`

**Template Sections:**
- Footer wrapper
- Links to GitHub and npm

**Styles:**
- `.footer` (lines 2224-2228)
- `.footer-content` (lines 2231-2234)
- `.footer a` (lines 2236-2243)

**Props:** None (hardcoded values)

**Template Structure:**
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
```

---

### Component 4: Section Layout Wrapper
**Path:** `components/ExampleSection.vue`

**Purpose:** Wrap each example section with consistent styling

**Props:**
- `id: string` - section ID
- `title: string` - section title
- `description?: string` - optional description

**Template Structure:**
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
```

**Styles:**
- `.section` (lines 2023-2030)
- `.example-description` (lines 2056-2059)

---

### Component 5: Example Code Block
**Path:** `components/ExampleCode.vue`

**Purpose:** Display code examples consistently

**Props:**
- `code: string` - the code to display
- `language?: string` - language hint (default: empty)

**Template Structure:**
```vue
<template>
  <div class="example-section">
    <h3>Code</h3>
    <pre class="code-block"><code>{{ code }}</code></pre>
  </div>
</template>
```

**Styles:**
- `.code-block` (lines 2091-2104)

---

### Global Styles to Extract
**Path:** `assets/styles/global.css` or `app.css`

**Styles to Move:**
- Common layout styles (`.app`, `.layout`, `.main`, `.content`)
- Button styles (`.btn`, `.btn-primary`, `.btn-secondary`)
- Input styles (`.search-input`, `.sort-select`, `.filter-input`)
- Control styles (`.controls`, `.control-group`)
- Info box styles (`.info`)
- Responsive design (media queries)
- Row action styles (`.row-clickable`, `.row-selected`, `.row-inactive`)

**Lines:** 1919-2293

---

## 4. LAYOUT STRUCTURE

### Nuxt Layout File
**Path:** `layouts/default.vue`

**Structure:**
```vue
<template>
  <div class="app">
    <AppHeader />

    <div class="layout">
      <SidebarNav
        :navigation-items="navigationItems"
        :active-section="activeSection"
        @section-changed="activeSection = $event"
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

<script setup>
import AppHeader from '~/components/AppHeader.vue'
import SidebarNav from '~/components/SidebarNav.vue'
import AppFooter from '~/components/AppFooter.vue'

const navigationItems = ref([...])
const activeSection = ref('introduction')

// Scroll tracking logic
</script>
```

---

## 5. INDIVIDUAL EXAMPLE PAGE STRUCTURES

### Example: Introduction Page
**Path:** `pages/examples/introduction.vue`

**Data from App.vue:**
- Lines 44-88: Template content
- No script data (static content)

**Structure:**
```vue
<template>
  <ExampleSection id="introduction" title="Welcome to Grid Vue Examples">
    <div class="hero">
      <h2>Welcome to Grid Vue Examples</h2>
      <p>Explore interactive examples...</p>
    </div>

    <div class="example-section">
      <h3>Features</h3>
      <ul class="feature-list">
        <!-- feature items -->
      </ul>
    </div>

    <div class="example-section">
      <h3>Installation</h3>
      <div class="code-block">npm install @grid-vue/grid</div>
    </div>

    <div class="example-section">
      <h3>Quick Links</h3>
      <div class="actions">
        <!-- links -->
      </div>
    </div>
  </ExampleSection>
</template>
```

---

### Example: Basic Example Page
**Path:** `pages/examples/basic.vue`

**Data from App.vue:**
- Lines 1183-1203: basicUsers, basicProvider, basicColumns
- Lines 91-145: Template content

**Script Data:**
```typescript
const basicUsers = [...]
const basicProvider = new ArrayDataProvider({...})
const basicColumns: Column[] = [...]
```

**Template Structure:**
```vue
<template>
  <ExampleSection id="basic" title="Basic Example">
    <div class="example-description">
      <p>This example demonstrates the most basic usage...</p>
    </div>

    <div class="example-section">
      <h3>Demo</h3>
      <Grid :data-provider="basicProvider" :columns="basicColumns" />
    </div>

    <ExampleCode :code="codeExample" />
  </ExampleSection>
</template>
```

---

### Example: Array Provider Page
**Path:** `pages/examples/array-provider.vue`

**Data from App.vue:**
- Lines 1205-1232: products, arrayProvider, arrayColumns
- Lines 147-220: Template content

---

### Example: HTTP Provider Page
**Path:** `pages/examples/http-provider.vue`

**Data from App.vue:**
- Lines 1369-1534: GitHub API setup and columns
- Lines 222-337: Template content

**Complex Features:**
- Search input binding (lines 238-245)
- Sort dropdown (lines 247-255)
- Total count display (lines 257-259)
- Grid ref for refresh (line 266)
- Custom HTTP client (lines 1409-1461)
- Route watchers (lines 1563-1573)
- Search handler (lines 1536-1553)

---

### Example: State Providers Pages
**Path:** `pages/examples/state-inmemory.vue`, etc.

**Data from App.vue:**
- Lines 1234-1294: State provider setup for each variant
- Similar template structure for all 4 providers

**Variants:**
1. `state-inmemory.vue` - InMemoryStateProvider
2. `state-localstorage.vue` - LocalStorageStateProvider
3. `state-queryparams.vue` - QueryParamsStateProvider
4. `state-hash.vue` - HashStateProvider

---

### Example: Multi-State Page
**Path:** `pages/examples/multi-state.vue`

**Data from App.vue:**
- Lines 1296-1367: Array provider + HTTP provider setups
- Lines 477-539: Template content

**Complex Features:**
- Two grids with independent state
- Different state provider prefixes
- Mock HTTP client

---

### Example: Pagination Pages
**Path:** `pages/examples/page-pagination.vue` and `cursor-pagination.vue`

**Page Pagination:**
- Lines 1575-1595: pagePaginationUsers, provider, columns
- Lines 541-613: Template with PagePagination component
- Custom pagination slot

**Cursor Pagination:**
- Lines 1597-1617: cursorPaginationProducts, provider, columns
- Lines 615-685: Template with LoadModePagination component
- Custom pagination slot

---

### Example: Sorting Page
**Path:** `pages/examples/sorting.vue`

**Data from App.vue:**
- Lines 1619-1647: employees, sortingProvider, sortingColumns
- Lines 687-744: Template content

---

### Example: Search & Sort Page
**Path:** `pages/examples/search-sort.vue`

**Data from App.vue:**
- Lines 1649-1704: searchSortEmployees, provider, columns
- Lines 746-895: Template content

**Complex Features:**
- Filter input row (lines 766-781)
- searchFilters reactive object (lines 1678-1684)
- onSearchFilterChange handler (lines 1686-1696)
- State provider for filter management

---

### Example: Custom Columns Page
**Path:** `pages/examples/custom-columns.vue`

**Data from App.vue:**
- Lines 1706-1804: tasks, customColumnsProvider, customColumnsColumns
- Lines 897-1023: Template content

**Complex Features:**
- Helper function: getPriorityColor (lines 1721-1729)
- Component-based cell rendering with custom styles
- Progress bar visualization

---

### Example: Row Actions Page
**Path:** `pages/examples/row-actions.vue`

**Data from App.vue:**
- Lines 1807-1863: rowActionsUsers, provider, columns
- Lines 1025-1128: Template content
- Lines 1824-1839: Event handlers

**Complex Features:**
- selectedUser reactive state (line 1822)
- handleRowClick handler (lines 1824-1826)
- getRowOptions function (lines 1828-1839)
- Dynamic row styling based on state

---

## 6. SCRIPT LOGIC BREAKDOWN

### Shared Script Logic

#### 1. Navigation and Scrolling
**Source:** Lines 1866-1916

```typescript
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
  const sections = [...] // all section IDs
  const scrollPosition = window.scrollY + 150
  // Update activeSection based on scroll position
}

onMounted(() => {
  window.addEventListener('scroll', updateActiveSection)
  updateActiveSection()
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateActiveSection)
})
```

**Move to:** `composables/useScrollNavigation.ts`

#### 2. Logging
**Source:** Lines 1148-1158

```typescript
console.log('='.repeat(80))
console.log('[App.vue] Initializing Grid Vue Examples App')
// ... environment logging
```

**Move to:** `utils/logging.ts` or remove for production

---

## 7. STYLING BREAKDOWN

### Responsive Design
**Source:** Lines 2259-2293

The stylesheet includes responsive behavior:
- Desktop: Sidebar layout on left
- Mobile (< 768px): Sidebar becomes horizontal scrollable navigation
- Adjustments for flex-direction, borders, navigation flow

**Considerations for Nuxt:**
- Move to `assets/styles/layout.css`
- Ensure media query breakpoints align with Nuxt config
- Consider using Tailwind if preferred

---

## 8. MIGRATION CHECKLIST

### Phase 1: Shared Components
- [ ] Extract `AppHeader.vue`
- [ ] Extract `SidebarNav.vue`
- [ ] Extract `AppFooter.vue`
- [ ] Extract `ExampleSection.vue` wrapper
- [ ] Extract `ExampleCode.vue` component
- [ ] Extract global styles to CSS files

### Phase 2: Layout
- [ ] Create `layouts/default.vue`
- [ ] Move navigation logic
- [ ] Setup scroll tracking
- [ ] Move all related styles

### Phase 3: Individual Pages
- [ ] Create page files for each example
- [ ] Move data definitions to each page
- [ ] Move example-specific event handlers
- [ ] Move example-specific styles

### Phase 4: Utilities and Composables
- [ ] Extract scroll tracking to composable
- [ ] Extract navigation data structure
- [ ] Create shared helper functions
- [ ] Setup any mock API utilities

### Phase 5: Testing and Cleanup
- [ ] Update imports and paths
- [ ] Test navigation between pages
- [ ] Verify scroll tracking works
- [ ] Test responsive design
- [ ] Remove backup file

---

## 9. KEY CONSIDERATIONS

### 1. Route Organization
```
/examples/
  /introduction
  /basic
  /array-provider
  /http-provider
  /state-inmemory
  /state-localstorage
  /state-queryparams
  /state-hash
  /multi-state
  /page-pagination
  /cursor-pagination
  /sorting
  /search-sort
  /custom-columns
  /row-actions
```

### 2. Data Provider Initialization
- Each page initializes its own DataProvider instances
- HTTP provider uses mock API from environment variable
- Ensure router is available where needed (QueryParamsStateProvider, HashStateProvider)

### 3. Active Section Tracking
- Current implementation uses scroll position to track active section
- In Nuxt with separate pages, consider using current route instead
- May want to disable scroll tracking for SPA navigation

### 4. Environment Variables
- `VITE_MOCK_API_URL` - Used in HTTP provider example
- Verify env var handling in Nuxt config

### 5. Mock API
- GitHub HTTP provider uses mock API endpoint
- Ensure mock server is available during development

---

## 10. CODE EXTRACTION SUMMARY

| Component/Page | Lines | Data Objects | Imports | Complexity |
|---|---|---|---|---|
| Header | 3-8 | 0 | 0 | Low |
| Sidebar | 12-38 | 0 | 0 | Low |
| Footer | 1133-1140 | 0 | 0 | Low |
| Introduction | 44-88 | 0 | 0 | Low |
| Basic | 90-145 | 3 (basicUsers, basicProvider, basicColumns) | Grid, ArrayDataProvider | Low |
| Array Provider | 147-220 | 3 (products, arrayProvider, arrayColumns) | Grid, ArrayDataProvider | Low |
| HTTP Provider | 222-337 | 1 (githubColumns) + setup | Grid, HttpDataProvider, QueryParamsStateProvider | High |
| State: InMemory | 339-365 | 1 (inMemoryProvider) | ArrayDataProvider, InMemoryStateProvider | Low |
| State: LocalStorage | 367-399 | 1 (localStorageProvider) | ArrayDataProvider, LocalStorageStateProvider | Low |
| State: QueryParams | 401-437 | 1 (queryParamsProvider) | ArrayDataProvider, QueryParamsStateProvider | Low |
| State: Hash | 439-475 | 1 (hashProvider) | ArrayDataProvider, HashStateProvider | Low |
| Multi-State | 477-539 | 2 (multiStateArrayProvider, multiStateHttpProvider) | ArrayDataProvider, HttpDataProvider | High |
| Page Pagination | 541-613 | 3 (pagePaginationUsers, provider, columns) | Grid, ArrayDataProvider, PagePagination | Medium |
| Cursor Pagination | 615-685 | 3 (cursorPaginationProducts, provider, columns) | Grid, ArrayDataProvider, LoadModePagination | Medium |
| Sorting | 687-744 | 3 (employees, sortingProvider, sortingColumns) | Grid, ArrayDataProvider | Low |
| Search & Sort | 746-895 | 5 objects + handlers | Grid, ArrayDataProvider, InMemoryStateProvider | High |
| Custom Columns | 897-1023 | 2 objects + helper | Grid, ArrayDataProvider | High |
| Row Actions | 1025-1128 | 3 objects + handlers | Grid, ArrayDataProvider | Medium |

---

## 11. RECOMMENDED REFACTORING EXECUTION ORDER

1. **Foundation First:**
   - [ ] Create layout structure
   - [ ] Extract shared components
   - [ ] Setup styles

2. **Low-Complexity Pages (Easy Wins):**
   - [ ] Introduction
   - [ ] Basic
   - [ ] Sorting
   - [ ] State providers (4 pages)

3. **Medium-Complexity Pages:**
   - [ ] Array Provider
   - [ ] Page Pagination
   - [ ] Cursor Pagination
   - [ ] Row Actions

4. **High-Complexity Pages (Final):**
   - [ ] HTTP Provider (mock API handling)
   - [ ] Multi-State (dual grids)
   - [ ] Search & Sort (filter logic)
   - [ ] Custom Columns (component rendering)

This order allows testing of basic structure before handling complex state management and API interactions.

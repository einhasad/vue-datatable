# Grid - Framework-Agnostic Vue 3 Grid Library

A flexible, configurable grid component library for Vue 3 applications with support for both cursor and page-based pagination, custom data providers, and extensive customization options.

## Features

- ✅ **Dual Pagination Modes**: Cursor-based (Load More) and page-based (1, 2, 3...)
- ✅ **Data Provider Pattern**: Pluggable data sources (HTTP, Array, custom)
- ✅ **Framework Agnostic**: No dependencies on UI frameworks (Ant Design, Bootstrap, etc.)
- ✅ **TypeScript First**: Full TypeScript support with comprehensive type definitions
- ✅ **Customizable**: Extensive props, slots, and CSS custom properties
- ✅ **Sorting**: Built-in column sorting support
- ✅ **Footer Row**: Calculations and aggregations
- ✅ **Row & Cell Options**: Custom classes, styles, and attributes
- ✅ **Dynamic Components**: Render custom components in cells
- ✅ **Response Adapters**: Support for different API response formats
- ✅ **Extensible**: Easy to create custom data providers (e.g., DSLElasticDataProvider)

## Installation

Install via npm:

```bash
npm install @do-popov/grid-vue
```

Or with yarn:

```bash
yarn add @do-popov/grid-vue
```

Or with pnpm:

```bash
pnpm add @do-popov/grid-vue
```

Then import the CSS in your main entry file (e.g., `main.ts` or `main.js`):

```ts
import '@do-popov/grid-vue/style.css'
```

## Quick Start

### Example 1: HTTP Data Provider with Page Pagination

```vue
<template>
  <Grid
    :data-provider="provider"
    :columns="columns"
  />
</template>

<script setup lang="ts">
import { Grid, HttpDataProvider, type Column } from '@do-popov/grid-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const provider = new HttpDataProvider({
  url: '/api/users',
  pagination: true,
  paginationMode: 'page',
  pageSize: 20,
  searchPrefix: 'search'
}, router)

const columns: Column[] = [
  {
    key: 'id',
    label: 'ID',
    sort: 'id'
  },
  {
    key: 'name',
    label: 'Name',
    value: (user) => user.name
  },
  {
    key: 'email',
    label: 'Email',
    value: (user) => user.email
  }
]
</script>
```

### Example 2: Array Data Provider with Cursor Pagination

```vue
<template>
  <Grid
    :data-provider="provider"
    :columns="columns"
  />
</template>

<script setup lang="ts">
import { Grid, ArrayDataProvider, type Column } from '@do-popov/grid-vue'

const users = [
  { id: 1, name: 'John', email: 'john@example.com' },
  { id: 2, name: 'Jane', email: 'jane@example.com' },
  // ... more items
]

const provider = new ArrayDataProvider({
  items: users,
  pagination: true,
  paginationMode: 'cursor',
  pageSize: 10
})

const columns: Column[] = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' }
]
</script>
```

## Data Providers

### HttpDataProvider

Fetches data from HTTP APIs with configurable pagination modes.

```ts
interface HttpDataProviderConfig {
  url: string                          // API endpoint
  pagination: boolean                  // Enable pagination
  paginationMode: 'cursor' | 'page'    // Pagination mode
  pageSize?: number                    // Items per page (default: 20)
  searchPrefix?: string                // Query param prefix (default: 'search')
  httpClient?: HttpClient              // Custom HTTP client function
  responseAdapter?: ResponseAdapter    // Response format adapter
  headers?: Record<string, string>     // Custom headers
}

// Example with custom HTTP client (axios)
const provider = new HttpDataProvider({
  url: '/api/users',
  pagination: true,
  paginationMode: 'page',
  httpClient: async (url) => {
    const response = await axios.get(url)
    return response.data
  }
}, router)
```

### ArrayDataProvider

Works with client-side arrays, supports filtering and sorting.

```ts
interface ArrayDataProviderConfig {
  items: T[]                           // Array of items
  pagination: boolean                  // Enable pagination
  paginationMode: 'cursor' | 'page'    // Pagination mode
  pageSize?: number                    // Items per page (default: 20)
}

const provider = new ArrayDataProvider({
  items: myData,
  pagination: true,
  paginationMode: 'page',
  pageSize: 15
})
```

### Custom Data Provider

Create your own data provider by implementing the `DataProvider` interface:

```ts
class DSLElasticDataProvider implements DataProvider {
  // Implement all required methods
  async load(options?: LoadOptions): Promise<LoadResult> {
    // Your Elasticsearch DSL query logic
  }
  // ... other methods
}
```

## Response Adapters

Adapt different API response formats to work with the grid.

### Built-in Adapters

**DefaultResponseAdapter** (current AlmaWord format):
```json
{
  "items": [...],
  "nextCursor": "abc123",
  "hasMore": true
}
```

**LegacyResponseAdapter** (old-grid format):
```json
{
  "code": 200,
  "status": "success",
  "result": [...],
  "_meta": {
    "pagination": {
      "currentPage": 1,
      "pageCount": 10,
      "perPage": 20,
      "totalCount": 200
    }
  }
}
```

### Custom Response Adapter

```ts
class MyCustomAdapter implements ResponseAdapter {
  extractItems(response: any): any[] {
    return response.data.items
  }

  extractPagination(response: any): PaginationData | undefined {
    if (response.data.nextToken) {
      return {
        nextCursor: response.data.nextToken,
        hasMore: response.data.hasNextPage
      }
    }
    return undefined
  }

  isSuccess(response: any): boolean {
    return response.success === true
  }

  getErrorMessage(response: any): string | undefined {
    return response.error?.message
  }
}

const provider = new HttpDataProvider({
  url: '/api/data',
  pagination: true,
  paginationMode: 'cursor',
  responseAdapter: new MyCustomAdapter()
}, router)
```

## Column Definition

```ts
interface Column {
  key: string                              // Unique key (required)
  label?: string | Function                // Header label (static or dynamic)
  labelComponent?: ComponentOptions        // Dynamic header component
  value?: (model: any, index: number) => string  // Cell value extractor
  show?: (model: any) => boolean           // Conditional cell visibility
  showColumn?: boolean | (() => boolean)   // Conditional column visibility
  component?: (model: any, index: number) => ComponentOptions  // Dynamic cell component
  footer?: (models: any[]) => string       // Footer content
  footerOptions?: (models: any[]) => object // Footer cell attributes
  action?: (model: any) => void            // Cell click handler
  sort?: string                            // Sort field name
  options?: (model: any) => object         // Cell attributes (classes, styles)
  filter?: Filter                          // Filter configuration (project-specific)
}
```

### Column Examples

**Simple column:**
```ts
{ key: 'name', label: 'User Name' }
```

**Value extractor:**
```ts
{
  key: 'fullName',
  label: 'Name',
  value: (user) => `${user.firstName} ${user.lastName}`
}
```

**Dynamic component:**
```ts
{
  key: 'actions',
  label: 'Actions',
  component: (user) => ({
    is: 'button',
    props: {
      onClick: () => editUser(user)
    },
    content: 'Edit'
  })
}
```

**RouterLink component:**
```ts
import { RouterLink } from 'vue-router'

{
  key: 'name',
  label: 'Name',
  component: (user) => ({
    is: RouterLink,
    props: {
      to: { name: 'user-detail', params: { id: user.id } }
    },
    content: user.name
  })
}
```

**Sortable column:**
```ts
{ key: 'createdAt', label: 'Created', sort: 'created_at' }
```

**Conditional visibility:**
```ts
{
  key: 'secretData',
  label: 'Secret',
  show: (user) => user.role === 'admin'
}
```

**Cell styling:**
```ts
{
  key: 'status',
  label: 'Status',
  options: (model) => ({
    class: model.isActive ? 'text-success' : 'text-danger',
    style: { fontWeight: 'bold' }
  })
}
```

**Footer calculations:**
```ts
{
  key: 'amount',
  label: 'Amount',
  footer: (models) => {
    const total = models.reduce((sum, m) => sum + m.amount, 0)
    return `Total: $${total.toFixed(2)}`
  }
}
```

## Row Options

Customize row appearance and attributes:

```vue
<Grid
  :data-provider="provider"
  :columns="columns"
  :row-options="getRowOptions"
/>

<script setup>
function getRowOptions(model) {
  return {
    class: {
      'inactive-row': !model.isActive,
      'premium-user': model.isPremium
    },
    style: {
      backgroundColor: model.highlighted ? '#fffacd' : undefined
    },
    'data-user-id': model.id
  }
}
</script>
```

## Slots

### Search Slot

```vue
<Grid :data-provider="provider" :columns="columns">
  <template #search="{ provider, refresh }">
    <input
      type="text"
      @input="(e) => {
        provider.setQueryParam('q', e.target.value)
        refresh()
      }"
    />
  </template>
</Grid>
```

### Toolbar Slot

```vue
<Grid :data-provider="provider" :columns="columns">
  <template #toolbar="{ refresh, loading }">
    <button @click="refresh" :disabled="loading">
      Refresh
    </button>
  </template>
</Grid>
```

### Custom Row Rendering

```vue
<Grid :data-provider="provider" :columns="columns">
  <template #row="{ items }">
    <tr v-for="item in items" :key="item.id">
      <td>{{ item.name }}</td>
      <td>
        <button @click="edit(item)">Edit</button>
      </td>
    </tr>
  </template>
</Grid>
```

### Custom Pagination

```vue
<Grid :data-provider="provider" :columns="columns">
  <template #pagination="{ pagination, setPage, mode }">
    <div v-if="mode === 'page'">
      <button
        v-for="page in pagination.pageCount"
        :key="page"
        @click="setPage(page)"
      >
        {{ page }}
      </button>
    </div>
  </template>
</Grid>
```

### Empty State

```vue
<Grid :data-provider="provider" :columns="columns">
  <template #empty>
    <div class="custom-empty">
      <img src="/empty-state.svg" />
      <p>No data found. Try adjusting your filters.</p>
    </div>
  </template>
</Grid>
```

## Styling & Theming

Override CSS custom properties:

```css
:root {
  --grid-border-color: #e0e0e0;
  --grid-header-bg: #f8f9fa;
  --grid-header-color: #212529;
  --grid-row-hover-bg: #f5f5f5;
  --grid-button-active-bg: #007bff;
  --grid-button-active-color: #fff;
}
```

Or add custom classes:

```css
.grid-table {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.grid-header-cell {
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
```

## Advanced Usage

### Programmatic Control

```vue
<template>
  <div>
    <button @click="gridRef.refresh()">Refresh</button>
    <button @click="gridRef.loadMore()">Load More</button>

    <Grid
      ref="gridRef"
      :data-provider="provider"
      :columns="columns"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const gridRef = ref()

// Access grid methods
// gridRef.value.loadData()
// gridRef.value.refresh()
// gridRef.value.loadMore()
// gridRef.value.setPage(3)
</script>
```

### URL State Management

The `HttpDataProvider` automatically syncs query parameters with the URL when a router is provided:

```
/users?search-q=john&search-sort=-created_at
```

Query parameters are prefixed with `searchPrefix` (default: 'search') to avoid conflicts with other components on the same page.

### Server-Side Sorting

When a sortable column header is clicked, the sort parameter is automatically added to the API request:

```
GET /api/users?sort=-created_at
```

Format: `field` for ascending, `-field` for descending

### Client-Side Filtering (ArrayDataProvider)

```ts
provider.setQueryParam('status', 'active')
await provider.load()
```

The ArrayDataProvider will filter items where `item.status` includes 'active'.

## Integration with Filters

While filters are project-specific and not included in the lib, here's how to integrate them:

```vue
<template>
  <Grid :data-provider="provider" :columns="columns">
    <template #search="{ provider, refresh }">
      <!-- Your project-specific filter components -->
      <MyDateRangeFilter
        @change="(value) => {
          provider.setQueryParam('dateFrom', value.from)
          provider.setQueryParam('dateTo', value.to)
          refresh()
        }"
      />

      <MySelectFilter
        :options="statusOptions"
        @change="(value) => {
          provider.setQueryParam('status', value)
          refresh()
        }"
      />
    </template>
  </Grid>
</template>
```

**Filter Pattern:**
1. Filter component emits value change
2. Call `provider.setQueryParam(key, value)`
3. Call `refresh()` to reload data
4. DataProvider automatically includes query params in API request

## TypeScript Support

The library is fully typed. Import types as needed:

```ts
import type {
  DataProvider,
  Column,
  LoadResult,
  PaginationData,
  CursorPaginationData,
  PagePaginationData,
  SortState,
  RowOptions,
  ComponentOptions,
  ResponseAdapter
} from '@do-popov/grid-vue'
```

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Vue 3.x required
- ES2020+ features used

## License

Same as parent project

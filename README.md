# @einhasad-vue/datatable-vue

[![npm version](https://img.shields.io/npm/v/@einhasad-vue/datatable-vue.svg?style=flat-square)](https://www.npmjs.com/package/@einhasad-vue/datatable-vue)
[![CI](https://img.shields.io/github/actions/workflow/status/einhasad/vue-datatable/ci.yml?branch=main&style=flat-square&label=CI)](https://github.com/einhasad/vue-datatable/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)
[![Vue peer range](https://img.shields.io/npm/dependency-version/@einhasad-vue/datatable-vue/peer/vue?style=flat-square&label=vue)](package.json)
[![Bundle size](https://img.shields.io/bundlephobia/minzip/@einhasad-vue/datatable-vue?style=flat-square&label=min%2Bgzip)](https://bundlephobia.com/package/@einhasad-vue/datatable-vue)
[![TypeScript](https://img.shields.io/badge/typescript-strict-3178c6.svg?style=flat-square)](https://www.typescriptlang.org/)

A flexible, framework-agnostic data table for Vue 3. Pluggable **data providers** (array, callback for any HTTP client, Elasticsearch, custom), pluggable **state persistence** (URL query, URL hash, localStorage, in-memory), **two pagination modes** (cursor / load-more and numbered pages), and a **slot-driven** rendering layer you can replace piece by piece.

**[Documentation and live demos](https://einhasad.github.io/vue-datatable/)** · [Changelog](CHANGELOG.md)

No runtime dependencies: Vue is the only peer dependency (supported range: `peerDependencies` in [package.json](package.json)). The size badge above is measured from the published package.

```bash
npm install @einhasad-vue/datatable-vue
```

```ts
// main.ts
import '@einhasad-vue/datatable-vue/grid-default-styles.css'
```

---

## Contents

- [Why this lib](#why-this-lib)
- [Quick start](#quick-start)
- [Data providers](#data-providers)
- [Cursor (keyset) pagination](#cursor-keyset-pagination)
- [State providers](#state-providers)
- [Grid API](#grid-api)
- [Columns](#columns)
- [Rendering HTML (security)](#rendering-html-security)
- [Expandable rows](#expandable-rows)
- [Accessibility](#accessibility)
- [API surface](#api-surface)
- [Styles](#styles)
- [TypeScript](#typescript)
- [Contributing](#contributing)

## Why this lib

A grid is three separate concerns: **how data is fetched**, **how state is persisted**, and **how rows are rendered**. This library lets you compose them independently:

- **DataProvider**: Array, Callback (any HTTP client), Elasticsearch, or your own class. The grid never sees fetch logic.
- **StateProvider**: InMemory, QueryParams (URL), LocalStorage, or Hash. The grid never sees storage.
- **Slots and components**: replace `#toolbar`, `#search`, `#table`, `#searchRow`, `#headerCell`, `#row`, `#expandedRow`, `#empty`, `#loader` or `#pagination`. The grid is a default renderer, not the only one.

If the defaults work for you, you ship in a few lines. If you need another UI kit or custom Elasticsearch queries, the same primitives compose into your own wrapper (see the [Customizing example](https://einhasad.github.io/vue-datatable/#customizing)).

## Quick start

The smallest working example: an in-memory array and column definitions. `ArrayDataProvider` keeps its filters and sort in an `InMemoryStateProvider` by default, so the `email` column gets a filter input above the rows.

```vue
<template>
  <Grid :data-provider="provider" :columns="columns" />
</template>

<script setup lang="ts">
import { Grid, ArrayDataProvider, type Column } from '@einhasad-vue/datatable-vue'

interface User { id: number; name: string; email: string }

const provider = new ArrayDataProvider<User>({
  items: [
    { id: 1, name: 'Alice', email: 'alice@example.com' },
    { id: 2, name: 'Bob',   email: 'bob@example.com' }
  ]
})

const columns: Column<User>[] = [
  { key: 'id',    label: 'ID',    sort: 'id' },
  { key: 'name',  label: 'Name',  sort: 'name' },
  { key: 'email', label: 'Email', filter: { name: 'email', type: 'text' } }
]
</script>
```

Text filters apply when the input is committed (Enter or leaving the field).

Add numbered pages by enabling offset pagination on the provider and passing `<PagePagination>` into the `#pagination` slot:

```vue
<template>
  <Grid :data-provider="provider" :columns="columns">
    <template #pagination="{ pagination, setPage }">
      <PagePagination
        :current-page="pagination.currentPage"
        :total-pages="pagination.totalPages"
        :total-items="pagination.totalItems"
        :items-per-page="pagination.pageSize"
        :show-summary="true"
        @page-change="setPage"
      />
    </template>
  </Grid>
</template>

<script setup lang="ts">
import { Grid, ArrayDataProvider, PagePagination, type Column } from '@einhasad-vue/datatable-vue'

interface Row { id: number; name: string }

const rows: Row[] = Array.from({ length: 95 }, (_, i) => ({ id: i + 1, name: `Row ${i + 1}` }))

const provider = new ArrayDataProvider<Row>({ items: rows })
provider.setOffsetPagination({ page: 1, pageSize: 20 })

const columns: Column<Row>[] = [
  { key: 'id', label: 'ID', sort: 'id' },
  { key: 'name', label: 'Name', filter: { name: 'name', type: 'text' } }
]
</script>
```

The `#pagination` slot renders only when the provider has offset pagination (`getOffsetPagination()` returns a state).

## Data providers

| Provider | Use when |
|----------|----------|
| `ArrayDataProvider` | You already have the data (in-memory array). Sorts, filters and paginates client-side. |
| `CallbackDataProvider` | You fetch from an API. Pass a `loadFn` that uses `fetch`, axios or anything else; the grid stays HTTP-client agnostic. |
| `ElasticSearchDataProvider` | You query Elasticsearch directly. Ships `DefaultElasticResponseAdapter`. |
| Custom | Implement the `DataProvider<T>` interface. |

Every built-in provider defaults to a new `InMemoryStateProvider` when you don't pass `stateProvider`. Refreshing data is always `await provider.refresh()`; the Grid component does not expose a `refresh()` method.

### ArrayDataProvider

- **Filtering**: every key in the state provider is a filter on the item field of the same name (the column's `filter.name`). Matching is a **case-insensitive substring** test on `String(value)`: the filter `active` also matches `Inactive`. Items whose field is `null`/`undefined` don't match an active filter. For exact matches, use a `CallbackDataProvider` or a custom provider.
- **Reserved key**: `page` is reserved. The Grid stores the current page there, and it is never treated as a filter.
- **Sorting**: strings with `localeCompare`, numbers numerically, everything else as strings. A sort stored in the state provider (from the URL or localStorage) applies on first render.
- **Pagination**: totals count only the rows that match the filters. An out-of-range page is clamped to the last page.
- `setAllItems(items)` replaces the whole dataset. `getAllItems()` returns it.
- `setRows(rows)` replaces only the **currently displayed** rows inside the dataset (displayed rows left out of `rows` are removed) and keeps the rows on other pages. Use it to attach children after an `@expand` event.

### CallbackDataProvider

```ts
import { CallbackDataProvider } from '@einhasad-vue/datatable-vue'

interface User { id: number; name: string }

const provider = new CallbackDataProvider<User>({
  loadFn: async ({ sortField, sortOrder, searchParams }, _keyset, offset) => {
    const query = new URLSearchParams({ ...searchParams, page: String(offset?.page ?? 1) })
    if (sortField && sortOrder) query.set('sort', sortOrder === 'desc' ? `-${sortField}` : sortField)
    const res = await fetch(`/api/users?${query.toString()}`)
    const body = (await res.json()) as { data: User[]; total: number }
    return { items: body.data, pagination: { totalItems: body.total } }
  },
  offsetPaginationFn: () => {}
})
provider.setOffsetPagination({ page: 1, pageSize: 20 })
```

Then use `<Grid :data-provider="provider" :columns="columns" />`.

Contract:

```ts
type CallbackLoadFn<T> = (
  options: LoadOptions,                              // { sortField?: string; sortOrder: 'asc' | 'desc' | null; searchParams?: Record<string, string> }
  keysetPagination: KeysetPaginationState | null,
  offsetPagination: OffsetPaginationState | null
) => Promise<LoadResult<T>>                          // { items: T[]; pagination?: Partial<PaginationInfo> }
```

- `load()` / `refresh()` pass the current sort and the non-empty filters of the state provider as `searchParams` (the reserved `page` key is left out; `searchParams` is omitted when there are no filters). An explicit `load(options)` is passed through unchanged.
- The returned `pagination` (`currentPage`, `pageSize`, `totalItems`, `totalPages`) updates the offset pagination state, so the pager renders. This requires `offsetPaginationFn` in the config.
- Pagination is opt-in. Without `offsetPaginationFn`, `setOffsetPagination()` / `getOffsetPagination()` throw. Without `keysetPaginationFn`, `setKeysetPagination()` / `getKeysetPagination()` throw. The cursor state is changed only through `setKeysetPagination()`.
- Optional `sortFn(sort)` is called on sort changes. Optional `stateProvider` holds filters and sort (default: `new InMemoryStateProvider()`).
- Only the latest `load()` updates items, pagination and the loading flag. Responses to superseded requests still resolve to their own caller.

### ElasticSearchDataProvider

```ts
import { ElasticSearchDataProvider } from '@einhasad-vue/datatable-vue'

interface Product { sku: string; title: string }

const provider = new ElasticSearchDataProvider<Product>({
  url: '/es/products/_search',
  pageSize: 20
})
provider.setElasticQuery(ElasticSearchDataProvider.buildMatchQuery('title', 'lamp'))
```

The provider POSTs the generated query body (`query`, `from`/`size`, `sort`, `post_filter`, `aggs`, `_source`, `track_total_hits`) to `url` with `fetch`. Pass `httpClient: (url, body) => Promise<unknown>` to use your own client and `responseAdapter` (an `ElasticResponseAdapter`) when your backend wraps the Elasticsearch response. It does not turn state-provider filters into a query: build the query yourself with `setElasticQuery()` / `setPostFilter()` and the static helpers (`buildMatchQuery`, `buildMultiMatchQuery`, `buildTermQuery`, `buildTermsAggregation`, `buildDateHistogramAggregation`). Other methods: `setFrom()`, `getTotalHits()`, `setAggregations()`, `getAggregations()`, `getRequestBody()`. Passing `router` without `stateProvider` creates a `QueryParamsStateProvider` with prefix `search`.

### Custom providers

Implement every method of `DataProvider<T>`: `load`, `refresh`, `isLoading`, `getCurrentItems`, `setSort`, `getSort`, `getStateProvider`, `setKeysetPagination`, `getKeysetPagination`, `setOffsetPagination`, `getOffsetPagination`, `setRows`. Return reactive values (refs) from `isLoading`, `getCurrentItems`, `getSort` and `getOffsetPagination` so the Grid re-renders. A pagination method your source doesn't support may throw; the Grid treats a throwing `getOffsetPagination()` as "no pager".

## Cursor (keyset) pagination

Keyset pagination uses the last loaded item as a cursor. With `CallbackDataProvider`, enable it with `keysetPaginationFn`, read the cursor in `loadFn` and store the next one with `setKeysetPagination()`:

```vue
<template>
  <Grid :data-provider="provider" :columns="columns" />
  <button type="button" :disabled="!hasNextPage" @click="loadMore">Load more</button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Grid, CallbackDataProvider, type Column } from '@einhasad-vue/datatable-vue'

interface Product { id: number; name: string }

const pageSize = 20
const hasNextPage = ref(false)
let loaded: Product[] = []

async function fetchAfter(lastId: number | null, limit: number): Promise<Product[]> {
  const res = await fetch(`/api/products?after=${lastId ?? ''}&limit=${limit}`)
  return (await res.json()) as Product[]
}

const provider = new CallbackDataProvider<Product>({
  loadFn: async (_options, keyset) => {
    const lastId = (keyset?.cursor?.[0] as number | undefined) ?? null
    const fetched = await fetchAfter(lastId, pageSize + 1)
    const page = fetched.slice(0, pageSize)
    loaded = lastId === null ? page : [...loaded, ...page]
    provider.setKeysetPagination({
      cursor: page.length > 0 ? [page[page.length - 1].id] : keyset?.cursor ?? null,
      pageSize,
      hasNextPage: fetched.length > pageSize
    })
    return { items: loaded }
  },
  keysetPaginationFn: (state) => { hasNextPage.value = state.hasNextPage }
})
provider.setKeysetPagination({ cursor: null, pageSize, hasNextPage: false })

async function loadMore(): Promise<void> {
  if (!provider.isLoading()) await provider.load()
}

const columns: Column<Product>[] = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' }
]
</script>
```

For infinite scroll, render `<ScrollPagination :pagination="{ hasMore: () => hasNextPage }" :loading="provider.isLoading()" @load-more="loadMore" />` below the grid. It watches a sentinel element with `IntersectionObserver` (import `@einhasad-vue/datatable-vue/style.css` for the sentinel's size). Props: `pagination: { hasMore(): boolean; hasEarlier?(): boolean } | null`, `loading?: boolean`, `position?: 'top' | 'bottom'`. Emits `loadMore` (bottom) and `loadEarlier` (top). Slots: `#loading-text`, `#end-text`.

## State providers

State (filters, sort, page) is owned by a `StateProvider`, **separate** from the data layer.

| Provider | Persistence |
|----------|-------------|
| `InMemoryStateProvider` *(default in every built-in data provider)* | Memory only; lost on reload. |
| `QueryParamsStateProvider` | URL query string. Shareable links. |
| `LocalStorageStateProvider` | `localStorage`. Survives sessions, not visible in the URL. |
| `HashStateProvider` | URL hash (`#...`). Doesn't touch query params. |

`QueryParamsStateProvider` and `HashStateProvider` take any router with `currentRoute` and `replace()` (`RouterLike`); a vue-router `Router` from `useRouter()` fits without a cast. Create them inside `setup()`:

```vue
<template>
  <Grid :data-provider="provider" :columns="columns" />
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Grid, ArrayDataProvider, QueryParamsStateProvider, type Column } from '@einhasad-vue/datatable-vue'

interface User { id: number; name: string; email: string }

const users: User[] = [
  { id: 1, name: 'John', email: 'john@example.com' },
  { id: 2, name: 'Jane', email: 'jane@example.com' }
]

const provider = new ArrayDataProvider<User>({
  items: users,
  stateProvider: new QueryParamsStateProvider({ router: useRouter(), prefix: 'users' })
})

const columns: Column<User>[] = [
  { key: 'name', label: 'Name', sort: 'name', filter: { name: 'name', type: 'text' } },
  { key: 'email', label: 'Email', sort: 'email' }
]
</script>
```

### Stored formats

These formats are stable; links and saved state from 0.4.x keep loading.

| Provider | Format (default prefix `search`, default storage key `grid-state`) |
|----------|--------|
| `QueryParamsStateProvider` | `?users-name=John&users-sort=-email&users-page=2`: one `<prefix>-<key>` param per filter, `<prefix>-sort` is the field, prefixed with `-` for descending. |
| `HashStateProvider` | `#users-name=John&users-sort=-email`: the same `<prefix>-<key>=<value>` pairs joined with `&`. Keys and values are `encodeURIComponent`-encoded before the router writes the hash. A malformed `%` sequence is read as literal text instead of throwing. |
| `LocalStorageStateProvider` | `{"filters":{"name":"John","page":"2"},"sort":{"field":"email","order":"desc"}}` under `storageKey`. Invalid JSON or an unexpected shape is ignored (empty state) and overwritten on the next change. |

### URL providers and the router

- The URL providers write with `router.replace()`, so filter and sort changes don't add history entries. Back/forward only has entries to go to if your app pushes them (for example `router.push()` to a new query); when the route changes that way, the providers re-read filters and sort and the grid reloads.
- They follow route changes, including a router that becomes ready after the provider was created.
- Created inside `setup()`, a provider stops watching the route when the component unmounts. Created outside a component, it watches for as long as the router lives.
- **Module-level state**: the library keeps one module-level `WeakMap` of pending locations, keyed by router, so several writes in the same tick (two grids on one router, or a hash provider and a query provider) all land. It is shared by every provider that uses the same router object and is released with the router. For SSR, create one router per request (as vue-router recommends) so requests don't share it.

### Writing a custom state provider

Implement the `StateProvider` interface (`getValue`, `setValue`, `deleteValue`, `getAllValues`, `getFilter`, `setFilter`, `clearFilter`, `getAllFilters`, `getSort`, `setSort`, `clearSort`, `clear`, and a reactive `state: { filters, sort }`). Keep `state` reactive (for example with `reactive()`): the Grid watches it and reloads on filter or sort changes.

`LocalStorageStateProvider` is SSR-safe: without `localStorage`, or when access throws (private mode, quota), it keeps state in memory.

## Grid API

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `dataProvider` | `DataProvider<T>` | required | Source of items, sort and pagination. |
| `columns` | `Column<T>[]` | required | Column definitions, see [Columns](#columns). |
| `rowOptions` | `(model: T) => RowOptions` | | Attributes for each `<tr>` (`class`, `style`, `data-*`, ...). |
| `onRowClick` | `(model: T) => void` | | Row click handler. Rows become focusable (`tabindex="0"`) and activate on Enter/Space. |
| `showLoader` | `boolean` | `true` | Show the loading row while the provider loads. |
| `showFooter` | `boolean` | `true` | Show the column footer row (`<tfoot>`) built from `column.footer`. It renders only when at least one visible column has a `footer`, and not while the loader shows. |
| `emptyText` | `string` | `'No results found'` | Text of the empty state (override the whole thing with `#empty`). |
| `autoLoad` | `boolean` | `true` | Call `dataProvider.refresh()` on mount. |
| `rowKeyField` | `string` | `'id'` | Item field used as the row `:key`, and as the row-state key when `rowKey` is not set. |
| `rowKey` | `(item: T) => RowKey \| undefined` | | Row identity for expansion and other row state. Falls back to `item[rowKeyField]`. |
| `childrenField` | `string \| ((item: T) => T[] \| undefined)` | `'children'` | Where nested child rows are read from. |
| `rowStateProvider` | `RowStateProvider` | new `InMemoryRowStateProvider` per Grid | Store for per-row flags such as `expanded`. |

### Events

| Event | Payload | When |
|-------|---------|------|
| `loaded` | none | After each load the Grid starts (mount, sort, page change, filter or state change). A `provider.refresh()` you call yourself does not emit it; await its promise instead. |
| `error` | `Error` | A load the Grid started rejected. |
| `expand` | `(item: T, ctx: { depth: number; rowKey: RowKey })` | A row was expanded. |
| `collapse` | `(item: T, ctx: { depth: number; rowKey: RowKey })` | A row was collapsed. |

### Slots

| Slot | Scope | What it does |
|------|-------|--------------|
| `#toolbar` | `{ loading: boolean }` | Rendered first, above `#search` and the table. Grid provides its data and state provider, so `<ResetButton>` and `useGridState()` work inside it. |
| `#search` | `{ provider: DataProvider<T>, loading: boolean }` | Global search area above the table. |
| `#table` | `{ items, loading, columns, rowOptions, onRowClick, onSort, sortState }` | Replace the entire table renderer. |
| `#searchRow` | `{ columns, stateProvider }` | Replace the per-column filter row. |
| `#headerCell` | `{ column, colIndex, sortState, onSort }` | Replace the content of each header cell. |
| `#row` | `{ items }` | Replace the row-rendering loop. |
| `#expandedRow` | `{ item, depth, rowKey, toggle }` | Panel rendered below an expanded row. |
| `#empty` | none | Empty state. |
| `#loader` | none | Loading state. |
| `#pagination` | `{ pagination: PaginationInfo, setPage: (page: number) => Promise<void> }` | Pager. Rendered only when the provider has offset pagination. |

Changing sort or filters (from the grid, the state provider or the URL) goes back to page 1 and reloads once.

## Columns

```ts
interface Column<T = any> {
  key?: string                                                    // item field shown by default; also the filter/sort fallback key
  label?: string | ((models: T[]) => string)                      // a function receives the current items
  labelComponent?: ComponentOptions                               // header rendered as a component
  value?: (model: T, index: number) => string | number | boolean | null | undefined
  show?: (model: T) => boolean                                    // per-cell visibility
  showColumn?: boolean | (() => boolean)                          // column visibility
  component?: (model: T, index: number, rowContext?: RowContext) => ComponentOptions
  footer?: (models: T[]) => string                                // footer aggregation
  footerOptions?: (models: T[]) => Record<string, unknown>        // footer cell attributes
  action?: (model: T) => void                                     // cell click handler (cell becomes focusable)
  sort?: string                                                   // sort field (omit = not sortable)
  options?: (model: T) => Record<string, unknown>                 // cell attributes (class/style/data-*)
  filter?: Filter
  expandToggle?: boolean                                          // render the expand chevron + indent in this column
}

interface Filter {
  name: string
  type?: string
  [key: string]: unknown
}
```

- `index` is the visual row index (expanded child rows count).
- Cell values, `value()` results and footers render as **plain text**. `null`/`undefined` render empty, a `Date` renders as `toISOString()`.
- The default filter row (`GridSearch`) renders when the provider has a state provider and at least one column has a `filter`. It has one cell per visible column, empty where the column has no filter. Built-in filter types: `type: 'text'` (input, applied on Enter or blur) and `type: 'select'` with `options: { value: string; label: string }[]` (plus an "All" option). Other types render an empty cell; use `#searchRow` or `useFilterField()` for them. `filter.placeholder` (string) sets the input placeholder; it defaults to the column label.

### Cell components

`component` returns `ComponentOptions`: `is` is a tag name or a Vue component (for example `RouterLink`), `props` are bound with `v-bind`, `events` with `v-on`, `content` is a plain-text child, `children` are nested `ComponentOptions`.

```ts
// simplified; `props` are inferred from `is` when it is a component
interface ComponentOptions {
  is: string | Component
  content?: string
  props?: Record<string, unknown> & { key?: string | number }
  events?: Record<string, (...args: any[]) => void>
  children?: ComponentOptions[]
}
```

```ts
import type { Column } from '@einhasad-vue/datatable-vue'

interface User { id: number; name: string; active: boolean }

function editUser(id: number): void {
  console.info('edit', id)
}

export const columns: Column<User>[] = [
  {
    key: 'status',
    label: 'Status',
    component: (row) => ({
      is: 'span',
      props: { class: row.active ? 'badge-ok' : 'badge-off' },
      content: row.active ? 'Active' : 'Inactive'
    })
  },
  {
    key: 'edit',
    label: 'Actions',
    component: (row) => ({
      is: 'button',
      props: { type: 'button', 'aria-label': `Edit ${row.name}` },
      content: 'Edit',
      events: { click: () => editUser(row.id) }
    })
  }
]
```

An `events` handler fires when the rendered element emits that event (a native DOM event or a component `emit`).

## Rendering HTML (security)

Everything the grid renders from your data is **plain text**: cell values, `value()` results, footers, labels and `ComponentOptions.content`. Markup in row data shows up literally and cannot inject elements or scripts.

To render HTML on purpose, opt in per cell with `props: { innerHTML }` on a **native element**. You are responsible for sanitizing it (for example with DOMPurify); `content` and `children` are ignored when `innerHTML` is set.

```ts
import type { Column } from '@einhasad-vue/datatable-vue'

interface Post { id: number; summaryHtml: string }

declare function sanitize(html: string): string

export const columns: Column<Post>[] = [
  {
    key: 'summary',
    label: 'Summary',
    component: (post) => ({ is: 'div', props: { innerHTML: sanitize(post.summaryHtml) } })
  }
]
```

## Expandable rows

Two complementary modes; they can be combined.

**Homogeneous tree**: children share the parent's schema. Mark one column with `expandToggle: true` to render a chevron and indent. Expansion state lives in the Grid's `RowStateProvider`, keyed by `rowKey`, so it survives pagination and filters. The Grid emits `@expand` with the item; fetch its children and attach them with `provider.setRows()`, which replaces the displayed rows and keeps the other pages. For nested levels, rebuild the tree and call `setAllItems()`.

```vue
<template>
  <Grid
    :data-provider="provider"
    :columns="columns"
    :row-key="(item) => item.id"
    children-field="children"
    @expand="handleExpand"
  />
</template>

<script setup lang="ts">
import { Grid, ArrayDataProvider, type Column } from '@einhasad-vue/datatable-vue'

interface Folder { id: number; name: string; children?: Folder[] }

const provider = new ArrayDataProvider<Folder>({
  items: [{ id: 1, name: 'Documents' }, { id: 2, name: 'Photos' }]
})

const columns: Column<Folder>[] = [{ key: 'name', label: 'Name', expandToggle: true }]

async function fetchChildren(parentId: number): Promise<Folder[]> {
  const res = await fetch(`/api/folders/${parentId}/children`)
  return (await res.json()) as Folder[]
}

async function handleExpand(item: Folder): Promise<void> {
  if (item.children) return
  const children = await fetchChildren(item.id)
  provider.setRows(provider.getCurrentItems().map(row => (row.id === item.id ? { ...row, children } : row)))
}
</script>
```

**Custom expanded content (`#expandedRow` slot)**: when the expanded panel doesn't share the parent's schema (for example an order expanding into its line items), render anything. The slot receives `{ item, depth, rowKey, toggle }`.

```vue
<template>
  <Grid :data-provider="provider" :columns="columns" :row-key="(item) => item.id">
    <template #expandedRow="{ item, toggle }">
      <p>Order {{ item.id }}: {{ item.lines.join(', ') }}</p>
      <button type="button" @click="toggle">Close</button>
    </template>
  </Grid>
</template>

<script setup lang="ts">
import { Grid, ArrayDataProvider, type Column } from '@einhasad-vue/datatable-vue'

interface Order { id: number; customer: string; lines: string[] }

const provider = new ArrayDataProvider<Order>({
  items: [{ id: 1, customer: 'Acme', lines: ['Lamp', 'Desk'] }]
})

const columns: Column<Order>[] = [
  { key: 'customer', label: 'Customer', expandToggle: true }
]
</script>
```

Inside custom cell components, `useRowState()` reads and changes the same row flags (`isExpanded`, `toggleExpanded`, `get`, `set`, `toggle`, `delete`, `entries`, `clear`). The third argument of `column.component` is a `RowContext` (`depth`, `rowKey`, `isExpanded`, `isExpandable`, `toggle`, `rowState`).

## Accessibility

- Sort controls are `<button type="button" class="grid-sort-link">`; sortable header cells carry `aria-sort` (`ascending` / `descending` / `none`).
- `PagePagination` renders `<nav aria-label="Pagination">` with `<button type="button">` controls, `aria-current="page"` on the current page, and disabled "Previous page" / "Next page" buttons at the edges.
- Filter inputs and selects are named `Filter by {column label}`.
- Rows with `onRowClick` and cells with `action` are focusable and activate on Enter/Space.
- The loader, the pagination summary and the scroll-pagination status are polite live regions (`role="status"`).
- The default styles show a visible focus outline (`--grid-focus-shadow-color`).
- Controls you render through `component` need their own accessible name (for example `aria-label` on an icon button).

## API surface

Everything below is exported from `@einhasad-vue/datatable-vue`.

| Group | Exports |
|-------|---------|
| Components | `Grid`, `GridTable`, `GridColumnHeader`, `GridSearch`, `DynamicComponent`, `PagePagination`, `ScrollPagination`, `ResetButton` |
| Data providers | `ArrayDataProvider`, `CallbackDataProvider`, `ElasticSearchDataProvider`, `DefaultElasticResponseAdapter` |
| State providers | `InMemoryStateProvider`, `QueryParamsStateProvider`, `LocalStorageStateProvider`, `HashStateProvider` |
| Row state | `InMemoryRowStateProvider`, `rowStateInjectionKey` |
| Composables | `useFilterField`, `useRowState` |
| Injection helpers | `provideGridDataProvider`, `useGridDataProvider`, `provideGridState`, `useGridState` |
| Utilities | `getCellValue`, `getColumnLabel`, `shouldShowColumn`, `shouldShowCell`, `getCellComponent`, `getCellOptions`, `getRowOptions`, `getFooterContent`, `getFooterOptions`, `buildAttributes`, `mergeClasses`, `normalizeStyle` |
| Types | `DataProvider`, `DataProviderConfig`, `LoadOptions`, `LoadResult`, `SortState`, `SortOrder`, `RouterLike`, `RouteLocation`, `Column`, `ComponentOptions`, `Filter`, `RowOptions`, `PaginationInfo`, `KeysetPaginationState`, `OffsetPaginationState`, `RowKey`, `RowStateProvider`, `RowStateScoped`, `RowContext`, `StateProvider`, `ReactiveState`, `ArrayDataProviderConfig`, `CallbackDataProviderConfig`, `CallbackLoadFn`, `CallbackSortFn`, `CallbackKeysetPaginationFn`, `CallbackOffsetPaginationFn`, `ElasticsearchDataProviderConfig`, `ElasticResponseAdapter`, `ElasticQuery`, `ElasticResponse`, `ElasticHttpClient`, `QueryParamsStateProviderConfig`, `LocalStorageStateProviderConfig`, `HashStateProviderConfig`, `UseFilterFieldOptions`, `UseRowStateOptions`, `UseRowStateReturn`, `ScrollPaginationInfo` |

Building blocks for custom layouts:

- `GridTable` is the default table (`columns`, `items`, `stateProvider`, `loading`, `sortState`, `onSort`, ...; emits `filterChange`, `expand`, `collapse`). Use it inside the `#table` slot to keep the default rendering.
- `GridColumnHeader` renders one header (`column`, `items?`, `sortState?`, `nextSortOrder?`; emits `sort` with a `SortState`).
- `GridSearch` is the default filter row (`columns`, `stateProvider`; emits `filterChange`).
- `DynamicComponent` renders a `ComponentOptions` object (`options` prop).
- `ResetButton` is renderless. Its default slot gets `{ reset, hasActiveFilters }`; `reset()` clears the state provider and refreshes. It must be rendered inside `<Grid>` (for example in `#toolbar`) or below your own `provideGridDataProvider()` / `provideGridState()`.
- `useFilterField({ stateProvider, filterName, defaultValue?, lazy? })` returns `{ currentValue, localValue, setFilter, clearFilter, commit }` for custom filter inputs. By default (`lazy: true`) `localValue` edits reach the state provider on `commit()`; with `lazy: false` every edit is committed.
- `provideGridDataProvider` / `provideGridState` and `useGridDataProvider` / `useGridState` share a data provider and state provider with descendants. `Grid` calls the `provide*` helpers itself.
- `rowStateInjectionKey` is the injection key of the Grid's `RowStateProvider` (used by `useRowState()`).
- The utilities are the pure helpers the default renderer uses (cell value and label resolution, visibility checks, attribute and class merging), exported for custom renderers.

## Styles

| Import | Contents |
|--------|----------|
| `@einhasad-vue/datatable-vue/grid-default-styles.css` | Default look of the grid, filter row and pagination. Defines the `--grid-*` custom properties. |
| `@einhasad-vue/datatable-vue/themes/classic.css` | Classic theme: overrides the `--grid-*` properties using `light-dark()` for automatic light and dark mode. Import after the default styles. |
| `@einhasad-vue/datatable-vue/themes/material.css` | Material theme, same mechanism. Import after the default styles. |
| `@einhasad-vue/datatable-vue/style.css` | Component-scoped styles (the `ScrollPagination` sentinel). Import it when you use `ScrollPagination`. |

The `@einhasad-vue/datatable-vue/themes` JS entry is **deprecated**: it re-exports the main bundle and will be removed in 1.0. Import from the package root instead.

### Custom properties

Theme the grid by overriding custom properties. The default styles declare them on `.grid`, so override them on `.grid` (or a more specific selector) in a stylesheet loaded after the default styles. Values set on `:root` are shadowed by the `.grid` declarations.

```css
.grid {
  --grid-border-color: #e0e0e0;
  --grid-header-bg: #f8f9fa;
  --grid-row-hover-bg: #f5f5f5;
}
```

Declared by `grid-default-styles.css` (`themes/classic.css` and `themes/material.css` override every one of these with light and dark values):

| Property | Default | Styles |
|----------|---------|--------|
| `--grid-border-color` | `#ddd` | Table outline and the borders of header, filter, body and footer cells and of the filter select |
| `--grid-header-bg` | `#f5f5f5` | Background of the header row, filter row and footer row |
| `--grid-header-color` | `#333` | Header cell text |
| `--grid-row-hover-bg` | `#f9f9f9` | Row background on hover |
| `--grid-button-bg` | `#fff` | Pagination button background |
| `--grid-button-border` | `#d9d9d9` | Pagination button border |
| `--grid-button-color` | `#333` | Pagination button text |
| `--grid-button-hover-bg` | `#f5f5f5` | Pagination button background on hover |
| `--grid-button-active-bg` | `#1890ff` | Current page button background and border; filter select border on focus |
| `--grid-button-active-color` | `#fff` | Current page button text |
| `--grid-button-disabled-bg` | `#f5f5f5` | Disabled pagination button background |
| `--grid-button-disabled-color` | `#999` | Disabled pagination button text |
| `--grid-empty-color` | `#767676` | Empty-state text |
| `--grid-loader-color` | `var(--grid-empty-color)` | Default loader text ("Loading...") |
| `--grid-body-bg` | `#fff` | Empty-state row background; fallback for `--grid-expanded-bg` |
| `--grid-input-bg` | `#fff` | Filter select background |
| `--grid-pagination-summary-color` | `#666` | Pagination summary text ("Showing 1-10 of 47 items") |
| `--grid-focus-shadow-color` | `#1677ff` | Keyboard focus outline of the sort control, filter inputs, pagination buttons and focusable rows/cells; filter select focus ring |
| `--grid-cell-color` | `#333` | Table and body cell text; fallback for `--grid-input-color` |
| `--grid-cell-bg` | `transparent` | Body cell background |
| `--grid-table-bg` | `#fff` | Table background |
| `--grid-input-color` | `#333` | Filter input and select text |
| `--grid-cell-padding` | `8px 12px` | Padding of header, filter, body and footer cells |
| `--grid-font-size` | `14px` | Table, empty state, pagination buttons and summary |
| `--grid-border-radius` | `4px` | Filter select, filter input focus outline, pagination buttons |

Optional, not declared (the default styles fall back to the value shown; themes don't set them):

| Property | Fallback | Styles |
|----------|----------|--------|
| `--grid-text-color` | `#111` | Fallback for `--grid-sort-active-color` |
| `--grid-text-muted` | `#999` | Filter input search icon; fallback for `--grid-sort-color` |
| `--grid-sort-color` | `var(--grid-text-muted, #999)` | Sort icon of an unsorted column |
| `--grid-sort-active-color` | `var(--grid-text-color, #111)` | Active sort icon, and the icon and text of a filter input that has a value |
| `--grid-focus-ring` | `0 0 0 2px var(--grid-focus-shadow-color)` | Filter select `box-shadow` on focus |
| `--grid-expanded-bg` | `var(--grid-body-bg)` | Background of the `#expandedRow` panel row |
| `--grid-expanded-padding` | `12px var(--grid-cell-padding, 8px 12px)` | Padding of the `#expandedRow` panel cell |
| `--grid-chevron-color` | `currentColor` | Expand chevron |
| `--grid-chevron-hover-bg` | `rgba(0, 0, 0, 0.06)` | Expand chevron background on hover |
| `--grid-chevron-focus-color` | `#3b82f6` | Expand chevron focus outline |
| `--grid-depth-indent` | `1.25rem` | Indent per tree level before the chevron (set inline by the chevron) |

Changed defaults, for accessibility: `--grid-focus-shadow-color` is now a solid `#1677ff` used for visible focus outlines (was the faint `rgba(24, 144, 255, 0.1)` glow), and `--grid-empty-color` is `#767676` for 4.5:1 text contrast (was `#999`). Override them on `.grid` to restore the old look.

Or write your own CSS against the `grid-*` class names; the default styles are a starting point, not a requirement. Selectors are element-agnostic (`.grid-sort-link`, `.grid-pagination-link`).

## TypeScript

Everything is typed. `Grid` is generic over the row type, inferred from `dataProvider`, and `Column<T>`, `DataProvider<T>` and the slot scopes follow it:

```ts
import { ArrayDataProvider, type Column, type DataProvider } from '@einhasad-vue/datatable-vue'

interface User { id: number; name: string; email: string }

const users: User[] = [{ id: 1, name: 'Alice', email: 'alice@example.com' }]

export const provider: DataProvider<User> = new ArrayDataProvider<User>({ items: users })
export const columns: Column<User>[] = [
  { key: 'id', sort: 'id', value: (u) => u.id }
]
```

## Browser support

Modern evergreen browsers (Chrome, Firefox, Safari, Edge), ES2020+. The theme files use CSS `light-dark()`.

## Contributing

Issues and PRs welcome. CI runs these gates on every push and PR; run them locally before opening a PR:

```bash
npm run typecheck        # vue-tsc on the library
npm run typecheck:demo   # vue-tsc on the docs site
npm run lint             # ESLint
npm run test:coverage    # unit tests with coverage thresholds
npm run build            # library build
npm run typecheck:dist   # type-check the published declarations as a consumer
npm pack --dry-run       # package contents
npm run demo:build       # docs site build
```

Development:

```bash
npm install
npm run dev          # lib dev server
npm run demo         # docs site dev server
npm test             # unit tests (watch)
```

## License

[MIT](LICENSE)

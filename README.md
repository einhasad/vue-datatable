# @einhasad-vue/datatable-vue

[![npm version](https://img.shields.io/npm/v/@einhasad-vue/datatable-vue.svg?style=flat-square)](https://www.npmjs.com/package/@einhasad-vue/datatable-vue)
[![CI](https://img.shields.io/github/actions/workflow/status/einhasad/vue-datatable/ci.yml?branch=main&style=flat-square&label=CI)](https://github.com/einhasad/vue-datatable/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)
[![Vue 3](https://img.shields.io/badge/vue-3.3+-42b883.svg?style=flat-square)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-strict-3178c6.svg?style=flat-square)](https://www.typescriptlang.org/)

A flexible, framework-agnostic data table for Vue 3. Pluggable **data providers** (Array, callback / HTTP, Elasticsearch, custom), pluggable **state persistence** (URL, localStorage, hash, in-memory), **dual pagination** modes (cursor / load-more or numbered pages), and a **slot-driven** rendering layer you can replace piece by piece.

📚 **[Documentation & live demos →](https://einhasad.github.io/vue-datatable/)**

**Size:** ~10 KB gzipped (ESM runtime + default styles). Zero transitive dependencies on top of Vue 3.

```bash
npm install @einhasad-vue/datatable-vue
```

```ts
// main.ts
import '@einhasad-vue/datatable-vue/grid-default-styles.css'
```

---

## Why this lib

A grid is three orthogonal concerns: **how data is fetched**, **how state is persisted**, and **how rows are rendered**. This library lets you compose those independently:

- **DataProvider** — Array, Callback (any HTTP client), Elasticsearch, or your own class. The grid never sees fetch logic.
- **StateProvider** — InMemory, QueryParams (URL), LocalStorage, or Hash. The grid never sees storage.
- **Slots & components** — Replace `#row`, `#empty`, `#loader`, `#pagination`, `#searchRow`, or `#table` entirely. The grid is a default renderer, not the only one.

If the defaults work for you, you ship in 10 lines. If you need Ant Design tables or Elastic queries with custom UI, the same primitives compose into [real-world wrappers](https://einhasad.github.io/vue-datatable/#customizing).

## Quick start

The smallest working example: an in-memory array and a column definition.

```vue
<template>
  <Grid :data-provider="provider" :columns="columns" />
</template>

<script setup lang="ts">
import { Grid, ArrayDataProvider, type Column } from '@einhasad-vue/datatable-vue'

const provider = new ArrayDataProvider({
  items: [
    { id: 1, name: 'Alice', email: 'alice@example.com' },
    { id: 2, name: 'Bob',   email: 'bob@example.com' }
  ]
})

const columns: Column[] = [
  { key: 'id',    label: 'ID',    sort: 'id' },
  { key: 'name',  label: 'Name',  sort: 'name' },
  { key: 'email', label: 'Email', filter: { name: 'email', type: 'text' } }
]
</script>
```

Add page-numbered pagination by passing `<PagePagination>` into the `#pagination` slot:

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
import { Grid, ArrayDataProvider, PagePagination } from '@einhasad-vue/datatable-vue'

const provider = new ArrayDataProvider({ items: bigList })
provider.setOffsetPagination({ page: 1, pageSize: 20 })
</script>
```

## Data providers

| Provider | Use when |
|----------|----------|
| `ArrayDataProvider` | You have the data already (in-memory array). Handles sort, filter, paginate client-side. |
| `CallbackDataProvider` | You fetch from an HTTP API. Pass any `fetch`/`axios` callback — the grid stays HTTP-client agnostic. |
| `ElasticSearchDataProvider` | You query Elasticsearch directly. Includes a default response adapter. |
| Custom | Implement the `DataProvider<T>` interface. ~8 methods. |

```ts
// Custom HTTP via CallbackDataProvider
const provider = new CallbackDataProvider({
  load: async ({ searchParams, sortField, sortOrder }) => {
    const url = new URL('/api/users', location.origin)
    Object.entries(searchParams ?? {}).forEach(([k, v]) => url.searchParams.set(k, v))
    if (sortField) url.searchParams.set('sort', `${sortOrder === 'desc' ? '-' : ''}${sortField}`)
    const res = await fetch(url)
    const json = await res.json()
    return { items: json.data, pagination: { totalItems: json.total } }
  }
})
```

## State providers

State (filters, sort, page) is owned by a `StateProvider`, **separate** from the data layer.

| Provider | Persistence |
|----------|-------------|
| `InMemoryStateProvider` *(default)* | RAM — lost on refresh. |
| `QueryParamsStateProvider` | URL query string. Shareable, SEO-friendly, browser back/forward works. |
| `LocalStorageStateProvider` | `localStorage`. Survives sessions. Not visible in URL. |
| `HashStateProvider` | URL hash (`#…`). Doesn't conflict with query params. |

```ts
import { ArrayDataProvider, QueryParamsStateProvider } from '@einhasad-vue/datatable-vue'
import { useRouter } from 'vue-router'

const provider = new ArrayDataProvider({
  items: users,
  stateProvider: new QueryParamsStateProvider({ router: useRouter(), prefix: 'users' })
})
// URL becomes ?users-name=John&users-sort=email
```

Refreshing data is always `await provider.refresh()` — that's the single source of truth. The grid does **not** expose a `refresh()` method on the component instance (since 0.3).

## Customization

All UI pieces are slots. Replace any of them:

| Slot | Scope | What it does |
|------|-------|--------------|
| `#search` | `{ provider, loading }` | Top toolbar / global search |
| `#table` | `{ items, columns, sortState, onSort, … }` | Replace the entire table renderer |
| `#searchRow` | `{ columns, stateProvider }` | Per-column filter row |
| `#row` | `{ items }` | Replace the row-rendering loop |
| `#expandedRow` | `{ item, depth, rowKey, toggle }` | Custom panel rendered below an expanded row |
| `#empty` | — | Empty-state UI |
| `#loader` | — | Loading-state UI |
| `#pagination` | `{ pagination, setPage }` | Pagination renderer |

Wrappers in production (Ant Design, custom Elasticsearch UI) are built on these slots without forking. See the [Customizing example](https://einhasad.github.io/vue-datatable/#customizing).

## Columns

```ts
interface Column<T = unknown> {
  key?: string
  label?: string | ((items: T[]) => string)
  sort?: string                                            // sort field key (omit = not sortable)
  filter?: { name: string, type: 'text' | 'select' | 'number' | 'date', options?: ... }
  value?: (model: T, index: number) => string              // cell text
  component?: (model: T, index: number) => ComponentOptions // dynamic cell component
  show?: (model: T) => boolean                             // per-cell visibility
  showColumn?: boolean | (() => boolean)                   // column visibility
  options?: (model: T) => RowOptions                       // cell attrs (class/style/data-*)
  footer?: (models: T[]) => string                         // footer aggregation
  action?: (model: T) => void                              // cell click handler
}
```

Cells can render **dynamic Vue components** via `component`:

```ts
{
  key: 'status',
  component: (row) => ({
    is: 'span',
    props: { class: row.active ? 'badge-ok' : 'badge-off' },
    content: row.active ? 'Active' : 'Inactive'
  })
}
```

…or pass an event handler that fires when the inner element emits:

```ts
{
  key: 'edit',
  component: (row) => ({
    is: 'button',
    content: 'Edit',
    events: { click: () => editUser(row.id) }
  })
}
```

## Expandable rows

Two complementary modes:

**Homogeneous tree** — children share the parent's schema. Mark a column with `expandToggle: true` to render a chevron + indent. The grid emits `@expand` with the clicked item; the consumer fetches children and reattaches them via `provider.setRows()` (or by mutating the source ref). Expansion state lives in an `InMemoryRowStateProvider` keyed by `:row-key`, so it persists across pagination and filters.

```vue
<Grid
  :data-provider="provider"
  :columns="columns"
  :row-key="(item) => item.id"
  children-field="children"
  @expand="handleExpand"
/>
```

**Custom expanded content (`#expandedRow` slot)** — when the expanded panel doesn't share the parent's schema (e.g. an order expanding into a line-items table), render arbitrary content instead. The slot receives `{ item, depth, rowKey, toggle }`.

```vue
<Grid
  :data-provider="provider"
  :columns="columns"
  :row-key="(item) => item.id"
  @expand="handleExpand"
>
  <template #expandedRow="{ item, toggle }">
    <OrderLines :order-id="item.id" />
    <button @click="toggle">Close</button>
  </template>
</Grid>
```

The two modes are independent and can be combined. Use the homogeneous tree when child rows look like parent rows; use the slot when they don't.

## Theming

Override CSS custom properties:

```css
:root {
  --grid-border-color: #e0e0e0;
  --grid-header-bg: #f8f9fa;
  --grid-row-hover-bg: #f5f5f5;
}
```

Or write your own classes — the default styles are a thin starting point, not a hard requirement.

## TypeScript

Everything is typed. The `Grid<T>` component takes a generic for your row type, and `Column<T>`, `DataProvider<T>`, etc. flow through:

```ts
import type { Column, DataProvider } from '@einhasad-vue/datatable-vue'

interface User { id: number; name: string; email: string }

const provider: DataProvider<User> = new ArrayDataProvider<User>({ items: users })
const columns: Column<User>[] = [
  { key: 'id', sort: 'id', value: (u) => String(u.id) }
]
```

## Browser support

Modern evergreen browsers (Chrome, Firefox, Safari, Edge). Vue 3.3+. ES2020+.

## Contributing

Issues and PRs welcome. The CI workflow runs `typecheck` + `lint` + `test:unit` + `build` on every PR — keep them green.

```bash
npm install
npm run dev          # lib dev
npm run demo         # docs site dev (port 3001)
npm test             # unit tests (watch)
npm run test:unit    # one-shot
npm run lint         # ESLint
npm run typecheck    # vue-tsc --noEmit
npm run build        # build the lib
npm run demo:build   # build the docs site
```

## License

[MIT](LICENSE)

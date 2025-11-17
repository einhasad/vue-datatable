# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`@grid-vue/grid` is a framework-agnostic Vue 3 grid component library with dual pagination modes (cursor and page-based), custom data providers, and extensive customization. The library is TypeScript-first and designed to be UI framework-independent.

## Build and Development Commands

```bash
# Install dependencies
npm install

# Run in development mode with Vite
npm run dev

# Build the library for production
npm run build

# Run tests
npm test

# Run tests with UI
npm test:ui

# Run tests with coverage
npm test:coverage

# Preview built library
npm preview
```

## Testing Commands

```bash
# Run all tests in watch mode
npm test

# Run a single test file
npx vitest run __tests__/ArrayDataProvider.spec.ts

# Run tests matching a pattern
npx vitest run -t "should handle pagination"

# Run with coverage thresholds (50% minimum)
npm test:coverage
```

## Architecture

### Core Components (src/)

**Grid.vue** - Main grid component that orchestrates data loading, sorting, and pagination
- Accepts a `DataProvider` instance and column definitions
- Manages loading state and provides slots for customization
- Supports both cursor and page-based pagination modes

**GridTable.vue** - Renders the table structure with headers, rows, and footer
- Handles column rendering with value extractors
- Supports dynamic components per cell
- Implements conditional visibility for rows and cells

**Pagination Components** - Three specialized pagination components
- **LoadModePagination.vue** - "Load More" button for cursor-based pagination
- **PagePagination.vue** - Traditional numbered pagination with page ranges
- **ScrollPagination.vue** - Infinite scroll using IntersectionObserver
- **GridPagination.vue** - **(Deprecated)** Legacy component supporting both modes

**DynamicComponent.vue** - Renders dynamic components from ComponentOptions
- Supports Vue components, HTML elements, and nested children
- Used for custom cell and header rendering

### Pagination System

The library uses a **Pagination interface** pattern for flexible pagination:

**Pagination Interface** (`src/types.ts`)
- Unified interface for all pagination types
- Provides methods: `hasMore()`, `loadMore()`, `refresh()`, `isLoading()`
- Page-based methods: `getCurrentPage()`, `getTotalPages()`, `setPage(page)`
- Cursor-based methods: `getNextCursor()`
- Components interact with this interface without knowing about DataProvider internals

**Pagination Implementations** (`src/pagination-impl.ts`)
- **CursorPagination** - For cursor/token-based pagination (load more pattern)
- **PageBasedPagination** - For traditional page number navigation

**PaginationRequest Class** (`src/types.ts`)
- Configuration for HTTP pagination requests
- Customizable parameter names (`nextParamName`, `limitParamName`)
- Used by HttpDataProvider to build pagination parameters

### Data Provider Pattern

The library uses a pluggable data provider pattern defined in `src/providers/DataProvider.ts`:

**HttpDataProvider** (`src/providers/HttpDataProvider.ts`)
- Fetches data from HTTP APIs
- Returns Pagination interface via `getPagination()`
- Uses PaginationRequest class for configurable pagination parameters
- Delegates state management to StateProvider
- Supports custom HTTP clients (axios, etc.)
- Uses ResponseAdapter for different API formats
- Backward compatible: passing `router` creates QueryParamsStateProvider automatically

**ArrayDataProvider** (`src/providers/ArrayDataProvider.ts`)
- Works with client-side arrays
- Returns Pagination interface via `getPagination()`
- Implements client-side filtering and sorting
- Delegates state management to StateProvider
- Useful for demos and small datasets
- No special pagination request needed (all data is local)

**DSTElasticDataProvider** (`src/providers/DSTElasticDataProvider.ts`)
- Example of custom provider (not exported)
- Shows how to extend for project-specific needs (e.g., Elasticsearch DSL)
- Uses cursor-only pagination (Elasticsearch search_after pattern)
- Returns CursorPagination instance

### State Provider Pattern

The library separates state management from data fetching using the StateProvider pattern defined in `src/state/StateProvider.ts`:

**InMemoryStateProvider** (`src/state/InMemoryStateProvider.ts`)
- Stores state in memory (lost on page refresh)
- Default when no state provider is specified
- Useful for temporary state or testing

**QueryParamsStateProvider** (`src/state/QueryParamsStateProvider.ts`)
- Stores state in URL query parameters
- Integrates with Vue Router
- Default when `router` is provided to DataProvider
- Query params prefixed (default: 'search')
- Format: `?search-name=John&search-sort=-email`

**LocalStorageStateProvider** (`src/state/LocalStorageStateProvider.ts`)
- Stores state in browser localStorage
- State persists across page refreshes and sessions
- Useful for user preferences
- Default storage key: 'grid-state'

**HashStateProvider** (`src/state/HashStateProvider.ts`)
- Stores state in URL hash
- Integrates with Vue Router
- Format: `#search-name=John&search-sort=email`
- Useful for hash-based routing or when query params are unavailable

### Type System (src/types.ts)

Key interfaces:
- `DataProvider<T>` - Core provider interface with `load()`, `refresh()`, and `getPagination()` methods
- `Pagination` - Unified interface for all pagination types (replaces PaginationData)
- `PaginationRequest` - Class for configuring HTTP pagination request parameters
- `StateProvider` - Interface for state persistence (filters, sorting, pagination)
- `Column` - Column definition with value extractors, components, sorting, filtering
- `SortState` - Sort field and order (asc/desc)
- `ResponseAdapter` - Interface for adapting different API response formats
- `ComponentOptions` - Dynamic component rendering configuration

**Deprecated types** (kept for backward compatibility):
- `PaginationData` - Use `Pagination` interface instead
- `CursorPaginationData` / `PagePaginationData` - Use `Pagination` interface instead
- `PaginationMode` - Pagination type is now determined by the Pagination implementation

### Utilities (src/utils.ts)

Helper functions for:
- Cell value extraction and rendering
- Column visibility logic
- Row and cell styling
- Pagination calculations
- Attribute merging

## Key Design Patterns

### 1. Data Provider Abstraction
All data sources implement the `DataProvider` interface, enabling:
- Swapping between HTTP, Array, or custom providers
- Consistent API for grid component
- Easy testing with mock providers
- Delegation of state management to StateProvider

### 2. State Provider Separation
State management is separated from data fetching via `StateProvider` interface:
- **Separation of Concerns**: Data fetching vs state persistence
- **Pluggable**: Choose InMemory, QueryParams, LocalStorage, or Hash
- **Testable**: Easy to mock state providers in tests
- **Flexible**: Create custom state providers for any storage mechanism
- **Default Behavior**: InMemoryStateProvider if no state provider specified
- **Backward Compatible**: Passing `router` creates QueryParamsStateProvider

### 3. Response Adapters
Different API formats are supported via `ResponseAdapter`:
- `DefaultResponseAdapter` - Modern format with `items`, `nextCursor`, `hasMore`
- `LegacyResponseAdapter` - Old format with `result` and `_meta.pagination`
- Custom adapters can be created for any API format

### 4. Dynamic Component Rendering
Cells and headers can render:
- Static strings via `value` function
- Vue components via `component` function returning `ComponentOptions`
- RouterLink and other Vue components are supported

### 5. State Persistence Strategies
Different StateProvider implementations offer various persistence strategies:
- **InMemory**: Temporary state, lost on refresh
- **QueryParams**: URL-based state, shareable and SEO-friendly
- **LocalStorage**: Browser storage, persists across sessions
- **Hash**: Hash-based state, doesn't interfere with query params

### 6. Pagination Interface Pattern
The new pagination system uses the **Pagination interface** for clean separation of concerns:
- **DataProvider returns Pagination**: Providers implement `getPagination()` returning a Pagination instance
- **Components interact with Pagination**: LoadModePagination, PagePagination, ScrollPagination components receive Pagination interface
- **No knowledge of DataProvider**: Pagination components don't need to know about data provider internals
- **Flexible implementations**: CursorPagination and PageBasedPagination handle different pagination strategies
- **PaginationRequest class**: Configurable pagination parameters for HTTP requests (HttpDataProvider)

**Usage Example:**
```vue
<template>
  <Grid :data-provider="provider" :columns="columns">
    <template #pagination="{ paginationInstance }">
      <!-- Use the appropriate pagination component -->
      <LoadModePagination v-if="paginationInstance" :pagination="paginationInstance" />
      <!-- or -->
      <PagePagination v-if="paginationInstance" :pagination="paginationInstance" />
      <!-- or -->
      <ScrollPagination v-if="paginationInstance" :pagination="paginationInstance" />
    </template>
  </Grid>
</template>
```

## Important Files

- `src/index.ts` - Main entry point, exports all public APIs
- `src/types.ts` - TypeScript definitions and type guards
- `src/styles.css` - Component styles with CSS custom properties
- `src/state/` - StateProvider implementations (InMemory, QueryParams, LocalStorage, Hash)
- `src/providers/` - DataProvider implementations (Http, Array)
- `vite.config.ts` - Build configuration (UMD + ES modules)
- `vitest.config.ts` - Test configuration with coverage thresholds
- `__tests__/` - Unit tests for providers, state providers, and utilities
- `__tests__/Grid.integration.spec.ts` - Integration tests for Grid + DataProviders + StateProviders
- `__tests__/examples.spec.ts` - Example component tests

## Build Output

The build process generates:
- `dist/grid.js` - ES module
- `dist/grid.umd.cjs` - UMD module
- `dist/style.css` - Copied from `src/styles.css`
- `dist/index.d.ts` - TypeScript declarations
- Sourcemaps for debugging

External dependencies (vue, vue-router) are not bundled.

## Testing Strategy

Tests use Vitest with happy-dom environment:
- **StateProvider tests**: Verify state persistence, URL sync, localStorage operations (92 tests)
- **DataProvider tests**: Verify pagination modes and data loading with StateProvider delegation
- **Integration tests**: Test Grid + DataProviders + StateProviders working together (24 tests)
- **Example tests**: Ensure all example components render correctly (50 tests)
- **Utility tests**: Check value extraction and formatting
- **Type guard tests**: Ensure correct type narrowing
- **Coverage**: 90.9% overall (exceeds 50% threshold)

Test count: **270 tests passing** across 11 test files

## Examples

The `examples/` directory contains:
- Live demos showing all features
- Deployed to GitHub Pages at https://einhasad.github.io/vue-datatable/
- Separate Vite config for the demo app

## Notes for Development

1. **Provider Implementation**: When creating custom providers, implement the `DataProvider` interface including `getPagination()` which returns a Pagination instance (CursorPagination or PageBasedPagination)

2. **Pagination Interface**: Use `dataProvider.getPagination()` to get the Pagination instance. The Pagination interface provides methods like `hasMore()`, `loadMore()`, `refresh()`, `setPage()`, etc.

3. **Pagination Components**: Use the new pagination components (LoadModePagination, PagePagination, ScrollPagination) instead of the deprecated GridPagination. Pass the Pagination instance from `dataProvider.getPagination()` as a prop.

4. **PaginationRequest**: For HttpDataProvider, you can customize pagination parameters using the `paginationRequest` config option:
   ```ts
   const provider = new HttpDataProvider({
     url: '/api/data',
     pagination: true,
     paginationRequest: new PaginationRequest({
       nextParamName: 'cursor',
       limitParamName: 'limit',
       limit: 50
     })
   })
   ```

5. **StateProvider Integration**: DataProviders delegate to StateProvider for state management. If no state provider is specified, InMemoryStateProvider is used by default.

6. **Backward Compatibility**: Passing `router` to HttpDataProvider/ArrayDataProvider automatically creates a QueryParamsStateProvider with prefix='search'

7. **Column Definitions**: The `value`, `component`, `show`, and `options` functions receive `(model, index)` - use index for row-specific logic

8. **Response Adapters**: Create custom ResponseAdapter implementations to handle different API response formats

9. **Styling**: Override CSS custom properties in `:root` for theming. Variables are prefixed with `--grid-`

10. **State Persistence**: Choose appropriate StateProvider based on requirements:
    - **InMemory**: Testing, temporary state
    - **QueryParams**: Shareable URLs, SEO, browser navigation
    - **LocalStorage**: User preferences, private settings
    - **Hash**: Hash routing, avoiding query param conflicts

11. **DSTElasticDataProvider**: Not exported due to project-specific dependencies. See file for reference implementation pattern

12. **Migration from GridPagination**: The old GridPagination component is deprecated. Update your code to use LoadModePagination, PagePagination, or ScrollPagination components with the Pagination interface.

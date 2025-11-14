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

**GridPagination.vue** - Handles pagination UI for both modes
- Cursor mode: "Load More" button with infinite scroll support
- Page mode: Traditional numbered pagination with page ranges

**DynamicComponent.vue** - Renders dynamic components from ComponentOptions
- Supports Vue components, HTML elements, and nested children
- Used for custom cell and header rendering

### Data Provider Pattern

The library uses a pluggable data provider pattern defined in `src/providers/DataProvider.ts`:

**HttpDataProvider** (`src/providers/HttpDataProvider.ts`)
- Fetches data from HTTP APIs
- Delegates state management to StateProvider
- Supports custom HTTP clients (axios, etc.)
- Uses ResponseAdapter for different API formats
- Backward compatible: passing `router` creates QueryParamsStateProvider automatically

**ArrayDataProvider** (`src/providers/ArrayDataProvider.ts`)
- Works with client-side arrays
- Implements client-side filtering and sorting
- Delegates state management to StateProvider
- Useful for demos and small datasets

**DSTElasticDataProvider** (`src/providers/DSTElasticDataProvider.ts`)
- Example of custom provider (not exported)
- Shows how to extend for project-specific needs (e.g., Elasticsearch DSL)

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
- `DataProvider<T>` - Core provider interface with load/refresh/pagination methods
- `StateProvider` - Interface for state persistence (filters, sorting, pagination)
- `Column` - Column definition with value extractors, components, sorting, filtering
- `PaginationData` - Union type supporting both cursor and page pagination
- `SortState` - Sort field and order (asc/desc)
- `ResponseAdapter` - Interface for adapting different API response formats
- `ComponentOptions` - Dynamic component rendering configuration

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

Test count: **304 tests passing** across 11 test files

## Examples

The `examples/` directory contains:
- Live demos showing all features
- Deployed to GitHub Pages at https://einhasad.github.io/vue-datatable/
- Separate Vite config for the demo app

## Notes for Development

1. **Provider Implementation**: When creating custom providers, implement all methods from the `DataProvider` interface, even if some return null for your use case

2. **StateProvider Integration**: DataProviders delegate to StateProvider for state management. Access via `provider.getStateProvider()`. If no state provider is specified, InMemoryStateProvider is used by default.

3. **Backward Compatibility**: Passing `router` to HttpDataProvider/ArrayDataProvider automatically creates a QueryParamsStateProvider with prefix='search'

4. **Column Definitions**: The `value`, `component`, `show`, and `options` functions receive `(model, index)` - use index for row-specific logic

5. **Pagination Modes**: Always check `paginationMode` when implementing features - cursor and page modes have different data structures

6. **Response Adapters**: Use type guards `isCursorPagination()` and `isPagePagination()` to narrow pagination types

7. **Styling**: Override CSS custom properties in `:root` for theming. Variables are prefixed with `--grid-`

8. **State Persistence**: Choose appropriate StateProvider based on requirements:
   - **InMemory**: Testing, temporary state
   - **QueryParams**: Shareable URLs, SEO, browser navigation
   - **LocalStorage**: User preferences, private settings
   - **Hash**: Hash routing, avoiding query param conflicts

9. **DSTElasticDataProvider**: Not exported due to project-specific dependencies. See file for reference implementation pattern

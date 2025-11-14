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
- Integrates with Vue Router for URL state management
- Supports custom HTTP clients (axios, etc.)
- Uses ResponseAdapter for different API formats
- Query params are prefixed with `searchPrefix` (default: 'search')

**ArrayDataProvider** (`src/providers/ArrayDataProvider.ts`)
- Works with client-side arrays
- Implements client-side filtering and sorting
- Useful for demos and small datasets

**DSTElasticDataProvider** (`src/providers/DSTElasticDataProvider.ts`)
- Example of custom provider (not exported)
- Shows how to extend for project-specific needs (e.g., Elasticsearch DSL)

### Type System (src/types.ts)

Key interfaces:
- `DataProvider<T>` - Core provider interface with load/refresh/pagination methods
- `Column` - Column definition with value extractors, components, sorting, filtering
- `PaginationData` - Union type supporting both cursor and page pagination
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

### 2. Response Adapters
Different API formats are supported via `ResponseAdapter`:
- `DefaultResponseAdapter` - Modern format with `items`, `nextCursor`, `hasMore`
- `LegacyResponseAdapter` - Old format with `result` and `_meta.pagination`
- Custom adapters can be created for any API format

### 3. Dynamic Component Rendering
Cells and headers can render:
- Static strings via `value` function
- Vue components via `component` function returning `ComponentOptions`
- RouterLink and other Vue components are supported

### 4. URL State Management
HttpDataProvider syncs state with URL query params:
- Format: `?search-q=value&search-sort=-created_at`
- Prefix prevents conflicts with other components
- Integrates with Vue Router's query params

## Important Files

- `src/index.ts` - Main entry point, exports all public APIs
- `src/types.ts` - TypeScript definitions and type guards
- `src/styles.css` - Component styles with CSS custom properties
- `vite.config.ts` - Build configuration (UMD + ES modules)
- `vitest.config.ts` - Test configuration with coverage thresholds
- `__tests__/` - Unit tests for providers and utilities

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
- Provider tests verify pagination modes and data loading
- Utility tests check value extraction and formatting
- Type guard tests ensure correct type narrowing
- Coverage thresholds: 50% minimum for all metrics

## Examples

The `examples/` directory contains:
- Live demos showing all features
- Deployed to GitHub Pages at https://einhasad.github.io/vue-datatable/
- Separate Vite config for the demo app

## Notes for Development

1. **Provider Implementation**: When creating custom providers, implement all methods from the `DataProvider` interface, even if some return null for your use case

2. **Column Definitions**: The `value`, `component`, `show`, and `options` functions receive `(model, index)` - use index for row-specific logic

3. **Pagination Modes**: Always check `paginationMode` when implementing features - cursor and page modes have different data structures

4. **Response Adapters**: Use type guards `isCursorPagination()` and `isPagePagination()` to narrow pagination types

5. **Styling**: Override CSS custom properties in `:root` for theming. Variables are prefixed with `--grid-`

6. **Vue Router Integration**: HttpDataProvider's router integration is optional - pass `router` instance to enable URL state sync

7. **DSTElasticDataProvider**: Not exported due to project-specific dependencies. See file for reference implementation pattern

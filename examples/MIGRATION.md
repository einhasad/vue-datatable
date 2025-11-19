# Migration to Nuxt 3

This document describes the migration from the monolithic Vue + Vite examples application to a modern Nuxt 3 structure.

## Overview

The examples application has been refactored to use **Nuxt 3** for better:
- **File-based routing**: Each example is now a separate page
- **Better code organization**: Shared components, layouts, and composables
- **SSG support**: Static site generation for GitHub Pages deployment
- **Developer experience**: Auto-imports, better TypeScript support, and Nuxt DevTools

## Key Changes

### 1. Structure Migration

**Before:**
```
examples/
├── src/
│   ├── App.vue (2,294 lines - monolithic)
│   ├── main.ts
│   └── style.css
├── vite.config.ts
└── package.json
```

**After:**
```
examples/
├── app.vue (root component)
├── nuxt.config.ts
├── layouts/
│   └── default.vue (shared header, sidebar, footer)
├── pages/
│   ├── index.vue (redirects to introduction)
│   └── examples/
│       ├── introduction.vue
│       ├── basic.vue
│       ├── array-provider.vue
│       └── ... (13 more example pages)
├── components/
│   ├── AppHeader.vue
│   ├── SidebarNav.vue
│   └── AppFooter.vue
├── mock-server/ (moved from root)
├── e2e/ (moved from root)
└── package.json
```

### 2. Routing Changes

**Before:** Hash-based routing (`#basic`, `#array-provider`)
**After:** File-based routing (`/examples/basic`, `/examples/array-provider`)

### 3. Mock Server Integration

The mock server has been moved into the examples directory and is integrated with Nuxt dev server via proxy configuration in `nuxt.config.ts`.

### 4. E2E Tests

E2E tests have been moved into the examples directory and updated to use the new routing structure.

### 5. Scripts Updates

**Root package.json** scripts now reference the examples directory:
- `npm run examples:dev` - Start Nuxt dev server
- `npm run examples:build` - Build library + generate static site
- `npm run test:e2e` - Run E2E tests from examples directory
- `npm run mock-api` - Start mock API server

## Development

### Running the Examples

```bash
# From root directory
npm run examples:dev

# Or from examples directory
cd examples
npm run dev
```

The application will be available at `http://localhost:3000/vue-datatable/`

### Building for Production

```bash
# From root directory
npm run examples:build

# This will:
# 1. Build the grid library
# 2. Generate static site in examples/.output/public
```

### Running E2E Tests

```bash
# From root directory
npm run test:e2e

# Or from examples directory
cd examples
npm run test:e2e
```

## Implementation Status

### Completed
- ✅ Nuxt 3 project structure
- ✅ Shared layout with header, sidebar, footer
- ✅ Shared components (AppHeader, SidebarNav, AppFooter)
- ✅ Introduction page
- ✅ Basic example page
- ✅ Array provider example page
- ✅ Mock server integration
- ✅ E2E test migration
- ✅ Root scripts updated
- ✅ GitHub Pages configuration

### Placeholder Pages (To be implemented)
- ⏳ HTTP Provider example
- ⏳ State Provider examples (InMemory, LocalStorage, QueryParams, Hash)
- ⏳ Multi-State example
- ⏳ Page Pagination example
- ⏳ Cursor Pagination example
- ⏳ Sorting example
- ⏳ Search & Sort example
- ⏳ Custom Columns example
- ⏳ Row Actions example

## Configuration Files

### nuxt.config.ts

Key configurations:
- **Base URL**: `/vue-datatable/` for GitHub Pages
- **Proxy**: `/api` proxied to `http://localhost:3001` (mock server)
- **Auto-imports**: Components and composables
- **SSG**: Static site generation enabled

### playwright.config.ts

Updated to:
- Run mock server from `examples/mock-server/`
- Start Nuxt dev server instead of Vite
- Use new routing structure in base URL

## Benefits

1. **Better Code Organization**: Each example is isolated in its own page
2. **Easier Maintenance**: Smaller, focused files instead of one large App.vue
3. **Better Performance**: Code splitting and lazy loading
4. **Modern Stack**: Latest Nuxt 3 features and patterns
5. **Type Safety**: Better TypeScript integration
6. **Developer Experience**: Auto-imports, DevTools, and HMR

## Next Steps

1. Implement remaining example pages (see placeholder list above)
2. Add more shared components as needed
3. Create composables for common patterns
4. Update GitHub Actions workflow for deployment
5. Add Nuxt DevTools for better debugging

## Resources

- [Nuxt 3 Documentation](https://nuxt.com/docs)
- [Nuxt File-based Routing](https://nuxt.com/docs/guide/directory-structure/pages)
- [Nuxt Deployment (GitHub Pages)](https://nuxt.com/docs/getting-started/deployment#static-hosting)

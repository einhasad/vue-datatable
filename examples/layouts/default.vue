<template>
  <div class="app">
    <AppHeader />

    <div class="layout">
      <SidebarNav :navigation-items="navigationItems" />

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

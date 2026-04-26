<template>
  <header class="ds-header">
    <div class="ds-header__inner">
      <a href="/" class="ds-header__brand">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
          <rect width="22" height="22" rx="5" fill="#FFC833"/>
          <rect x="5" y="7" width="12" height="1.5" rx="0.75" fill="#1A1505"/>
          <rect x="5" y="10.25" width="12" height="1.5" rx="0.75" fill="#1A1505"/>
          <rect x="5" y="13.5" width="7" height="1.5" rx="0.75" fill="#1A1505"/>
        </svg>
        <span class="ds-header__wordmark">
          <span class="ds-header__wordmark-scope">@einhasad-vue/</span>datatable-vue
        </span>
        <span class="ds-header__version">v0.2.0</span>
      </a>
      <nav class="ds-header__nav">
        <a href="/" class="is-active">Docs</a>
        <a href="https://github.com/einhasad/vue-datatable" target="_blank" rel="noopener">GitHub</a>
      </nav>
      <div class="ds-header__spacer"></div>
      <div class="ds-header__tools">
        <a class="ds-icon-btn" href="https://github.com/einhasad/vue-datatable" aria-label="GitHub" target="_blank" rel="noopener">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 00-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.1.63-1.35-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.58 9.58 0 015 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0012 2z"/></svg>
        </a>
      </div>
    </div>
  </header>

  <div class="ds-layout">
    <aside class="ds-sidebar">
      <div class="ds-sidebar__group">
        <span class="ds-caps ds-sidebar__label">Getting started</span>
        <ul>
          <li><a href="#introduction" class="ds-sidebar__link" :class="{ 'is-active': activeSection === 'introduction' }" @click.prevent="scrollTo('introduction')">Introduction</a></li>
          <li><a href="#basic" class="ds-sidebar__link" :class="{ 'is-active': activeSection === 'basic' }" @click.prevent="scrollTo('basic')">Basic Example</a></li>
        </ul>
      </div>
      <div class="ds-sidebar__group">
        <span class="ds-caps ds-sidebar__label">Data providers</span>
        <ul>
          <li><a href="#array-provider" class="ds-sidebar__link" :class="{ 'is-active': activeSection === 'array-provider' }" @click.prevent="scrollTo('array-provider')">Array Provider</a></li>
          <li><a href="#http-provider" class="ds-sidebar__link" :class="{ 'is-active': activeSection === 'http-provider' }" @click.prevent="scrollTo('http-provider')">HTTP Provider</a></li>
        </ul>
      </div>
      <div class="ds-sidebar__group">
        <span class="ds-caps ds-sidebar__label">State providers</span>
        <ul>
          <li><a href="#state-inmemory" class="ds-sidebar__link" :class="{ 'is-active': activeSection === 'state-inmemory' }" @click.prevent="scrollTo('state-inmemory')">InMemory</a></li>
          <li><a href="#state-localstorage" class="ds-sidebar__link" :class="{ 'is-active': activeSection === 'state-localstorage' }" @click.prevent="scrollTo('state-localstorage')">LocalStorage</a></li>
          <li><a href="#state-queryparams" class="ds-sidebar__link" :class="{ 'is-active': activeSection === 'state-queryparams' }" @click.prevent="scrollTo('state-queryparams')">QueryParams</a></li>
          <li><a href="#state-hash" class="ds-sidebar__link" :class="{ 'is-active': activeSection === 'state-hash' }" @click.prevent="scrollTo('state-hash')">Hash</a></li>
          <li><a href="#multi-state" class="ds-sidebar__link" :class="{ 'is-active': activeSection === 'multi-state' }" @click.prevent="scrollTo('multi-state')">Multi-State</a></li>
        </ul>
      </div>
      <div class="ds-sidebar__group">
        <span class="ds-caps ds-sidebar__label">Pagination</span>
        <ul>
          <li><a href="#page-pagination" class="ds-sidebar__link" :class="{ 'is-active': activeSection === 'page-pagination' }" @click.prevent="scrollTo('page-pagination')">Page Pagination</a></li>
          <li><a href="#cursor-pagination" class="ds-sidebar__link" :class="{ 'is-active': activeSection === 'cursor-pagination' }" @click.prevent="scrollTo('cursor-pagination')">Cursor / Load More</a></li>
          <li><a href="#scroll-pagination" class="ds-sidebar__link" :class="{ 'is-active': activeSection === 'scroll-pagination' }" @click.prevent="scrollTo('scroll-pagination')">Infinite Scroll</a></li>
        </ul>
      </div>
      <div class="ds-sidebar__group">
        <span class="ds-caps ds-sidebar__label">Columns &amp; UX</span>
        <ul>
          <li><a href="#sorting" class="ds-sidebar__link" :class="{ 'is-active': activeSection === 'sorting' }" @click.prevent="scrollTo('sorting')">Sorting</a></li>
          <li><a href="#search-sort" class="ds-sidebar__link" :class="{ 'is-active': activeSection === 'search-sort' }" @click.prevent="scrollTo('search-sort')">Search &amp; Sort</a></li>
          <li><a href="#custom-columns" class="ds-sidebar__link" :class="{ 'is-active': activeSection === 'custom-columns' }" @click.prevent="scrollTo('custom-columns')">Custom Columns</a></li>
          <li><a href="#row-actions" class="ds-sidebar__link" :class="{ 'is-active': activeSection === 'row-actions' }" @click.prevent="scrollTo('row-actions')">Row Actions</a></li>
        </ul>
      </div>
    </aside>

    <main class="ds-main ds-prose">
      <section class="ds-hero">
        <div class="ds-hero__grid-bg"></div>
        <div class="ds-hero__content">
          <div class="ds-hero__eyebrow">
            <span class="ds-hero__eyebrow-tag">v0.2</span>
            <span>Pluggable providers · Vue 3.4+</span>
          </div>
          <h1 class="ds-hero__title">Tables that <em>scale</em>,<br>not tables that fight you.</h1>
          <p class="ds-hero__lede">
            A framework-agnostic DataTable for Vue 3 with pluggable data providers, dual pagination modes,
            custom state persistence, and a rendering layer you can opt into — or replace entirely.
          </p>
          <div class="ds-hero__ctas">
            <div class="ds-install">
              <span class="ds-install__dollar">$</span>
              <span class="ds-install__cmd">pnpm add @einhasad-vue/datatable-vue</span>
              <button class="ds-install__copy" aria-label="Copy install command">
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="7" width="10" height="10" rx="1.5"/><path d="M13 7V4.5A1.5 1.5 0 0011.5 3h-7A1.5 1.5 0 003 4.5v7A1.5 1.5 0 004.5 13H7"/></svg>
              </button>
            </div>
            <a class="ds-btn ds-btn--primary" href="#basic">Read the docs →</a>
            <a class="ds-btn ds-btn--ghost" href="https://github.com/einhasad/vue-datatable" target="_blank" rel="noopener">GitHub ↗</a>
          </div>
        </div>
      </section>

      <h2 id="introduction" class="demo-section">Introduction</h2>
      <p class="ds-lede">
        <code>@einhasad-vue/datatable-vue</code> is the table layer built to handle sort, filter, paginate,
        and state persistence — so your code doesn't have to.
      </p>
      <p>
        Give it a <strong>data provider</strong> (array, callback, or HTTP) and a <strong>column definition</strong>,
        and it runs. Swap in a <code>StateProvider</code> to persist state to the URL, localStorage, or a hash fragment.
        Replace any part via slots. That's the whole model.
      </p>

      <div class="ds-concept-grid">
        <a href="#array-provider" class="ds-concept-card">
          <span class="ds-concept-card__icon">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="10" cy="5" rx="6" ry="2.5"/><path d="M4 5v5c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5V5"/><path d="M4 10v5c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-5"/></svg>
          </span>
          <h3 class="ds-concept-card__title">Pluggable providers</h3>
          <p class="ds-concept-card__desc">Array, HTTP, or custom. One interface, swap without changing your template.</p>
        </a>
        <a href="#page-pagination" class="ds-concept-card">
          <span class="ds-concept-card__icon">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="14" height="12" rx="1.5"/><path d="M8 4v12M13 4v12"/></svg>
          </span>
          <h3 class="ds-concept-card__title">Dual pagination</h3>
          <p class="ds-concept-card__desc">Page numbers for admin tables. Cursor / infinite scroll for feeds.</p>
        </a>
        <a href="#state-queryparams" class="ds-concept-card">
          <span class="ds-concept-card__icon">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M3 10a7 7 0 0 1 12-5l2-1"/><path d="M17 10a7 7 0 0 1-12 5l-2 1"/><path d="M17 4v3h-3M3 16v-3h3"/></svg>
          </span>
          <h3 class="ds-concept-card__title">State persistence</h3>
          <p class="ds-concept-card__desc">InMemory, URL params, localStorage, or hash. Plug in or swap freely.</p>
        </a>
      </div>

      <section id="basic" class="demo-section">
        <h2>Basic Example</h2>
        <p>
          The most minimal setup: pass an <code>ArrayDataProvider</code> and a column definition.
          No pagination, no sorting setup — just data on screen.
        </p>
        <ExampleFrame file="BasicExample.vue" :source="basicSource">
          <BasicExample />
        </ExampleFrame>
      </section>

      <section id="array-provider" class="demo-section">
        <h2>Array Provider</h2>
        <p>
          <code>ArrayDataProvider</code> handles client-side pagination, sorting, and filtering without a backend.
          Perfect for datasets up to thousands of rows. Click column headers to sort; use <code>PagePagination</code>
          in the <code>#pagination</code> slot for numbered pages.
        </p>
        <ExampleFrame file="ArrayProviderExample.vue" :source="arrayProviderSource">
          <ArrayProviderExample />
        </ExampleFrame>
      </section>

      <section id="http-provider" class="demo-section">
        <h2>HTTP Provider</h2>
        <p>
          Demonstrates <code>ArrayDataProvider</code> with client-side search and pagination over mock GitHub
          repository data. Search for repositories, sort by stars or forks, and navigate pages.
        </p>
        <ExampleFrame file="HttpProviderExample.vue" :source="httpProviderSource">
          <HttpProviderExample />
        </ExampleFrame>
      </section>

      <section id="state-inmemory" class="demo-section">
        <h2>InMemory State Provider</h2>
        <p>
          State lives in memory for the lifetime of the page. Filters, sort, and page reset on refresh.
          Useful for temporary filtering or when you own state externally.
        </p>
        <ExampleFrame file="InMemoryStateExample.vue" :source="inMemoryStateSource">
          <InMemoryStateExample />
        </ExampleFrame>
      </section>

      <section id="state-localstorage" class="demo-section">
        <h2>LocalStorage State Provider</h2>
        <p>
          State is persisted to <code>localStorage</code> and survives page refreshes and browser sessions.
          Sort or filter, then refresh — your preferences are restored automatically.
        </p>
        <div class="ds-callout ds-callout--note">
          <span class="ds-callout__icon">i</span>
          <div class="ds-callout__body">
            <div class="ds-callout__title">Persistent preferences</div>
            <p style="margin:0">Try sorting or filtering, then refresh the page. Your state will be restored from <code>localStorage</code> key <code>grid-demo-state</code>.</p>
          </div>
        </div>
        <ExampleFrame file="LocalStorageStateExample.vue" :source="localStorageStateSource">
          <LocalStorageStateExample />
        </ExampleFrame>
      </section>

      <section id="state-queryparams" class="demo-section">
        <h2>QueryParams State Provider</h2>
        <p>
          State is stored in URL query parameters with a <code>qp-</code> prefix. Filter or sort and watch
          the address bar update. Share the URL to bookmark a specific filtered view.
        </p>
        <div class="ds-callout ds-callout--tip">
          <span class="ds-callout__icon">✓</span>
          <div class="ds-callout__body">
            <div class="ds-callout__title">Shareable URLs</div>
            <p style="margin:0">Notice the URL updates as you interact. Browser back/forward navigation restores the previous state. Requires Vue Router.</p>
          </div>
        </div>
        <ExampleFrame file="QueryParamsStateExample.vue" :source="queryParamsStateSource">
          <QueryParamsStateExample />
        </ExampleFrame>
      </section>

      <section id="state-hash" class="demo-section">
        <h2>Hash State Provider</h2>
        <p>
          State is stored in the URL hash fragment with a <code>hash-</code> prefix. Similar to QueryParams
          but does not interfere with server-side query parameters or other URL-driven components.
        </p>
        <ExampleFrame file="HashStateExample.vue" :source="hashStateSource">
          <HashStateExample />
        </ExampleFrame>
      </section>

      <section id="multi-state" class="demo-section">
        <h2>Multi-State</h2>
        <p>
          Multiple grids on one page, each with independent URL-persisted state. The <code>products</code> prefix
          drives the first grid; the <code>users</code> prefix drives the second. No state bleeding between them.
        </p>
        <div class="ds-callout ds-callout--note">
          <span class="ds-callout__icon">i</span>
          <div class="ds-callout__body">
            <div class="ds-callout__title">Independent prefixes</div>
            <p style="margin:0">Sort or paginate either grid — the URL params are namespaced so they never collide.</p>
          </div>
        </div>
        <ExampleFrame file="MultiStateExample.vue" :source="multiStateSource">
          <MultiStateExample />
        </ExampleFrame>
      </section>

      <section id="page-pagination" class="demo-section">
        <h2>Page Pagination</h2>
        <p>
          Traditional numbered pagination via the <code>PagePagination</code> component in the
          <code>#pagination</code> slot. Shows page numbers, prev/next, and an optional summary line.
          47 rows at 10 per page gives 5 pages.
        </p>
        <ExampleFrame file="PagePaginationExample.vue" :source="pagePaginationSource">
          <PagePaginationExample />
        </ExampleFrame>
      </section>

      <section id="cursor-pagination" class="demo-section">
        <h2>Cursor Pagination (Load More)</h2>
        <p>
          Cursor-based pagination with a "Load More" button. Ideal for infinite-scroll interfaces and
          mobile-friendly experiences where numbered pages feel unnatural. 35 products, 8 per load.
        </p>
        <ExampleFrame file="CursorPaginationExample.vue" :source="cursorPaginationSource">
          <CursorPaginationExample />
        </ExampleFrame>
      </section>

      <section id="scroll-pagination" class="demo-section">
        <h2>Infinite Scroll Pagination (10,000 rows)</h2>
        <p>
          Automatic infinite scroll with a large dataset (10,000 rows), search functionality, column
          sorting, and URL state persistence via <code>QueryParamsStateProvider</code>. Scroll down to
          load more — no button needed.
        </p>
        <ExampleFrame file="ScrollPaginationExample.vue" :source="scrollPaginationSource">
          <ScrollPaginationExample />
        </ExampleFrame>
      </section>

      <section id="sorting" class="demo-section">
        <h2>Sorting</h2>
        <p>
          Click column headers to toggle ascending/descending sort. Use the dropdown to sort by a field
          not shown in the table (position). Default order is by ID ascending.
        </p>
        <ExampleFrame file="SortingExample.vue" :source="sortingSource">
          <SortingExample />
        </ExampleFrame>
      </section>

      <section id="search-sort" class="demo-section">
        <h2>Search &amp; Sort</h2>
        <p>
          Global search filters by a hidden field (email) while column-level filters target individual
          columns. Demonstrates combining external search with per-column filter inputs.
        </p>
        <ExampleFrame file="SearchSortExample.vue" :source="searchSortSource">
          <SearchSortExample />
        </ExampleFrame>
      </section>

      <section id="custom-columns" class="demo-section">
        <h2>Custom Columns</h2>
        <p>
          Use the <code>component</code> and <code>value</code> column properties to render badges,
          progress bars, and formatted text. The <code>component</code> function returns a
          <code>ComponentOptions</code> descriptor; the library handles mounting.
        </p>
        <ExampleFrame file="CustomColumnsExample.vue" :source="customColumnsSource">
          <CustomColumnsExample />
        </ExampleFrame>
      </section>

      <section id="row-actions" class="demo-section">
        <h2>Row Actions</h2>
        <p>
          Pass <code>:on-row-click</code> to handle row selection. Use <code>:row-options</code> to apply
          dynamic classes or styles per row — useful for highlighting the selected row or dimming inactive entries.
        </p>
        <ExampleFrame file="RowActionsExample.vue" :source="rowActionsSource">
          <RowActionsExample />
        </ExampleFrame>
      </section>

      <div style="margin-top:56px;padding:20px 0;border-top:1px solid var(--line);display:flex;justify-content:space-between;font-size:13px;color:var(--ink-3);">
        <span>Last updated <time>April 22, 2026</time></span>
        <a href="https://github.com/einhasad/vue-datatable" style="color:var(--ink-3);" target="_blank" rel="noopener">Edit on GitHub ↗</a>
      </div>
    </main>

  </div>

  <footer class="ds-footer">
    <div class="ds-footer__inner">
      <div class="ds-footer__brand">
        <a class="ds-header__brand" href="/">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
            <rect width="22" height="22" rx="5" fill="#FFC833"/>
            <rect x="5" y="7" width="12" height="1.5" rx="0.75" fill="#1A1505"/>
            <rect x="5" y="10.25" width="12" height="1.5" rx="0.75" fill="#1A1505"/>
            <rect x="5" y="13.5" width="7" height="1.5" rx="0.75" fill="#1A1505"/>
          </svg>
          <span class="ds-header__wordmark"><span class="ds-header__wordmark-scope">@einhasad-vue/</span>datatable-vue</span>
        </a>
        <p>A DataTable for Vue 3 that handles the boring parts. MIT licensed.</p>
      </div>
      <div class="ds-footer__col">
        <h4>Docs</h4>
        <ul>
          <li><a href="#basic">Basic Example</a></li>
          <li><a href="#array-provider">Array Provider</a></li>
          <li><a href="#page-pagination">Pagination</a></li>
        </ul>
      </div>
      <div class="ds-footer__col">
        <h4>State</h4>
        <ul>
          <li><a href="#state-inmemory">InMemory</a></li>
          <li><a href="#state-queryparams">QueryParams</a></li>
          <li><a href="#state-hash">Hash</a></li>
        </ul>
      </div>
      <div class="ds-footer__col">
        <h4>Community</h4>
        <ul>
          <li><a href="https://github.com/einhasad/vue-datatable" target="_blank" rel="noopener">GitHub</a></li>
          <li><a href="https://github.com/einhasad/vue-datatable/issues" target="_blank" rel="noopener">Issues</a></li>
          <li><a href="https://github.com/einhasad/vue-datatable/discussions" target="_blank" rel="noopener">Discussions</a></li>
        </ul>
      </div>
    </div>
    <div class="ds-footer__legal">
      <span>© 2026 einhasad · MIT</span>
      <span>Built with datatable-vue itself.</span>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import ExampleFrame from './components/ExampleFrame.vue'
import BasicExample from './components/BasicExample.vue'
import ArrayProviderExample from './components/ArrayProviderExample.vue'
import HttpProviderExample from './components/HttpProviderExample.vue'
import InMemoryStateExample from './components/InMemoryStateExample.vue'
import LocalStorageStateExample from './components/LocalStorageStateExample.vue'
import QueryParamsStateExample from './components/QueryParamsStateExample.vue'
import HashStateExample from './components/HashStateExample.vue'
import MultiStateExample from './components/MultiStateExample.vue'
import PagePaginationExample from './components/PagePaginationExample.vue'
import CursorPaginationExample from './components/CursorPaginationExample.vue'
import ScrollPaginationExample from './components/ScrollPaginationExample.vue'
import SortingExample from './components/SortingExample.vue'
import SearchSortExample from './components/SearchSortExample.vue'
import CustomColumnsExample from './components/CustomColumnsExample.vue'
import RowActionsExample from './components/RowActionsExample.vue'

import basicSource from './components/BasicExample.vue?raw'
import arrayProviderSource from './components/ArrayProviderExample.vue?raw'
import httpProviderSource from './components/HttpProviderExample.vue?raw'
import inMemoryStateSource from './components/InMemoryStateExample.vue?raw'
import localStorageStateSource from './components/LocalStorageStateExample.vue?raw'
import queryParamsStateSource from './components/QueryParamsStateExample.vue?raw'
import hashStateSource from './components/HashStateExample.vue?raw'
import multiStateSource from './components/MultiStateExample.vue?raw'
import pagePaginationSource from './components/PagePaginationExample.vue?raw'
import cursorPaginationSource from './components/CursorPaginationExample.vue?raw'
import scrollPaginationSource from './components/ScrollPaginationExample.vue?raw'
import sortingSource from './components/SortingExample.vue?raw'
import searchSortSource from './components/SearchSortExample.vue?raw'
import customColumnsSource from './components/CustomColumnsExample.vue?raw'
import rowActionsSource from './components/RowActionsExample.vue?raw'

const activeSection = ref('introduction')

const sections = [
  'introduction',
  'basic',
  'array-provider',
  'http-provider',
  'state-inmemory',
  'state-localstorage',
  'state-queryparams',
  'state-hash',
  'multi-state',
  'page-pagination',
  'cursor-pagination',
  'scroll-pagination',
  'sorting',
  'search-sort',
  'custom-columns',
  'row-actions'
]

function scrollTo(id: string) {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    activeSection.value = id
  }
}

function updateActiveSection() {
  const scrollPosition = window.scrollY + 150
  for (let i = sections.length - 1; i >= 0; i--) {
    const section = document.getElementById(sections[i])
    if (section && section.offsetTop <= scrollPosition) {
      activeSection.value = sections[i]
      break
    }
  }
}

onMounted(() => {
  window.addEventListener('scroll', updateActiveSection)
  updateActiveSection()
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateActiveSection)
})
</script>

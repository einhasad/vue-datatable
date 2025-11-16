<template>
  <div class="app">
    <header class="header">
      <div class="header-content">
        <h1>Grid Vue</h1>
        <p class="tagline">A flexible, configurable grid component library for Vue 3</p>
      </div>
    </header>

    <div class="layout">
      <!-- Left Sidebar Menu -->
      <aside class="sidebar">
        <nav class="nav">
          <a href="#introduction" :class="['nav-link', { active: activeSection === 'introduction' }]" @click="scrollToSection">Introduction</a>
          <a href="#basic" :class="['nav-link', { active: activeSection === 'basic' }]" @click="scrollToSection">Basic Example</a>
          <div class="nav-section">
            <span class="nav-section-title">Data Providers</span>
            <a href="#array-provider" :class="['nav-link', 'nav-sub-link', { active: activeSection === 'array-provider' }]" @click="scrollToSection">Array Provider</a>
            <a href="#http-provider" :class="['nav-link', 'nav-sub-link', { active: activeSection === 'http-provider' }]" @click="scrollToSection">HTTP Provider</a>
          </div>
          <div class="nav-section">
            <span class="nav-section-title">State Providers</span>
            <a href="#state-inmemory" :class="['nav-link', 'nav-sub-link', { active: activeSection === 'state-inmemory' }]" @click="scrollToStateProvider('inmemory')">InMemory</a>
            <a href="#state-queryparams" :class="['nav-link', 'nav-sub-link', { active: activeSection === 'state-queryparams' }]" @click="scrollToStateProvider('queryparams')">Query Params</a>
            <a href="#state-localstorage" :class="['nav-link', 'nav-sub-link', { active: activeSection === 'state-localstorage' }]" @click="scrollToStateProvider('localstorage')">LocalStorage</a>
            <a href="#state-hash" :class="['nav-link', 'nav-sub-link', { active: activeSection === 'state-hash' }]" @click="scrollToStateProvider('hash')">Hash</a>
          </div>
          <a href="#page-pagination" :class="['nav-link', { active: activeSection === 'page-pagination' }]" @click="scrollToSection">Page Pagination</a>
          <a href="#cursor-pagination" :class="['nav-link', { active: activeSection === 'cursor-pagination' }]" @click="scrollToSection">Cursor Pagination</a>
          <a href="#sorting" :class="['nav-link', { active: activeSection === 'sorting' }]" @click="scrollToSection">Sorting</a>
          <a href="#search-sort" :class="['nav-link', { active: activeSection === 'search-sort' }]" @click="scrollToSection">Search & Sort</a>
          <a href="#custom-columns" :class="['nav-link', { active: activeSection === 'custom-columns' }]" @click="scrollToSection">Custom Columns</a>
          <a href="#row-actions" :class="['nav-link', { active: activeSection === 'row-actions' }]" @click="scrollToSection">Row Actions</a>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="main">
        <div class="content">
          <!-- Introduction Section -->
          <section id="introduction" class="section">
            <div class="hero">
              <h2>Welcome to Grid Vue Examples</h2>
              <p>
                Explore interactive examples demonstrating the features and capabilities of Grid Vue,
                a flexible and configurable grid component library for Vue 3 applications.
              </p>
            </div>

            <div class="example-section">
              <h3>Features</h3>
              <ul class="feature-list">
                <li>Dual Pagination Modes: Cursor-based (Load More) and page-based (1, 2, 3...)</li>
                <li>Data Provider Pattern: Pluggable data sources (HTTP, Array, custom)</li>
                <li>State Provider Pattern: Pluggable state management (URL, localStorage, hash, in-memory)</li>
                <li>Framework Agnostic: No dependencies on UI frameworks</li>
                <li>TypeScript First: Full TypeScript support</li>
                <li>Customizable: Extensive props, slots, and CSS custom properties</li>
                <li>Sorting: Built-in column sorting support</li>
                <li>Footer Row: Calculations and aggregations</li>
                <li>Row & Cell Options: Custom classes, styles, and attributes</li>
                <li>Dynamic Components: Render custom components in cells</li>
              </ul>
            </div>

            <div class="example-section">
              <h3>Installation</h3>
              <div class="code-block">npm install @grid-vue/grid</div>
              <p>Then import the CSS in your main entry file:</p>
              <div class="code-block">import '@grid-vue/grid/style.css'</div>
            </div>

            <div class="example-section">
              <h3>Quick Links</h3>
              <div class="actions">
                <a href="https://github.com/einhasad/vue-datatable" target="_blank" class="btn">
                  View on GitHub
                </a>
                <a href="https://www.npmjs.com/package/@grid-vue/grid" target="_blank" class="btn btn-secondary">
                  View on npm
                </a>
              </div>
            </div>
          </section>

          <!-- Basic Example Section -->
          <section id="basic" class="section">
            <BasicExample />
          </section>

          <!-- Array Provider Section -->
          <section id="array-provider" class="section">
            <ArrayProviderExample />
          </section>

          <!-- HTTP Provider Section -->
          <section id="http-provider" class="section">
            <HTTPProviderExample />
          </section>

          <!-- HTTP Example Section -->
          <section id="http" class="section">
            <HttpExample />
          </section>

          <!-- State Providers Section -->
          <section id="state-providers" class="section">
            <StateProvidersExample :initial-tab="stateProviderTab" />
          </section>

          <!-- Page Pagination Section -->
          <section id="page-pagination" class="section">
            <PagePaginationExample />
          </section>

          <!-- Cursor Pagination Section -->
          <section id="cursor-pagination" class="section">
            <CursorPaginationExample />
          </section>

          <!-- Sorting Section -->
          <section id="sorting" class="section">
            <SortingExample />
          </section>

          <!-- Search & Sort Section -->
          <section id="search-sort" class="section">
            <SearchSortExample />
          </section>

          <!-- Custom Columns Section -->
          <section id="custom-columns" class="section">
            <CustomColumnsExample />
          </section>

          <!-- Row Actions Section -->
          <section id="row-actions" class="section">
            <RowActionsExample />
          </section>
        </div>
      </main>
    </div>

    <footer class="footer">
      <div class="footer-content">
        <p>
          <a href="https://github.com/einhasad/vue-datatable" target="_blank">GitHub</a> •
          <a href="https://www.npmjs.com/package/@grid-vue/grid" target="_blank">npm</a>
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import BasicExample from './pages/BasicExample.new.vue'
import ArrayProviderExample from './pages/ArrayProviderExample.new.vue'
import HttpExample from './pages/HttpExample.vue'
import HTTPProviderExample from './pages/HTTPProviderExample.vue'
import StateProvidersExample from './pages/StateProvidersExample.vue'
import PagePaginationExample from './pages/PagePaginationExample.vue'
import CursorPaginationExample from './pages/CursorPaginationExample.vue'
import SortingExample from './pages/SortingExample.vue'
import SearchSortExample from './pages/SearchSortExample.vue'
import CustomColumnsExample from './pages/CustomColumnsExample.vue'
import RowActionsExample from './pages/RowActionsExample.vue'

const activeSection = ref('introduction')
const stateProviderTab = ref<string | null>(null)

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

const scrollToStateProvider = (tab: string) => {
  return (event: Event) => {
    event.preventDefault()
    stateProviderTab.value = tab
    const element = document.getElementById('state-providers')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      activeSection.value = `state-${tab}`
    }
  }
}

const updateActiveSection = () => {
  const sections = [
    'introduction',
    'basic',
    'array-provider',
    'http-provider',
    'state-providers',
    'page-pagination',
    'cursor-pagination',
    'sorting',
    'search-sort',
    'custom-columns',
    'row-actions'
  ]

  const scrollPosition = window.scrollY + 150

  for (let i = sections.length - 1; i >= 0; i--) {
    const section = document.getElementById(sections[i])
    if (section && section.offsetTop <= scrollPosition) {
      // If we're in the state-providers section and have a tab selected, use the specific state section
      if (sections[i] === 'state-providers' && stateProviderTab.value) {
        activeSection.value = `state-${stateProviderTab.value}`
      } else {
        activeSection.value = sections[i]
      }
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

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
}

.header h1 {
  margin: 0;
  font-size: 2.5rem;
}

.tagline {
  margin: 0.5rem 0 0;
  opacity: 0.9;
  font-size: 1.1rem;
    color: white;
}

.layout {
  display: flex;
  flex: 1;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.sidebar {
  width: 250px;
  background: #f7fafc;
  border-right: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  height: calc(100vh - 10rem);
  overflow-y: auto;
  flex-shrink: 0;
}

.nav {
  padding: 1.5rem 0;
}

.nav-section {
  margin: 0.5rem 0;
}

.nav-section-title {
  display: block;
  padding: 0.75rem 1.5rem 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #667eea;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.nav-sub-link {
  padding-left: 2.5rem !important;
  font-size: 0.9rem;
}

.nav-link {
  display: block;
  padding: 0.75rem 1.5rem;
  text-decoration: none;
  color: #4a5568;
  transition: all 0.2s;
  border-left: 3px solid transparent;
}

.nav-link:hover {
  background: #edf2f7;
  color: #667eea;
  border-left-color: #667eea;
}

.nav-link.active {
  background: #edf2f7;
  color: #667eea;
  border-left-color: #667eea;
  font-weight: 600;
}

.main {
  flex: 1;
  overflow-y: auto;
}

.content {
  padding: 2rem;
  max-width: 1100px;
}

.section {
  margin-bottom: 4rem;
  scroll-margin-top: 2rem;
}

.section:last-child {
  margin-bottom: 2rem;
}

.hero {
  text-align: center;
  margin-bottom: 2rem;
  padding: 2rem;
}

.hero h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.feature-list {
  line-height: 1.8;
}

.feature-list li {
  margin-bottom: 0.5rem;
}

.example-section {
  margin-bottom: 2rem;
}

.actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  text-decoration: none;
  border-radius: 0.375rem;
  transition: all 0.2s;
}

.btn:hover {
  background: #5a67d8;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.btn-secondary {
  background: #48bb78;
}

.btn-secondary:hover {
  background: #38a169;
}

.footer {
  background: #f7fafc;
  padding: 2rem;
  text-align: center;
  border-top: 1px solid #e2e8f0;
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
}

.footer a {
  color: #667eea;
  text-decoration: none;
}

.footer a:hover {
  text-decoration: underline;
}

/* Responsive Design */
@media (max-width: 768px) {
  .layout {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    height: auto;
    position: relative;
    border-right: none;
    border-bottom: 1px solid #e2e8f0;
  }

  .nav {
    display: flex;
    overflow-x: auto;
    padding: 0.5rem 0;
  }

  .nav-link {
    white-space: nowrap;
    border-left: none;
    border-bottom: 3px solid transparent;
  }

  .nav-link:hover {
    border-left-color: transparent;
    border-bottom-color: #667eea;
  }

  .content {
    padding: 1rem;
  }
}
</style>

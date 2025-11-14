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
          <a href="#introduction" class="nav-link" @click="scrollToSection">Introduction</a>
          <a href="#basic" class="nav-link" @click="scrollToSection">Basic Example</a>
          <a href="#http" class="nav-link" @click="scrollToSection">HTTP Provider</a>
          <a href="#page-pagination" class="nav-link" @click="scrollToSection">Page Pagination</a>
          <a href="#cursor-pagination" class="nav-link" @click="scrollToSection">Cursor Pagination</a>
          <a href="#sorting" class="nav-link" @click="scrollToSection">Sorting</a>
          <a href="#custom-columns" class="nav-link" @click="scrollToSection">Custom Columns</a>
          <a href="#row-actions" class="nav-link" @click="scrollToSection">Row Actions</a>
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

          <!-- HTTP Example Section -->
          <section id="http" class="section">
            <HttpExample />
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
import BasicExample from './pages/BasicExample.vue'
import HttpExample from './pages/HttpExample.vue'
import PagePaginationExample from './pages/PagePaginationExample.vue'
import CursorPaginationExample from './pages/CursorPaginationExample.vue'
import SortingExample from './pages/SortingExample.vue'
import CustomColumnsExample from './pages/CustomColumnsExample.vue'
import RowActionsExample from './pages/RowActionsExample.vue'

const scrollToSection = (event: Event) => {
  event.preventDefault()
  const target = event.target as HTMLAnchorElement
  const id = target.getAttribute('href')?.slice(1)
  if (id) {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }
}
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

.code-block {
  background: #2d3748;
  color: #f7fafc;
  padding: 1rem;
  border-radius: 0.375rem;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.875rem;
  margin: 0.5rem 0;
  overflow-x: auto;
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

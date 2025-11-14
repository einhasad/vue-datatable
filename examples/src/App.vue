<template>
  <div class="app">
    <header class="header">
      <div class="container">
        <h1>
          <router-link to="/">Grid Vue</router-link>
        </h1>
        <p class="tagline">A flexible, configurable grid component library for Vue 3</p>
      </div>
    </header>

    <nav class="nav">
      <div class="container">
        <router-link to="/" class="nav-link">Home</router-link>
        <router-link to="/basic" class="nav-link">Basic</router-link>
        <router-link to="/page-pagination" class="nav-link">Page Pagination</router-link>
        <router-link to="/cursor-pagination" class="nav-link">Cursor Pagination</router-link>
        <router-link to="/sorting" class="nav-link">Sorting</router-link>
        <router-link to="/custom-columns" class="nav-link">Custom Columns</router-link>
        <router-link to="/row-actions" class="nav-link">Row Actions</router-link>
      </div>
    </nav>

    <main class="main">
      <div class="container">
        <router-view />
      </div>
    </main>

    <footer class="footer">
      <div class="container">
        <p>
          <a href="https://github.com/einhasad/vue-datatable" target="_blank">GitHub</a> •
          <a href="https://www.npmjs.com/package/@grid-vue/grid" target="_blank">npm</a>
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
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
  padding: 2rem 0;
}

.header h1 {
  margin: 0;
  font-size: 2.5rem;
}

.header h1 a {
  color: white;
  text-decoration: none;
}

.header h1 a:hover {
  opacity: 0.9;
}

.tagline {
  margin: 0.5rem 0 0;
  opacity: 0.9;
  font-size: 1.1rem;
}

.nav {
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.nav .container {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding: 0.75rem 1rem;
}

.nav-link {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  text-decoration: none;
  color: #4a5568;
  white-space: nowrap;
  transition: all 0.2s;
}

.nav-link:hover {
  background: #f7fafc;
  color: #667eea;
}

.nav-link.router-link-active {
  background: #667eea;
  color: white;
}

.main {
  flex: 1;
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.footer {
  background: #f7fafc;
  padding: 2rem 0;
  text-align: center;
  border-top: 1px solid #e2e8f0;
}

.footer a {
  color: #667eea;
  text-decoration: none;
}

.footer a:hover {
  text-decoration: underline;
}
</style>

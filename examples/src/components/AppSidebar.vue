<template>
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
        <a href="#state-inmemory" :class="['nav-link', 'nav-sub-link', { active: activeSection === 'state-inmemory' }]" @click="scrollToSection">InMemory</a>
        <a href="#state-localstorage" :class="['nav-link', 'nav-sub-link', { active: activeSection === 'state-localstorage' }]" @click="scrollToSection">LocalStorage</a>
        <a href="#state-queryparams" :class="['nav-link', 'nav-sub-link', { active: activeSection === 'state-queryparams' }]" @click="scrollToSection">QueryParams</a>
        <a href="#state-hash" :class="['nav-link', 'nav-sub-link', { active: activeSection === 'state-hash' }]" @click="scrollToSection">Hash</a>
      </div>
      <a href="#page-pagination" :class="['nav-link', { active: activeSection === 'page-pagination' }]" @click="scrollToSection">Page Pagination</a>
      <a href="#cursor-pagination" :class="['nav-link', { active: activeSection === 'cursor-pagination' }]" @click="scrollToSection">Cursor Pagination</a>
      <a href="#scroll-pagination" :class="['nav-link', { active: activeSection === 'scroll-pagination' }]" @click="scrollToSection">Scroll Pagination</a>
      <a href="#sorting" :class="['nav-link', { active: activeSection === 'sorting' }]" @click="scrollToSection">Sort</a>
      <a href="#search-sort" :class="['nav-link', { active: activeSection === 'search-sort' }]" @click="scrollToSection">Search</a>
      <a href="#custom-columns" :class="['nav-link', { active: activeSection === 'custom-columns' }]" @click="scrollToSection">Custom Columns</a>
      <a href="#row-actions" :class="['nav-link', { active: activeSection === 'row-actions' }]" @click="scrollToSection">Row Actions</a>
    </nav>
  </aside>
</template>

<script setup lang="ts">
defineProps<{
  activeSection: string
}>()

const emit = defineEmits<{
  scroll: [event: Event]
}>()

const scrollToSection = (event: Event) => {
  emit('scroll', event)
}
</script>

<style scoped>
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

</style>

<style scoped>
@media (max-width: 768px) {
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
}
</style>

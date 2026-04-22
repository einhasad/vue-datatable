<template>
  <div class="app">
    <AppHeader />

    <div class="layout">
      <AppSidebar :active-section="activeSection" @scroll="scrollToSection" />

      <main class="main">
        <div class="content">
          <IntroductionSection />
          <BasicExample />
          <ArrayProviderExample />
          <HttpProviderExample />
          <InMemoryStateExample />
          <LocalStorageStateExample />
          <QueryParamsStateExample />
          <HashStateExample />
          <MultiStateExample />
          <PagePaginationExample />
          <CursorPaginationExample />
          <ScrollPaginationExample />
          <SortingExample />
          <SearchSortExample />
          <CustomColumnsExample />
          <RowActionsExample />
        </div>
      </main>
    </div>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import AppHeader from './components/AppHeader.vue'
import AppSidebar from './components/AppSidebar.vue'
import AppFooter from './components/AppFooter.vue'
import IntroductionSection from './components/IntroductionSection.vue'
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

const activeSection = ref('introduction')

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

const updateActiveSection = () => {
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

@media (max-width: 768px) {
  .layout {
    flex-direction: column;
  }

  .content {
    padding: 1rem;
  }
}
</style>

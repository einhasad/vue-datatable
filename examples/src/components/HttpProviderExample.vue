<template>
  <section id="http-provider" class="section">
    <div>
      <h2>HTTP Provider Example</h2>
      <p>
        This example demonstrates <strong>CallbackDataProvider</strong> with client-side search and pagination
        over mock GitHub repository data. Search for repositories, sort by stars/forks/updated, and navigate pages!
      </p>

      <div class="example-section">
        <h3>Search &amp; Filters</h3>
        <div class="controls">
          <div class="control-group">
            <label for="search">Search Repositories:</label>
            <input
              id="search"
              v-model="searchQuery"
              type="text"
              placeholder="e.g., vue datatable"
              class="search-input"
              @keyup.enter="handleSearch"
            />
            <button @click="handleSearch" class="btn btn-primary">Search</button>
          </div>

          <div class="control-group">
            <label for="sort">Sort By:</label>
            <select id="sort" v-model="sortBy" @change="handleSearch" class="sort-select">
              <option value="stars">Stars</option>
              <option value="forks">Forks</option>
              <option value="updated">Recently Updated</option>
              <option value="help-wanted-issues">Help Wanted</option>
            </select>
          </div>

          <div class="control-group" v-if="totalCount > 0">
            <span>Results: {{ totalCount.toLocaleString() }} repositories</span>
          </div>
        </div>
      </div>

      <div class="example-section">
        <h3>Results</h3>
        <Grid
          :data-provider="gridProvider"
          :columns="githubColumns"
        />
        <div v-if="totalCount > 0" class="http-pagination">
          <span class="grid-pagination-summary">{{ totalCount }} items</span>
          <span class="grid-pagination-summary">Showing {{ rangeStart }}-{{ rangeEnd }}</span>
          <div class="grid-pagination-page">
            <button
              v-for="page in visiblePages"
              :key="page"
              type="button"
              class="grid-pagination-page-number"
              :class="{ 'grid-pagination-active': page === currentPage }"
              @click="goToPage(page)"
            >
              {{ page }}
            </button>
          </div>
        </div>
      </div>

      <div class="example-section">
        <h3>Code</h3>
        <CodeExample examplePath="/examples/code/HttpProviderExample.ts" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Grid,
  ArrayDataProvider,
  type Column
} from '@einhasad-vue/datatable-vue'
import CodeExample from './CodeExample.vue'
import { generateMockRepositories } from '../mocks/data'
import { processSearchRequest } from '../mocks/search'

const allMockRepos = generateMockRepositories()
const pageSize = 20

const searchQuery = ref('vue table')
const sortBy = ref('stars')
const totalCount = ref(0)
const currentPage = ref(1)

function getFilteredItems() {
  const result = processSearchRequest(allMockRepos, {
    q: searchQuery.value,
    sort: sortBy.value,
    order: 'desc',
    page: 1,
    per_page: 1000
  })
  return result.items
}

const gridProvider = new ArrayDataProvider({
  items: getFilteredItems()
})

// Initialize with first page of results
totalCount.value = gridProvider.getCurrentItems().length
gridProvider.setOffsetPagination({ page: 1, pageSize })

const totalPages = computed(() => Math.ceil(totalCount.value / pageSize))

const visiblePages = computed(() => {
  const pages: number[] = []
  for (let i = 1; i <= totalPages.value; i++) pages.push(i)
  return pages
})

const rangeStart = computed(() => {
  if (totalCount.value === 0) return 0
  return (currentPage.value - 1) * pageSize + 1
})

const rangeEnd = computed(() => {
  return Math.min(currentPage.value * pageSize, totalCount.value)
})

async function goToPage(page: number) {
  currentPage.value = page
  gridProvider.setOffsetPagination({ page, pageSize })
}

async function handleSearch() {
  const filtered = getFilteredItems()
  gridProvider.setAllItems(filtered)
  currentPage.value = 1
  gridProvider.setOffsetPagination({ page: 1, pageSize })
  totalCount.value = filtered.length
}

const githubColumns: Column[] = [
  {
    key: 'full_name',
    label: 'Repository',
    component: (row: any) => ({
      is: 'a',
      props: {
        href: row.html_url,
        target: '_blank',
        style: {
          color: '#667eea',
          fontWeight: 'bold',
          textDecoration: 'none'
        }
      },
      content: row.full_name
    })
  },
  {
    key: 'description',
    label: 'Description',
    value: (row: any) => {
      const desc = row.description || 'No description'
      return desc.length > 100 ? desc.substring(0, 100) + '...' : desc
    }
  },
  {
    key: 'stargazers_count',
    label: 'Stars',
    value: (row: any) => row.stargazers_count.toLocaleString()
  },
  {
    key: 'forks_count',
    label: 'Forks',
    value: (row: any) => row.forks_count.toLocaleString()
  },
  {
    key: 'language',
    label: 'Language',
    value: (row: any) => row.language || 'Unknown'
  },
  {
    key: 'updated_at',
    label: 'Updated',
    value: (row: any) => new Date(row.updated_at).toLocaleDateString()
  }
]
</script>

<style scoped>
.section {
  margin-bottom: 4rem;
  scroll-margin-top: 2rem;
}

.example-section {
  margin-bottom: 2rem;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 200px;
  flex: 1;
}

.control-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #4a5568;
}

.search-input,
.sort-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--grid-border-color, #cbd5e0);
  border-radius: 0.375rem;
  font-size: 0.9rem;
  color: var(--grid-input-color, #2d3748);
  background: var(--grid-input-bg, white);
  transition: all 0.2s;
}

.search-input:focus,
.sort-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.btn-primary {
  padding: 0.5rem 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  align-self: flex-end;
}

.btn-primary:hover {
  background: #5a67d8;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-primary:active {
  transform: translateY(0);
}

.http-pagination {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  flex-wrap: wrap;
}

.http-pagination .grid-pagination-summary {
  color: #666;
  font-size: 14px;
}

.grid-pagination-page {
  display: flex;
  gap: 4px;
}

.grid-pagination-page-number {
  border: 1px solid var(--grid-button-border, #d9d9d9);
  background: var(--grid-button-bg, #fff);
  color: var(--grid-button-color, #333);
  padding: 4px 10px;
  cursor: pointer;
  font-size: 14px;
  border-radius: 4px;
}

.grid-pagination-page-number:hover:not(.grid-pagination-active) {
  background: var(--grid-button-hover-bg, #f5f5f5);
}

.grid-pagination-active {
  background: var(--grid-button-active-bg, #1890ff) !important;
  color: var(--grid-button-active-color, #fff) !important;
  border-color: var(--grid-button-active-bg, #1890ff) !important;
}
</style>

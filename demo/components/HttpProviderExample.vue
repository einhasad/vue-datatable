<template>
  <div class="demo-controls">
    <div class="demo-control-group">
      <label for="search">Search Repositories:</label>
      <input
        id="search"
        v-model="searchQuery"
        type="text"
        placeholder="e.g., vue datatable"
        class="demo-input grid-search-input"
        @keyup.enter="handleSearch"
      />
    </div>
    <div class="demo-control-group">
      <label for="sort">Sort By:</label>
      <select id="sort" v-model="sortBy" @change="handleSearch" class="demo-select">
        <option value="stars">Stars</option>
        <option value="forks">Forks</option>
        <option value="updated">Recently Updated</option>
        <option value="help-wanted-issues">Help Wanted</option>
      </select>
    </div>
    <div class="demo-control-group" style="justify-content: flex-end;">
      <button @click="handleSearch" class="ds-btn ds-btn--outline ds-btn--sm" style="align-self: flex-end;">Search</button>
    </div>
  </div>

  <Grid
    ref="gridRef"
    :data-provider="gridProvider"
    :columns="githubColumns"
  />
  <div v-if="totalCount > 0" class="demo-http-pagination">
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
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Grid, ArrayDataProvider, type Column } from '@einhasad-vue/datatable-vue'
import { generateMockRepositories } from '../../examples/src/mocks/data'
import { processSearchRequest } from '../../examples/src/mocks/search'

const allMockRepos = generateMockRepositories()
const pageSize = 20

const searchQuery = ref('vue table')
const sortBy = ref('stars')
const totalCount = ref(0)
const currentPage = ref(1)
const gridRef = ref<any>(null)

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
  if (gridRef.value) {
    gridRef.value.items = gridProvider.getCurrentItems()
  }
}

async function handleSearch() {
  const filtered = getFilteredItems()
  gridProvider.setAllItems(filtered)
  currentPage.value = 1
  gridProvider.setOffsetPagination({ page: 1, pageSize })
  totalCount.value = filtered.length
  if (gridRef.value) {
    gridRef.value.items = gridProvider.getCurrentItems()
  }
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

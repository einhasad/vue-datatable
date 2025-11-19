<template>
  <section id="http-provider" class="section">
    <div>
      <h2>HTTP Provider Example</h2>
      <p>
        This example demonstrates <strong>HttpDataProvider</strong> with a mock REST API.
        Search for repositories, sort by stars/forks/updated, and navigate pages - all state synced with URL!
      </p>

      <div class="example-section">
        <h3>Search & Filters</h3>
        <div class="controls">
          <div class="control-group">
            <label for="search">Search Repositories:</label>
            <input
              id="search"
              v-model="githubSearchQuery"
              type="text"
              placeholder="e.g., vue datatable"
              class="search-input"
              @keyup.enter="handleGithubSearch"
            />
            <button @click="handleGithubSearch" class="btn btn-primary">Search</button>
          </div>

          <div class="control-group">
            <label for="sort">Sort By:</label>
            <select id="sort" v-model="githubSortBy" @change="handleGithubSearch" class="sort-select">
              <option value="stars">⭐ Stars</option>
              <option value="forks">🔱 Forks</option>
              <option value="updated">🕐 Recently Updated</option>
              <option value="help-wanted-issues">🙋 Help Wanted</option>
            </select>
          </div>

          <div class="control-group" v-if="githubTotalCount > 0">
            <span>Results: {{ githubTotalCount.toLocaleString() }} repositories</span>
          </div>
        </div>
      </div>

      <div class="example-section">
        <h3>Results</h3>
        <Grid
          ref="githubGridRef"
          :data-provider="githubProvider"
          :columns="githubColumns"
        />
      </div>

      <div class="example-section">
        <h3>Code</h3>
        <pre class="code-block"><code>// Custom adapter for mock API response format
class GitHubSearchAdapter {
  private currentPage = 1

  setCurrentPage(page: number) {
    this.currentPage = page
  }

  extractItems(response: any): any[] {
    return response.items || []
  }

  extractPagination(response: any) {
    const totalCount = response.total_count || 0
    return {
      currentPage: this.currentPage,
      perPage: 10,
      pageCount: Math.min(Math.ceil(totalCount / 10), 100),
      totalCount: Math.min(totalCount, 1000)
    }
  }

  isSuccess(response: any): boolean {
    return !response.message
  }

  getErrorMessage(response: any): string {
    return response.message || 'API request failed'
  }
}

const adapter = new GitHubSearchAdapter()

async function githubHttpClient(fullUrl: string): Promise&lt;any&gt; {
  const urlObj = new URL(fullUrl)
  const q = urlObj.searchParams.get('gh-q') || 'vue table'
  const sort = urlObj.searchParams.get('gh-sort') || 'stars'
  const page = urlObj.searchParams.get('page') || '1'

  adapter.setCurrentPage(parseInt(page))

  const params = new URLSearchParams({
    q, sort, order: 'desc', per_page: '10', page
  })

  const response = await fetch(`/api/github/search/repositories?\${params}`)
  return response.json()
}

const provider = new HttpDataProvider({
  url: '/api/github/search/repositories',
  pagination: true,
  paginationMode: 'page',
  pageSize: 10,
  responseAdapter: adapter,
  httpClient: githubHttpClient,
  stateProvider: new QueryParamsStateProvider({
    router,
    prefix: 'gh'
  })
})</code></pre>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Grid, HttpDataProvider, QueryParamsStateProvider, type Column } from '@grid-vue/grid'
import '@grid-vue/grid/style.css'

const router = useRouter()
const route = useRoute()

// Custom adapter for GitHub API response format
class GitHubSearchAdapter {
  private currentPage = 1

  setCurrentPage(page: number) {
    this.currentPage = page
  }

  extractItems(response: any): any[] {
    return response.items || []
  }

  extractPagination(response: any) {
    const totalCount = response.total_count || 0
    const perPage = 10
    return {
      currentPage: this.currentPage,
      perPage: perPage,
      pageCount: Math.min(Math.ceil(totalCount / perPage), 100),
      totalCount: Math.min(totalCount, 1000)
    }
  }

  isSuccess(response: any): boolean {
    return !response.message
  }

  getErrorMessage(response: any): string {
    return response.message || 'API request failed'
  }
}

const githubAdapter = new GitHubSearchAdapter()

// Custom HTTP client to integrate with mock API
async function githubHttpClient(fullUrl: string): Promise<any> {
  const urlObj = new URL(fullUrl)
  const q = urlObj.searchParams.get('gh-q') || 'vue table'
  const sort = urlObj.searchParams.get('gh-sort') || 'stars'
  const page = urlObj.searchParams.get('page') || '1'

  githubAdapter.setCurrentPage(parseInt(page))

  const params = new URLSearchParams({
    q,
    sort,
    order: 'desc',
    per_page: '10',
    page
  })

  const url = `/api/github/search/repositories?${params.toString()}`

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('[HTTP Client] Fetch error:', error)
    throw error
  }
}

// Initialize from URL params or use defaults
const githubSearchQuery = ref((route.query['gh-q'] as string) || 'vue table')
const githubSortBy = ref((route.query['gh-sort'] as string) || 'stars')
const githubTotalCount = ref(0)
const githubGridRef = ref<any>(null)

const githubProvider = new HttpDataProvider({
  url: '/api/github/search/repositories',
  pagination: true,
  paginationMode: 'page',
  pageSize: 10,
  responseAdapter: githubAdapter,
  httpClient: githubHttpClient,
  stateProvider: new QueryParamsStateProvider({
    router,
    prefix: 'gh'
  })
})

const githubColumns: Column[] = [
  {
    key: 'full_name',
    label: 'Repository',
    component: (row) => ({
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
    value: (row) => {
      const desc = row.description || 'No description'
      return desc.length > 100 ? desc.substring(0, 100) + '...' : desc
    }
  },
  {
    key: 'stargazers_count',
    label: '⭐ Stars',
    value: (row) => row.stargazers_count.toLocaleString()
  },
  {
    key: 'forks_count',
    label: '🔱 Forks',
    value: (row) => row.forks_count.toLocaleString()
  },
  {
    key: 'language',
    label: 'Language',
    value: (row) => row.language || 'Unknown'
  },
  {
    key: 'updated_at',
    label: 'Updated',
    value: (row) => new Date(row.updated_at).toLocaleDateString()
  }
]

async function handleGithubSearch() {
  await router.push({
    query: {
      ...route.query,
      'gh-q': githubSearchQuery.value,
      'gh-sort': githubSortBy.value,
      page: '1'
    }
  })

  if (githubGridRef.value) {
    await githubGridRef.value.refresh()
    const paginationData = githubGridRef.value.pagination
    if (paginationData) {
      githubTotalCount.value = (paginationData as any).totalCount || 0
    }
  }
}

// Update total count when grid data loads
watch(() => githubGridRef.value?.pagination, (paginationData) => {
  if (paginationData) {
    githubTotalCount.value = (paginationData as any).totalCount || 0
  }
}, { deep: true })

// Sync local state with URL params
watch(() => route.query, () => {
  const urlQuery = route.query['gh-q'] as string
  const urlSort = route.query['gh-sort'] as string

  if (urlQuery && urlQuery !== githubSearchQuery.value) {
    githubSearchQuery.value = urlQuery
  }
  if (urlSort && urlSort !== githubSortBy.value) {
    githubSortBy.value = urlSort
  }
}, { immediate: true })
</script>

<style scoped>
.controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.control-group label {
  font-weight: 600;
  min-width: 150px;
}

.search-input {
  flex: 1;
  min-width: 200px;
  padding: 0.5rem;
  border: 1px solid var(--grid-border-color, #e2e8f0);
  border-radius: 4px;
  font-size: 0.95rem;
}

.sort-select {
  padding: 0.5rem;
  border: 1px solid var(--grid-border-color, #e2e8f0);
  border-radius: 4px;
  font-size: 0.95rem;
  background-color: white;
}

.btn-primary {
  background-color: #667eea;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background-color: #5568d3;
}
</style>

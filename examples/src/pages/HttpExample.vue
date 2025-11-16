<template>
  <div>
    <h2>HTTP Data Provider with URL State</h2>

    <div class="example-description">
      <p>
        This example demonstrates HttpDataProvider with search, sorting, and pagination using the GitHub API.
        All filters are synced with the URL, so you can bookmark or share links with specific search results.
      </p>
      <p>
        <strong>Try it:</strong> Search for repositories, change sort order, or navigate pages - notice how the URL updates!
      </p>
    </div>

    <div class="example-section">
      <h3>Search & Filters</h3>
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
          <select id="sort" v-model="sortBy" @change="handleSortChange" class="sort-select">
            <option value="stars">⭐ Stars</option>
            <option value="forks">🔱 Forks</option>
            <option value="updated">🕐 Recently Updated</option>
            <option value="help-wanted-issues">🙋 Help Wanted</option>
          </select>
        </div>

        <div class="control-group" v-if="totalCount > 0">
          <label>Results: {{ totalCount.toLocaleString() }} repositories</label>
        </div>
      </div>
    </div>

    <div class="example-section">
      <h3>Results</h3>
      <Grid
        ref="gridRef"
        :data-provider="provider"
        :columns="columns"
        :auto-load="false"
      />
    </div>

    <div class="example-section">
      <h3>Code</h3>
      <pre class="code-block" v-pre><code>&lt;template&gt;
  &lt;div class="controls"&gt;
    &lt;input
      v-model="searchQuery"
      type="text"
      placeholder="Search repositories..."
      @keyup.enter="handleSearch"
    /&gt;
    &lt;select v-model="sortBy" @change="handleSortChange"&gt;
      &lt;option value="stars"&gt;Stars&lt;/option&gt;
      &lt;option value="forks"&gt;Forks&lt;/option&gt;
    &lt;/select&gt;
    &lt;button @click="handleSearch"&gt;Search&lt;/button&gt;
  &lt;/div&gt;
  &lt;Grid :data-provider="provider" :columns="columns" :auto-load="false" /&gt;
&lt;/template&gt;

&lt;script setup lang="ts"&gt;
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Grid, HttpDataProvider, type Column } from '@grid-vue/grid'

const router = useRouter()
const route = useRoute()

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
}

const searchQuery = ref('vue table')
const sortBy = ref('stars')
const adapter = new GitHubSearchAdapter()

async function githubHttpClient(fullUrl: string): Promise&lt;any&gt; {
  const urlObj = new URL(fullUrl)
  const q = urlObj.searchParams.get('search-q') || searchQuery.value
  const sort = urlObj.searchParams.get('search-sort')?.replace('-', '') || sortBy.value
  const page = urlObj.searchParams.get('page') || '1'

  adapter.setCurrentPage(parseInt(page))

  const params = new URLSearchParams({
    q, sort, order: 'desc', per_page: '10', page
  })

  const response = await fetch(\`https://api.github.com/search/repositories?\${params}\`, {
    headers: { 'Accept': 'application/vnd.github.v3+json' }
  })
  return response.json()
}

const provider = new HttpDataProvider({
  url: 'https://api.github.com/search/repositories',
  pagination: true,
  paginationMode: 'page',
  pageSize: 10,
  responseAdapter: adapter,
  httpClient: githubHttpClient
}, router)

function handleSearch() {
  router.push({
    query: {
      ...route.query,
      'search-q': searchQuery.value,
      'search-sort': sortBy.value,
      page: '1'
    }
  })
  provider.refresh()
}

onMounted(() =&gt; {
  searchQuery.value = (route.query['search-q'] as string) || 'vue table'
  sortBy.value = (route.query['search-sort'] as string) || 'stars'
  handleSearch()
})
&lt;/script&gt;</code></pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Grid, HttpDataProvider, type Column } from '@grid-vue/grid'

const router = useRouter()
const route = useRoute()

// Custom response adapter for GitHub Search API
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
    const paginationData = {
      currentPage: this.currentPage,  // ✅ Changed from 'page'
      perPage,                         // ✅ Changed from 'pageSize'
      pageCount: Math.min(Math.ceil(totalCount / perPage), 100),
      totalCount: Math.min(totalCount, 1000)
    }
    console.log('📊 extractPagination:', paginationData)
    return paginationData
  }

  isSuccess(response: any): boolean {
    return !response.message
  }

  getErrorMessage(response: any): string {
    return response.message || 'API request failed'
  }
}

const searchQuery = ref('')
const sortBy = ref('stars')
const totalCount = ref(0)
const gridRef = ref<any>(null)

// Create adapter instance
const adapter = new GitHubSearchAdapter()

// Custom HTTP client for GitHub API that extracts params from URL
async function githubHttpClient(fullUrl: string): Promise<any> {
  const urlObj = new URL(fullUrl)

  // Extract parameters (with 'search-' prefix from searchPrefix config)
  const q = urlObj.searchParams.get('search-q') || searchQuery.value || 'vue table'
  const sort = urlObj.searchParams.get('search-sort')?.replace('-', '') || sortBy.value
  const page = urlObj.searchParams.get('page') || '1'

  // Update adapter's current page
  adapter.setCurrentPage(parseInt(page))

  // Build GitHub API URL
  const params = new URLSearchParams({
    q: q,
    sort: sort,
    order: 'desc',
    per_page: '10',
    page: page
  })

  const url = `https://api.github.com/search/repositories?${params.toString()}`

  const response = await fetch(url, {
    headers: {
      'Accept': 'application/vnd.github.v3+json'
    }
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

// Create HTTP data provider with router integration
const provider = new HttpDataProvider({
  url: 'https://api.github.com/search/repositories',
  pagination: true,
  paginationMode: 'page',
  pageSize: 10,
  responseAdapter: adapter,
  httpClient: githubHttpClient,
  searchPrefix: 'search' // URL params will be prefixed with 'search-'
}, router)

const columns: Column[] = [
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

async function handleSearch() {
  // Update URL with new search params
  await router.push({
    query: {
      ...route.query,
      'search-q': searchQuery.value,
      'search-sort': sortBy.value,
      page: '1'
    }
  })

  // Refresh grid to load new data
  if (gridRef.value) {
    await gridRef.value.refresh()
    const paginationData = gridRef.value.pagination
    if (paginationData) {
      totalCount.value = (paginationData as any).totalCount || 0
    }
  }
}

function handleSortChange() {
  handleSearch()
}

// Initialize search query and sort from URL on mount
onMounted(() => {
  // Read initial values from URL or use defaults
  searchQuery.value = (route.query['search-q'] as string) || 'vue table'
  sortBy.value = (route.query['search-sort'] as string) || 'stars'

  // Perform initial search
  handleSearch()
})

// Watch for route changes (browser back/forward)
watch(() => route.query, () => {
  const urlQuery = route.query['search-q'] as string
  const urlSort = route.query['search-sort'] as string

  if (urlQuery) searchQuery.value = urlQuery
  if (urlSort) sortBy.value = urlSort
})
</script>

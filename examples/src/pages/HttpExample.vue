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
      <h3>Key Features</h3>
      <ul class="feature-list">
        <li><strong>URL State Management:</strong> Search query, sort, and page number are synced with the URL</li>
        <li><strong>Bookmarkable:</strong> Copy the URL to save your current search and filters</li>
        <li><strong>Browser Navigation:</strong> Back/forward buttons work with pagination</li>
        <li><strong>Page-based Pagination:</strong> Navigate through numbered pages of results</li>
        <li><strong>Custom Response Adapter:</strong> Adapts GitHub's API response to the grid format</li>
      </ul>
    </div>

    <div class="example-section">
      <h3>Code Example</h3>
      <pre class="code-block" v-pre><code>&lt;script setup lang="ts"&gt;
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Grid, HttpDataProvider, type Column } from '@grid-vue/grid'

const router = useRouter()

// Custom adapter for GitHub Search API
class GitHubSearchAdapter {
  extractItems(response: any): any[] {
    return response.items || []
  }

  extractPagination(response: any) {
    const totalCount = response.total_count || 0
    const perPage = 10
    return {
      currentPage: 1,
      perPage,
      pageCount: Math.min(Math.ceil(totalCount / perPage), 100),
      totalCount: Math.min(totalCount, 1000) // GitHub limits to 1000
    }
  }
}

// Custom HTTP client for GitHub API
async function githubHttpClient(fullUrl: string): Promise&lt;any&gt; {
  const urlObj = new URL(fullUrl)
  const q = urlObj.searchParams.get('search-q') || 'vue'
  const sort = urlObj.searchParams.get('search-sort')?.replace('-', '') || 'stars'
  const page = urlObj.searchParams.get('page') || '1'

  const params = new URLSearchParams({
    q: q,
    sort: sort,
    order: 'desc',
    per_page: '10',
    page: page
  })

  const url = \`https://api.github.com/search/repositories?\${params}\`
  const response = await fetch(url, {
    headers: { 'Accept': 'application/vnd.github.v3+json' }
  })
  return response.json()
}

const provider = new HttpDataProvider({
  url: 'https://api.github.com/search/repositories',
  pagination: true,
  paginationMode: 'page',
  pageSize: 10,
  responseAdapter: new GitHubSearchAdapter(),
  httpClient: githubHttpClient,
  searchPrefix: 'search' // Prefix for URL params
}, router)

// Load data on mount (reads from URL if available)
onMounted(() =&gt; {
  provider.load()
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
  console.log('🔍 handleSearch called')
  console.log('  searchQuery:', searchQuery.value)
  console.log('  sortBy:', sortBy.value)

  // Set query parameters - the provider will update the URL
  provider.setQueryParam('q', searchQuery.value)
  provider.setQueryParam('sort', sortBy.value)

  // Use the Grid's refresh method to properly update pagination
  if (gridRef.value) {
    console.log('  gridRef exists, calling refresh...')
    await gridRef.value.refresh()
    const paginationData = gridRef.value.pagination
    console.log('  paginationData:', paginationData)
    console.log('  provider.config.pagination:', provider.config.pagination)
    console.log('  provider.config.paginationMode:', provider.config.paginationMode)
    if (paginationData) {
      totalCount.value = (paginationData as any).totalCount || 0
      console.log('  totalCount set to:', totalCount.value)
    }
  } else {
    console.log('  ❌ gridRef is null!')
  }
}

function handleSortChange() {
  handleSearch()
}

// Initialize search query and sort from URL on mount
onMounted(() => {
  console.log('🚀 HttpExample mounted')
  console.log('  gridRef.value:', gridRef.value)

  // Read initial values from URL or use defaults
  const urlQuery = provider.getRawQueryParam('q')
  const urlSort = provider.getRawQueryParam('sort')

  searchQuery.value = urlQuery || 'vue table'
  sortBy.value = urlSort || 'stars'

  console.log('  Initial search params:', { q: searchQuery.value, sort: sortBy.value })

  // Perform initial search
  handleSearch()
})

// Watch for route changes (browser back/forward)
watch(() => route.query, () => {
  const urlQuery = provider.getRawQueryParam('q')
  const urlSort = provider.getRawQueryParam('sort')

  if (urlQuery) searchQuery.value = urlQuery
  if (urlSort) sortBy.value = urlSort
})
</script>

<style scoped>
.controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background: #f7fafc;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.control-group label {
  font-weight: 600;
  color: #4a5568;
  min-width: 140px;
}

.search-input {
  flex: 1;
  min-width: 200px;
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.sort-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background: white;
  cursor: pointer;
}

.sort-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.btn-primary {
  padding: 0.5rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: #5a67d8;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-primary:active {
  transform: translateY(0);
}

.feature-list {
  line-height: 1.8;
}

.feature-list li {
  margin-bottom: 0.75rem;
}

.feature-list strong {
  color: #667eea;
}
</style>

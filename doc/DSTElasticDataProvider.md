# DSTElasticDataProvider Documentation

## Overview

`DSTElasticDataProvider` is a DataProvider implementation for Elasticsearch DSL queries. It supports cursor-based pagination using `search_after`, advanced searching, sorting, and aggregations.

**Key Features:**
- ✅ Cursor-based pagination (infinite scroll friendly)
- ✅ Advanced Elasticsearch DSL queries
- ✅ Sorting (single and multi-field)
- ✅ Full-text search
- ✅ Aggregations (terms, date histogram, etc.)
- ✅ Custom HTTP client support
- ✅ URL state management
- ✅ TypeScript support

---

## Table of Contents

1. [Basic Usage](#basic-usage)
2. [Cursor Pagination](#cursor-pagination)
3. [Searching](#searching)
4. [Sorting](#sorting)
5. [Aggregations](#aggregations)
6. [Advanced Queries](#advanced-queries)
7. [Integration with NewGrid](#integration-with-newgrid)
8. [API Reference](#api-reference)

---

## Basic Usage

### Example 1: Simple Elasticsearch Grid

```typescript
import { DSTElasticDataProvider } from '@/lib/providers/DSTElasticDataProvider'
import NewGrid from '@src/spa/components/NewGrid.vue'

const provider = new DSTElasticDataProvider({
  url: '/api/elasticsearch/logs',
  pagination: true,
  paginationMode: 'cursor',
  pageSize: 50,
  defaultSort: [
    { timestamp: 'desc' },
    { _id: 'desc' }
  ]
})

const columns = [
  {
    key: 'timestamp',
    label: 'Time',
    value: (log) => new Date(log.timestamp).toLocaleString()
  },
  {
    key: 'message',
    label: 'Message',
    value: (log) => log.message
  },
  {
    key: 'level',
    label: 'Level',
    value: (log) => log.level
  }
]
```

```vue
<template>
  <NewGrid
    :data-provider="provider"
    :columns="columns"
  />
</template>
```

---

## Cursor Pagination

Cursor pagination uses Elasticsearch's `search_after` for efficient deep pagination.

### How It Works

1. **First Load**: Fetches initial page with sort values
2. **Load More**: Uses last item's sort values as `search_after` cursor
3. **Efficient**: No offset-based pagination (better performance)
4. **Infinite Scroll**: Perfect for "Load More" UIs

### Example: Infinite Scroll with Load More

```vue
<template>
  <div>
    <NewGrid
      ref="gridRef"
      :data-provider="provider"
      :columns="columns"
    />

    <a-button
      v-if="provider.hasMore()"
      @click="loadMore"
      :loading="provider.isLoading()"
    >
      Load More
    </a-button>

    <div v-if="!provider.hasMore()">
      No more results (Total: {{ provider.getTotalHits() }})
    </div>
  </div>
</template>

<script setup lang="ts">
import { DSTElasticDataProvider } from '@/lib/providers/DSTElasticDataProvider'
import NewGrid from '@src/spa/components/NewGrid.vue'
import { ref } from 'vue'

const gridRef = ref()

const provider = new DSTElasticDataProvider({
  url: '/api/elasticsearch/search',
  pageSize: 20,
  defaultSort: [{ timestamp: 'desc' }, { _id: 'desc' }]
})

async function loadMore() {
  await provider.loadMore()
}
</script>
```

---

## Searching

### Example 1: Simple Match Query

```typescript
import { DSTElasticDataProvider } from '@/lib/providers/DSTElasticDataProvider'

const provider = new DSTElasticDataProvider({
  url: '/api/elasticsearch/products',
  pageSize: 20,
  defaultQuery: DSTElasticDataProvider.buildMatchQuery('name', 'laptop')
})
```

**Elasticsearch DSL:**
```json
{
  "query": {
    "match": {
      "name": "laptop"
    }
  }
}
```

### Example 2: Multi-Field Search

```typescript
const provider = new DSTElasticDataProvider({
  url: '/api/elasticsearch/products',
  pageSize: 20,
  defaultQuery: DSTElasticDataProvider.buildMultiMatchQuery(
    ['name', 'description', 'category'],
    'gaming laptop'
  )
})
```

**Elasticsearch DSL:**
```json
{
  "query": {
    "multi_match": {
      "query": "gaming laptop",
      "fields": ["name", "description", "category"]
    }
  }
}
```

### Example 3: Dynamic Search with Filter

```vue
<template>
  <div>
    <a-input
      v-model:value="searchText"
      placeholder="Search..."
      @change="handleSearch"
    />

    <NewGrid
      :data-provider="provider"
      :columns="columns"
    />
  </div>
</template>

<script setup lang="ts">
import { DSTElasticDataProvider } from '@/lib/providers/DSTElasticDataProvider'
import { ref } from 'vue'

const searchText = ref('')

const provider = new DSTElasticDataProvider({
  url: '/api/elasticsearch/users',
  pageSize: 20
})

function handleSearch() {
  if (searchText.value) {
    const query = DSTElasticDataProvider.buildMultiMatchQuery(
      ['name', 'email', 'phone'],
      searchText.value
    )
    provider.setElasticQuery(query)
  } else {
    provider.setElasticQuery({ match_all: {} })
  }

  provider.refresh()
}
</script>
```

---

## Sorting

### Example 1: Default Sort

```typescript
const provider = new DSTElasticDataProvider({
  url: '/api/elasticsearch/orders',
  pageSize: 20,
  defaultSort: [
    { created_at: 'desc' },
    { order_id: 'desc' }
  ]
})
```

**Important:** Always include a unique field (like `_id`) as a tiebreaker for consistent cursor pagination.

### Example 2: Dynamic Sorting

```vue
<template>
  <div>
    <a-select v-model:value="sortBy" @change="handleSort">
      <a-select-option value="price_asc">Price: Low to High</a-select-option>
      <a-select-option value="price_desc">Price: High to Low</a-select-option>
      <a-select-option value="created_desc">Newest First</a-select-option>
      <a-select-option value="created_asc">Oldest First</a-select-option>
    </a-select>

    <NewGrid
      :data-provider="provider"
      :columns="columns"
    />
  </div>
</template>

<script setup lang="ts">
import { DSTElasticDataProvider } from '@/lib/providers/DSTElasticDataProvider'
import { ref } from 'vue'

const sortBy = ref('created_desc')

const provider = new DSTElasticDataProvider({
  url: '/api/elasticsearch/products',
  pageSize: 20
})

function handleSort() {
  const [field, order] = sortBy.value.split('_')
  provider.setSort(field, order as 'asc' | 'desc')
  provider.refresh()
}
</script>
```

---

## Aggregations

### Example 1: Terms Aggregation (Facets)

```vue
<template>
  <div>
    <div class="facets">
      <h3>Categories</h3>
      <a-checkbox-group v-model:value="selectedCategories" @change="handleFilterChange">
        <div v-for="bucket in categoryBuckets" :key="bucket.key">
          <a-checkbox :value="bucket.key">
            {{ bucket.key }} ({{ bucket.doc_count }})
          </a-checkbox>
        </div>
      </a-checkbox-group>
    </div>

    <NewGrid
      :data-provider="provider"
      :columns="columns"
    />
  </div>
</template>

<script setup lang="ts">
import { DSTElasticDataProvider } from '@/lib/providers/DSTElasticDataProvider'
import { ref, computed } from 'vue'

const selectedCategories = ref([])

const provider = new DSTElasticDataProvider({
  url: '/api/elasticsearch/products',
  pageSize: 20,
  aggregations: {
    categories: DSTElasticDataProvider.buildTermsAggregation('category.keyword', 50),
    price_stats: {
      stats: { field: 'price' }
    }
  }
})

const categoryBuckets = computed(() => {
  const aggs = provider.getAggregations()
  return aggs?.categories?.buckets || []
})

function handleFilterChange() {
  if (selectedCategories.value.length > 0) {
    const query = DSTElasticDataProvider.buildBoolQuery({
      must: [
        {
          terms: {
            'category.keyword': selectedCategories.value
          }
        }
      ]
    })
    provider.setElasticQuery(query)
  } else {
    provider.setElasticQuery({ match_all: {} })
  }

  provider.refresh()
}
</script>
```

### Example 2: Date Histogram Aggregation

```typescript
const provider = new DSTElasticDataProvider({
  url: '/api/elasticsearch/orders',
  pageSize: 20,
  aggregations: {
    orders_over_time: DSTElasticDataProvider.buildDateHistogramAggregation(
      'created_at',
      'day'
    )
  }
})

// Access aggregation results
const aggs = provider.getAggregations()
const buckets = aggs?.orders_over_time?.buckets || []
```

---

## Advanced Queries

### Example 1: Bool Query with Multiple Conditions

```typescript
const query = DSTElasticDataProvider.buildBoolQuery({
  must: [
    DSTElasticDataProvider.buildMatchQuery('status', 'active'),
    DSTElasticDataProvider.buildRangeQuery('price', { gte: 100, lte: 500 })
  ],
  should: [
    DSTElasticDataProvider.buildTermQuery('category', 'electronics'),
    DSTElasticDataProvider.buildTermQuery('category', 'computers')
  ],
  must_not: [
    DSTElasticDataProvider.buildTermQuery('out_of_stock', true)
  ]
})

const provider = new DSTElasticDataProvider({
  url: '/api/elasticsearch/products',
  pageSize: 20,
  defaultQuery: query
})
```

**Elasticsearch DSL:**
```json
{
  "query": {
    "bool": {
      "must": [
        { "match": { "status": "active" } },
        { "range": { "price": { "gte": 100, "lte": 500 } } }
      ],
      "should": [
        { "term": { "category": "electronics" } },
        { "term": { "category": "computers" } }
      ],
      "must_not": [
        { "term": { "out_of_stock": true } }
      ]
    }
  }
}
```

### Example 2: Range Query (Date Range)

```typescript
const query = DSTElasticDataProvider.buildBoolQuery({
  must: [
    DSTElasticDataProvider.buildRangeQuery('created_at', {
      gte: '2024-01-01',
      lte: '2024-12-31'
    })
  ]
})

const provider = new DSTElasticDataProvider({
  url: '/api/elasticsearch/logs',
  pageSize: 100,
  defaultQuery: query,
  defaultSort: [{ created_at: 'desc' }]
})
```

### Example 3: Complex Filtering UI

```vue
<template>
  <div>
    <!-- Filters -->
    <a-row :gutter="16">
      <a-col :span="6">
        <a-input
          v-model:value="filters.search"
          placeholder="Search..."
          @change="applyFilters"
        />
      </a-col>

      <a-col :span="6">
        <a-select
          v-model:value="filters.status"
          placeholder="Status"
          @change="applyFilters"
        >
          <a-select-option value="">All</a-select-option>
          <a-select-option value="pending">Pending</a-select-option>
          <a-select-option value="completed">Completed</a-select-option>
          <a-select-option value="cancelled">Cancelled</a-select-option>
        </a-select>
      </a-col>

      <a-col :span="6">
        <a-range-picker
          v-model:value="filters.dateRange"
          @change="applyFilters"
        />
      </a-col>

      <a-col :span="6">
        <a-input-number
          v-model:value="filters.minAmount"
          placeholder="Min Amount"
          @change="applyFilters"
        />
        <a-input-number
          v-model:value="filters.maxAmount"
          placeholder="Max Amount"
          @change="applyFilters"
        />
      </a-col>
    </a-row>

    <!-- Grid -->
    <NewGrid
      :data-provider="provider"
      :columns="columns"
    />
  </div>
</template>

<script setup lang="ts">
import { DSTElasticDataProvider } from '@/lib/providers/DSTElasticDataProvider'
import { reactive } from 'vue'

const filters = reactive({
  search: '',
  status: '',
  dateRange: null,
  minAmount: null,
  maxAmount: null
})

const provider = new DSTElasticDataProvider({
  url: '/api/elasticsearch/transactions',
  pageSize: 50
})

function applyFilters() {
  const mustClauses: any[] = []

  // Text search
  if (filters.search) {
    mustClauses.push(
      DSTElasticDataProvider.buildMultiMatchQuery(
        ['description', 'customer_name', 'reference'],
        filters.search
      )
    )
  }

  // Status filter
  if (filters.status) {
    mustClauses.push(
      DSTElasticDataProvider.buildTermQuery('status', filters.status)
    )
  }

  // Date range filter
  if (filters.dateRange && filters.dateRange.length === 2) {
    mustClauses.push(
      DSTElasticDataProvider.buildRangeQuery('created_at', {
        gte: filters.dateRange[0].format('YYYY-MM-DD'),
        lte: filters.dateRange[1].format('YYYY-MM-DD')
      })
    )
  }

  // Amount range filter
  if (filters.minAmount || filters.maxAmount) {
    const rangeOptions: any = {}
    if (filters.minAmount) rangeOptions.gte = filters.minAmount
    if (filters.maxAmount) rangeOptions.lte = filters.maxAmount

    mustClauses.push(
      DSTElasticDataProvider.buildRangeQuery('amount', rangeOptions)
    )
  }

  // Build final query
  const query = mustClauses.length > 0
    ? DSTElasticDataProvider.buildBoolQuery({ must: mustClauses })
    : { match_all: {} }

  provider.setElasticQuery(query)
  provider.refresh()
}
</script>
```

---

## Integration with NewGrid

### Example: Full-Featured Elasticsearch Grid

```vue
<template>
  <div class="elasticsearch-grid">
    <!-- Search Bar -->
    <a-input-search
      v-model:value="searchText"
      placeholder="Search across all fields..."
      @search="handleSearch"
      style="width: 400px; margin-bottom: 16px"
    />

    <!-- Facets / Filters -->
    <a-row :gutter="16" style="margin-bottom: 16px">
      <a-col :span="8">
        <a-card title="Categories" size="small">
          <a-checkbox-group v-model:value="selectedCategories" @change="applyFilters">
            <div v-for="bucket in categoryFacets" :key="bucket.key">
              <a-checkbox :value="bucket.key">
                {{ bucket.key }} ({{ bucket.doc_count }})
              </a-checkbox>
            </div>
          </a-checkbox-group>
        </a-card>
      </a-col>

      <a-col :span="8">
        <a-card title="Price Range" size="small">
          <a-slider
            v-model:value="priceRange"
            range
            :min="0"
            :max="1000"
            @afterChange="applyFilters"
          />
          <div>${{ priceRange[0] }} - ${{ priceRange[1] }}</div>
        </a-card>
      </a-col>

      <a-col :span="8">
        <a-card title="Date Range" size="small">
          <a-range-picker v-model:value="dateRange" @change="applyFilters" />
        </a-card>
      </a-col>
    </a-row>

    <!-- Grid -->
    <NewGrid
      ref="gridRef"
      :data-provider="provider"
      :columns="columns"
    />

    <!-- Load More -->
    <div style="text-align: center; margin-top: 16px">
      <a-button
        v-if="provider.hasMore()"
        @click="loadMore"
        :loading="provider.isLoading()"
        size="large"
      >
        Load More
      </a-button>
      <div v-else-if="provider.getTotalHits() > 0">
        Showing all {{ provider.getTotalHits() }} results
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DSTElasticDataProvider } from '@/lib/providers/DSTElasticDataProvider'
import NewGrid from '@src/spa/components/NewGrid.vue'
import { ref, computed } from 'vue'

const searchText = ref('')
const selectedCategories = ref([])
const priceRange = ref([0, 1000])
const dateRange = ref(null)
const gridRef = ref()

const provider = new DSTElasticDataProvider({
  url: '/api/elasticsearch/products',
  pageSize: 20,
  defaultSort: [
    { created_at: 'desc' },
    { _id: 'desc' }
  ],
  aggregations: {
    categories: DSTElasticDataProvider.buildTermsAggregation('category.keyword', 50),
    price_stats: {
      stats: { field: 'price' }
    }
  }
})

const columns = [
  {
    key: 'name',
    label: 'Product',
    value: (item) => item.name
  },
  {
    key: 'category',
    label: 'Category',
    value: (item) => item.category
  },
  {
    key: 'price',
    label: 'Price',
    value: (item) => `$${item.price.toFixed(2)}`
  },
  {
    key: 'created_at',
    label: 'Created',
    value: (item) => new Date(item.created_at).toLocaleDateString()
  }
]

const categoryFacets = computed(() => {
  const aggs = provider.getAggregations()
  return aggs?.categories?.buckets || []
})

function handleSearch() {
  applyFilters()
}

function applyFilters() {
  const mustClauses: any[] = []

  // Text search
  if (searchText.value) {
    mustClauses.push(
      DSTElasticDataProvider.buildMultiMatchQuery(
        ['name', 'description', 'category'],
        searchText.value
      )
    )
  }

  // Category filter
  if (selectedCategories.value.length > 0) {
    mustClauses.push({
      terms: { 'category.keyword': selectedCategories.value }
    })
  }

  // Price range
  if (priceRange.value[0] > 0 || priceRange.value[1] < 1000) {
    mustClauses.push(
      DSTElasticDataProvider.buildRangeQuery('price', {
        gte: priceRange.value[0],
        lte: priceRange.value[1]
      })
    )
  }

  // Date range
  if (dateRange.value && dateRange.value.length === 2) {
    mustClauses.push(
      DSTElasticDataProvider.buildRangeQuery('created_at', {
        gte: dateRange.value[0].format('YYYY-MM-DD'),
        lte: dateRange.value[1].format('YYYY-MM-DD')
      })
    )
  }

  const query = mustClauses.length > 0
    ? DSTElasticDataProvider.buildBoolQuery({ must: mustClauses })
    : { match_all: {} }

  provider.setElasticQuery(query)
  provider.refresh()
}

async function loadMore() {
  await provider.loadMore()
}
</script>
```

---

## API Reference

### Constructor

```typescript
new DSTElasticDataProvider(config: DSTElasticDataProviderConfig, router?: any)
```

**Config Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `url` | `string` | **required** | Elasticsearch endpoint URL |
| `pagination` | `boolean` | `true` | Enable pagination |
| `paginationMode` | `'cursor'` | `'cursor'` | Always cursor mode |
| `pageSize` | `number` | `20` | Items per page |
| `httpClient` | `ElasticHttpClient` | `fetch` | Custom HTTP client |
| `defaultQuery` | `any` | `{ match_all: {} }` | Default Elasticsearch query |
| `defaultSort` | `any[]` | `[]` | Default sort array |
| `aggregations` | `Record<string, any>` | `undefined` | Aggregations config |
| `sourceFields` | `string[]` | `undefined` | Fields to return (`_source`) |
| `trackTotalHits` | `boolean` | `true` | Track total hit count |
| `searchPrefix` | `string` | `undefined` | URL query param prefix |

### Methods

#### Data Loading

```typescript
// Load initial data
await provider.load(options?: LoadOptions): Promise<LoadResult<T>>

// Load next page
await provider.loadMore(): Promise<LoadResult<T>>

// Refresh from beginning
await provider.refresh(): Promise<LoadResult<T>>
```

#### Query Management

```typescript
// Set Elasticsearch DSL query
provider.setElasticQuery(query: any): void

// Get current query
provider.getElasticQuery(): any
```

#### Sorting

```typescript
// Set sort
provider.setSort(field: string, order: 'asc' | 'desc'): void

// Get current sort
provider.getSort(): SortState | null
```

#### Aggregations

```typescript
// Set aggregations
provider.setAggregations(aggs: Record<string, any>): void

// Get aggregation results
provider.getAggregations(): Record<string, any> | undefined
```

#### State

```typescript
// Check if loading
provider.isLoading(): boolean

// Check if more data available
provider.hasMore(): boolean

// Get current items
provider.getCurrentItems(): T[]

// Get pagination data
provider.getCurrentPagination(): PaginationData | null

// Get total hits count
provider.getTotalHits(): number
```

### Static Helper Methods

```typescript
// Build match query
DSTElasticDataProvider.buildMatchQuery(field: string, value: string): any

// Build multi-match query
DSTElasticDataProvider.buildMultiMatchQuery(fields: string[], value: string): any

// Build bool query
DSTElasticDataProvider.buildBoolQuery(options: {
  must?: any[]
  should?: any[]
  must_not?: any[]
  filter?: any[]
}): any

// Build term query (exact match)
DSTElasticDataProvider.buildTermQuery(field: string, value: any): any

// Build range query
DSTElasticDataProvider.buildRangeQuery(
  field: string,
  options: { gte?: any; lte?: any; gt?: any; lt?: any }
): any

// Build terms aggregation
DSTElasticDataProvider.buildTermsAggregation(field: string, size?: number): any

// Build date histogram aggregation
DSTElasticDataProvider.buildDateHistogramAggregation(
  field: string,
  interval: string
): any
```

---

## Tips & Best Practices

1. **Always include a unique tiebreaker** in sort for consistent cursor pagination:
   ```typescript
   defaultSort: [{ timestamp: 'desc' }, { _id: 'desc' }]
   ```

2. **Use keyword fields for terms aggregations**:
   ```typescript
   buildTermsAggregation('category.keyword', 50)  // ✅ Correct
   buildTermsAggregation('category', 50)           // ❌ May not work
   ```

3. **Limit aggregation size** for performance:
   ```typescript
   buildTermsAggregation('tags', 10)  // Only top 10
   ```

4. **Use track_total_hits carefully** - it can be expensive:
   ```typescript
   trackTotalHits: true   // Exact count (slower)
   trackTotalHits: 10000  // Approximate above 10k (faster)
   ```

5. **Optimize page size** based on your data:
   - Large documents: 10-20 items
   - Small documents: 50-100 items

6. **Use source filtering** to reduce response size:
   ```typescript
   sourceFields: ['id', 'name', 'price']  // Only return these fields
   ```

---

## Troubleshooting

### Problem: Pagination not working

**Solution:** Ensure sort includes a unique tiebreaker:
```typescript
defaultSort: [{ myField: 'desc' }, { _id: 'desc' }]
```

### Problem: Aggregations not returning

**Solution:** Check if `aggregations` config is set and results are accessed correctly:
```typescript
const aggs = provider.getAggregations()
const buckets = aggs?.myAgg?.buckets || []
```

### Problem: Search not working

**Solution:** Use correct query builders and field names:
```typescript
// For text fields
DSTElasticDataProvider.buildMatchQuery('description', searchText)

// For keyword fields (exact match)
DSTElasticDataProvider.buildTermQuery('status.keyword', 'active')
```

---

## Complete Working Example

See the [Full-Featured Elasticsearch Grid](#integration-with-newgrid) example above for a production-ready implementation with:
- ✅ Full-text search
- ✅ Faceted filtering
- ✅ Range filtering (price, date)
- ✅ Cursor pagination with "Load More"
- ✅ Aggregations display
- ✅ Total results count

---

## Comparison with HttpDataProvider

| Feature | HttpDataProvider | DSTElasticDataProvider |
|---------|------------------|------------------------|
| Pagination | Page or Cursor | Cursor only |
| Backend | Any REST API | Elasticsearch |
| Queries | URL params | DSL queries |
| Aggregations | No | Yes |
| Complexity | Simple | Advanced |
| Use Case | Standard CRUD | Search/Analytics |

**When to use DSTElasticDataProvider:**
- Elasticsearch backend
- Complex search requirements
- Faceted filtering
- Analytics/aggregations
- Large datasets with deep pagination

**When to use HttpDataProvider:**
- Standard REST API
- Simple pagination
- No aggregations needed
- Traditional CRUD operations

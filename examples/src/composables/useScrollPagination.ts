import { ref, computed, onMounted, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrayDataProvider,
  QueryParamsStateProvider,
  type Column
} from '@einhasad-vue/datatable-vue'

export interface ScrollProduct {
  id: number
  name: string
  category: string
  price: number
  rating: number
  stock: number
  sku: string
}

const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Toys', 'Beauty', 'Automotive']
const ADJECTIVES = ['Premium', 'Professional', 'Essential', 'Ultimate', 'Classic', 'Modern', 'Smart', 'Portable']
const NOUNS = ['Widget', 'Gadget', 'Device', 'Tool', 'Kit', 'Set', 'Pack', 'Bundle']

function generateProducts(count: number): ScrollProduct[] {
  return Array.from({ length: count }, (_, i) => {
    const adjective = ADJECTIVES[i % ADJECTIVES.length]
    const noun = NOUNS[Math.floor(i / ADJECTIVES.length) % NOUNS.length]
    const category = CATEGORIES[i % CATEGORIES.length]

    return {
      id: i + 1,
      name: `${adjective} ${noun} ${i + 1}`,
      category,
      price: parseFloat((Math.random() * 500 + 10).toFixed(2)),
      rating: parseFloat((Math.random() * 2 + 3).toFixed(1)),
      stock: Math.floor(Math.random() * 1000),
      sku: `SKU-${String(i + 1).padStart(6, '0')}`
    }
  })
}

export const scrollPaginationColumns: Column[] = [
  { key: 'id', label: 'ID', sort: 'id' },
  { key: 'name', label: 'Product Name', sort: 'name' },
  { key: 'category', label: 'Category', sort: 'category' },
  {
    key: 'price',
    label: 'Price',
    sort: 'price',
    value: (row: ScrollProduct) => `$${row.price.toFixed(2)}`
  },
  {
    key: 'rating',
    label: 'Rating',
    sort: 'rating',
    component: (row: ScrollProduct) => ({
      is: 'span',
      props: {
        style: {
          color: row.rating >= 4.5 ? '#38a169' : row.rating >= 4 ? '#d69e2e' : '#e53e3e',
          fontWeight: 'bold'
        }
      },
      content: `${row.rating} \u2B50`
    })
  },
  {
    key: 'stock',
    label: 'Stock',
    sort: 'stock',
    value: (row: ScrollProduct) => row.stock.toLocaleString()
  },
  { key: 'sku', label: 'SKU' }
]

export interface UseScrollPaginationOptions {
  totalProducts?: number
  pageSize?: number
  bufferSize?: number
  statePrefix?: string
}

export function useScrollPagination(options: UseScrollPaginationOptions = {}) {
  const {
    totalProducts = 10000,
    pageSize = 50,
    bufferSize = 100,
    statePrefix = 'scroll'
  } = options

  const router = useRouter()
  const allProducts = generateProducts(totalProducts)

  const stateProvider = new QueryParamsStateProvider({
    router,
    prefix: statePrefix
  })

  const dataProvider = new ArrayDataProvider({
    items: allProducts.slice(0, pageSize),
    stateProvider
  })

  const gridRef = ref<any>(null)
  const containerRef = ref<HTMLElement | null>(null)
  const searchQuery = ref('')
  const sortBy = ref('')
  const totalCount = ref(totalProducts)
  const loading = ref(false)

  const loadedItems = ref<ScrollProduct[]>(allProducts.slice(0, pageSize))
  const totalLoaded = ref(pageSize)
  const windowStart = ref(0)
  const windowEnd = ref(pageSize)
  const hasMoreData = ref(true)

  let searchTimeout: ReturnType<typeof setTimeout> | null = null
  let lastScrollTop = 0

  const paginationInfo = computed(() => ({
    hasMore: () => hasMoreData.value
  }))

  const updateWindow = () => {
    const windowItems = loadedItems.value.slice(windowStart.value, windowEnd.value)
    dataProvider.setAllItems(windowItems)
  }

  const filterProducts = (query: string): ScrollProduct[] => {
    if (!query) return allProducts
    const lowerQuery = query.toLowerCase()
    return allProducts.filter(product =>
      product.name.toLowerCase().includes(lowerQuery) ||
      product.category.toLowerCase().includes(lowerQuery) ||
      product.sku.toLowerCase().includes(lowerQuery)
    )
  }

  const handleSearchInput = async (event: Event) => {
    const value = (event.target as HTMLInputElement).value
    searchQuery.value = value

    if (searchTimeout) clearTimeout(searchTimeout)

    searchTimeout = setTimeout(async () => {
      const query = value.toLowerCase().trim()
      windowStart.value = 0
      loading.value = false

      if (query) {
        const filtered = filterProducts(query)
        loadedItems.value = filtered.slice(0, pageSize)
        totalLoaded.value = Math.min(pageSize, filtered.length)
        totalCount.value = filtered.length
        hasMoreData.value = filtered.length > pageSize
      } else {
        loadedItems.value = allProducts.slice(0, pageSize)
        totalLoaded.value = pageSize
        totalCount.value = allProducts.length
        hasMoreData.value = true
      }

      windowEnd.value = loadedItems.value.length
      updateWindow()

      if (query) {
        stateProvider.setFilter('q', value)
      } else {
        stateProvider.clearFilter('q')
      }

      if (gridRef.value) await gridRef.value.refresh()
    }, 300)
  }

  const handleSortChange = async () => {
    if (sortBy.value) {
      const isDesc = sortBy.value.startsWith('-')
      const field = isDesc ? sortBy.value.slice(1) : ''
      stateProvider.setSort(field, isDesc ? 'desc' : 'asc')
    } else {
      stateProvider.clearSort()
    }

    if (gridRef.value) await gridRef.value.refresh()
  }

  const handleScroll = async (event: Event) => {
    const container = event.target as HTMLElement
    if (!container) return

    const scrollTop = container.scrollTop
    const scrollDelta = lastScrollTop - scrollTop
    const nearTopThreshold = 50
    const isNearTop = scrollTop <= nearTopThreshold
    const isScrollingUp = scrollTop < lastScrollTop

    if (isScrollingUp && isNearTop && scrollDelta > 1 && windowStart.value > 0) {
      const shiftAmount = Math.min(pageSize, windowStart.value)
      windowStart.value -= shiftAmount
      windowEnd.value = windowStart.value + Math.min(bufferSize, loadedItems.value.length - windowStart.value)
      lastScrollTop = scrollTop
      updateWindow()
      if (gridRef.value) await gridRef.value.refresh()
      return
    }

    lastScrollTop = scrollTop
  }

  const handleLoadMore = async () => {
    if (loading.value || !hasMoreData.value) return

    loading.value = true

    try {
      const nextEnd = totalLoaded.value + pageSize
      if (nextEnd <= allProducts.length) {
        const newItems = allProducts.slice(totalLoaded.value, nextEnd)
        loadedItems.value = [...loadedItems.value, ...newItems]
        totalLoaded.value = nextEnd
      } else {
        hasMoreData.value = false
      }

      if (loadedItems.value.length > bufferSize) {
        windowStart.value += pageSize
        windowEnd.value = Math.min(windowStart.value + bufferSize, loadedItems.value.length)
      } else {
        windowEnd.value = loadedItems.value.length
      }

      updateWindow()
      if (gridRef.value) await gridRef.value.refresh()
    } finally {
      loading.value = false
    }
  }

  const initialize = () => {
    const filters = stateProvider.getAllFilters()
    if (filters.q) {
      searchQuery.value = filters.q
      const query = filters.q.toLowerCase().trim()
      const filtered = filterProducts(query)
      loadedItems.value = filtered.slice(0, pageSize)
      totalLoaded.value = Math.min(pageSize, filtered.length)
      totalCount.value = filtered.length
      hasMoreData.value = filtered.length > pageSize
      windowEnd.value = loadedItems.value.length
      updateWindow()
    } else {
      updateWindow()
    }

    const sort = stateProvider.getSort()
    if (sort) {
      const prefix = sort.order === 'desc' ? '-' : ''
      sortBy.value = `${prefix}${sort.field}`
    }
  }

  onMounted(initialize)

  return {
    gridRef,
    containerRef,
    dataProvider,
    columns: scrollPaginationColumns,
    searchQuery,
    sortBy,
    totalCount,
    loading,
    paginationInfo,
    handleSearchInput,
    handleSortChange,
    handleScroll,
    handleLoadMore
  }
}

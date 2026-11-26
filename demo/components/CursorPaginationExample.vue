<template>
  <Grid
    :data-provider="provider"
    :columns="columns"
  />
  <button
    v-if="hasNextPage"
    type="button"
    class="grid-load-more demo-load-more-btn"
    :disabled="provider.isLoading()"
    @click="loadMore"
  >
    {{ provider.isLoading() ? 'Loading...' : 'Load More' }}
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  Grid,
  CallbackDataProvider,
  type Column,
  type KeysetPaginationState,
} from '@einhasad-vue/datatable-vue'

interface Product {
  id: number
  name: string
  price: string
  category: string
}

const pageSize = 8

const products: Product[] = Array.from({ length: 35 }, (_, i) => ({
  id: i + 1,
  name: `Product ${i + 1}`,
  price: `$${(10 + ((i * 37) % 90) + 0.99).toFixed(2)}`,
  category: ['Electronics', 'Clothing', 'Books', 'Home'][i % 4],
}))

function fetchProductsAfter(lastId: number | null, limit: number): Promise<Product[]> {
  return Promise.resolve(products.filter(p => lastId === null || p.id > lastId).slice(0, limit + 1))
}

const hasNextPage = ref(false)
let loaded: Product[] = []

const provider = new CallbackDataProvider<Product>({
  loadFn: async (_options, keyset) => {
    const lastId = (keyset?.cursor?.[0] as number | undefined) ?? null
    const fetched = await fetchProductsAfter(lastId, pageSize)
    const page = fetched.slice(0, pageSize)
    loaded = lastId === null ? page : [...loaded, ...page]
    provider.setKeysetPagination({
      cursor: page.length > 0 ? [page[page.length - 1].id] : keyset?.cursor ?? null,
      pageSize,
      hasNextPage: fetched.length > pageSize,
    })
    return { items: loaded }
  },
  keysetPaginationFn: (state: KeysetPaginationState) => {
    hasNextPage.value = state.hasNextPage
  },
})
provider.setKeysetPagination({ cursor: null, pageSize, hasNextPage: false })

async function loadMore(): Promise<void> {
  if (provider.isLoading() || !provider.getKeysetPagination()?.hasNextPage) return
  await provider.load()
}

const columns: Column<Product>[] = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Product Name' },
  { key: 'price', label: 'Price' },
  { key: 'category', label: 'Category' },
]
</script>

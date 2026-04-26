<template>
  <div class="demo-controls">
    <div class="demo-control-group">
      <label for="scroll-search-main">Search:</label>
      <input
        id="scroll-search-main"
        :value="searchQuery"
        type="text"
        placeholder="Search products..."
        class="demo-input"
        @input="handleSearchInput"
      />
    </div>
    <div class="demo-control-group">
      <label for="scroll-sort-main">Sort By:</label>
      <select
        id="scroll-sort-main"
        v-model="sortBy"
        class="demo-select"
        @change="handleSortChange"
      >
        <option value="">
          Default
        </option>
        <option value="name">
          Name (A-Z)
        </option>
        <option value="-name">
          Name (Z-A)
        </option>
        <option value="price">
          Price (Low-High)
        </option>
        <option value="-price">
          Price (High-Low)
        </option>
        <option value="rating">
          Rating (Low-High)
        </option>
        <option value="-rating">
          Rating (High-Low)
        </option>
      </select>
    </div>
    <div
      class="demo-control-group"
      style="justify-content: flex-end; align-items: flex-end;"
    >
      <span style="font-size: 13px; color: var(--ink-3);">Total: {{ totalCount.toLocaleString() }} products</span>
    </div>
  </div>
  <div
    ref="containerRef"
    class="scroll-container demo-scroll-container"
  >
    <ScrollPagination
      position="top"
      :pagination="paginationInfo"
      :loading="loading"
      @load-earlier="handleLoadEarlier"
    >
      <template #loading-text>
        Loading earlier products...
      </template>
    </ScrollPagination>
    <Grid
      :data-provider="dataProvider"
      :columns="columns"
    />
    <ScrollPagination
      :pagination="paginationInfo"
      :loading="loading"
      @load-more="handleLoadMore"
    >
      <template #loading-text>
        Loading more products...
      </template>
      <template #end-text>
        No more products
      </template>
    </ScrollPagination>
  </div>
</template>

<script setup lang="ts">
import { Grid, ScrollPagination } from '@einhasad-vue/datatable-vue'
import { useScrollPagination } from '../../examples/src/composables/useScrollPagination'

const {
  containerRef,
  dataProvider,
  columns,
  searchQuery,
  sortBy,
  totalCount,
  loading,
  paginationInfo,
  handleSearchInput,
  handleSortChange,
  handleLoadEarlier,
  handleLoadMore
} = useScrollPagination()
</script>

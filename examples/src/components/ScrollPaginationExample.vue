<template>
  <section id="scroll-pagination" class="section">
    <div>
      <h2>Infinite Scroll Pagination (10,000 rows)</h2>

      <div class="example-description">
        <p>
          This example demonstrates <strong>automatic infinite scroll</strong> with a large dataset (10,000 rows),
          <strong>search functionality</strong>, <strong>column sorting</strong>, and <strong>URL state persistence</strong>
          using <code>QueryParamsStateProvider</code>. Scroll down to automatically load more data - no button needed!
        </p>
      </div>

      <div class="example-section">
        <h3>Key Features</h3>
        <ul class="feature-list">
          <li><strong>10,000 generated rows:</strong> Large dataset for performance testing</li>
          <li><strong>Infinite scroll:</strong> Automatically loads more data when scrolling near bottom</li>
          <li><strong>Search:</strong> Filter by name, category, or SKU</li>
          <li><strong>Sort:</strong> Sort by any column (click headers or use dropdown)</li>
          <li><strong>URL State:</strong> Search and sort are persisted in URL query params</li>
        </ul>
      </div>

      <div class="example-section">
        <h3>Demo</h3>
        <div class="controls">
          <div class="control-group">
            <label for="scroll-search-main">Search:</label>
            <input
              id="scroll-search-main"
              :value="searchQuery"
              type="text"
              placeholder="Search products..."
              class="search-input"
              @input="handleSearchInput"
            />
          </div>
          <div class="control-group">
            <label for="scroll-sort-main">Sort By:</label>
            <select id="scroll-sort-main" v-model="sortBy" @change="handleSortChange" class="sort-select">
              <option value="">Default</option>
              <option value="name">Name (A-Z)</option>
              <option value="-name">Name (Z-A)</option>
              <option value="price">Price (Low-High)</option>
              <option value="-price">Price (High-Low)</option>
              <option value="rating">Rating (Low-High)</option>
              <option value="-rating">Rating (High-Low)</option>
            </select>
          </div>
          <div class="control-group info-text">
            <span>Total: {{ totalCount.toLocaleString() }} products</span>
          </div>
        </div>
        <div class="scroll-container" @scroll="handleScroll" ref="containerRef">
          <Grid
            ref="gridRef"
            :data-provider="dataProvider"
            :columns="columns"
          />
          <ScrollPagination
            :pagination="paginationInfo"
            :loading="loading"
            @load-more="handleLoadMore"
          >
            <template #loading-text>Loading more products...</template>
            <template #end-text>No more products</template>
          </ScrollPagination>
        </div>
      </div>

      <div class="example-section">
        <h3>Code</h3>
        <CodeExample examplePath="/examples/code/ScrollPaginationExample.vue" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Grid, ScrollPagination } from '@einhasad-vue/datatable-vue'
import { useScrollPagination } from '../composables/useScrollPagination'
import CodeExample from './CodeExample.vue'

const {
  gridRef,
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
  handleScroll,
  handleLoadMore
} = useScrollPagination()
</script>

<style scoped>
.section {
  margin-bottom: 4rem;
  scroll-margin-top: 2rem;
}

.example-section {
  margin-bottom: 2rem;
}

.example-description {
  margin-bottom: 1.5rem;
  color: #4a5568;
}

.feature-list {
  line-height: 1.8;
}

.feature-list li {
  margin-bottom: 0.5rem;
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

.info-text {
  display: flex;
  align-items: flex-end;
  color: #4a5568;
  font-size: 0.9rem;
}

.scroll-container {
  max-height: 500px;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
}
</style>

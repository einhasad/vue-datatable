<template>
  <div class="demo-controls">
    <div class="demo-control-group">
      <label>Demo state</label>
      <div style="display:flex; gap:8px;">
        <button
          class="demo-btn"
          :class="{ 'is-active': mode === 'data' }"
          @click="mode = 'data'"
        >
          Show data
        </button>
        <button
          class="demo-btn"
          :class="{ 'is-active': mode === 'empty' }"
          @click="mode = 'empty'"
        >
          Empty state
        </button>
        <button
          class="demo-btn"
          :class="{ 'is-active': mode === 'loading' }"
          @click="mode = 'loading'"
        >
          Loading…
        </button>
      </div>
    </div>
  </div>

  <Grid
    :data-provider="provider"
    :columns="columns"
    :show-loader="mode === 'loading'"
  >
    <!-- Custom empty state -->
    <template #empty>
      <div class="cz-empty">
        <div class="cz-empty__art">
          📭
        </div>
        <div class="cz-empty__title">
          Nothing to show
        </div>
        <p class="cz-empty__lead">
          Try adjusting filters or adding new records.
        </p>
      </div>
    </template>

    <!-- Custom loader -->
    <template #loader>
      <div class="cz-loader">
        <span class="cz-loader__spinner" />
        <span>Crunching data…</span>
      </div>
    </template>

    <!-- Custom pagination using the lib's PagePagination component -->
    <template #pagination="{ pagination, setPage }">
      <div class="cz-pagination">
        <PagePagination
          :current-page="pagination.currentPage"
          :total-pages="pagination.totalPages"
          :total-items="pagination.totalItems"
          :items-per-page="pagination.pageSize"
          :show-summary="true"
          @page-change="setPage"
        />
      </div>
    </template>
  </Grid>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  Grid,
  ArrayDataProvider,
  PagePagination,
  type Column
} from '@einhasad-vue/datatable-vue'

interface Person {
  id: number
  name: string
  role: string
}

const allPeople: Person[] = Array.from({ length: 23 }, (_, i) => ({
  id: i + 1,
  name: `User ${String.fromCharCode(65 + (i % 26))}${i + 1}`,
  role: ['Engineer', 'Designer', 'PM', 'Analyst'][i % 4]
}))

const mode = ref<'data' | 'empty' | 'loading'>('data')

const items = computed(() => (mode.value === 'empty' ? [] : allPeople))

const provider = new ArrayDataProvider<Person>({ items: items.value })
provider.setOffsetPagination({ page: 1, pageSize: 8 })

watch(items, (next) => {
  provider.setAllItems(next)
})

const columns: Column<Person>[] = [
  { key: 'id', label: 'ID', sort: 'id' },
  { key: 'name', label: 'Name', sort: 'name' },
  { key: 'role', label: 'Role', sort: 'role' }
]
</script>

<style scoped>
.demo-btn {
  font: inherit;
  font-size: 13px;
  padding: 6px 12px;
  border: 1px solid var(--line);
  border-radius: var(--radius-xs);
  background: var(--paper);
  color: var(--ink-2);
  cursor: pointer;
}
.demo-btn:hover { color: var(--ink); border-color: var(--line-2); }
.demo-btn.is-active {
  background: var(--ink);
  color: var(--paper);
  border-color: var(--ink);
}

.cz-empty {
  text-align: center;
  padding: 48px 16px;
  color: var(--ink-3);
}
.cz-empty__art { font-size: 32px; margin-bottom: 8px; }
.cz-empty__title {
  font-weight: 600;
  font-size: 15px;
  color: var(--ink);
  margin-bottom: 4px;
}
.cz-empty__lead { margin: 0; font-size: 13px; }

.cz-loader {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 24px;
  color: var(--ink-2);
  font-size: 13px;
}
.cz-loader__spinner {
  width: 14px; height: 14px;
  border: 2px solid var(--line-2);
  border-top-color: var(--ink);
  border-radius: 50%;
  animation: cz-spin 0.7s linear infinite;
}
@keyframes cz-spin { to { transform: rotate(360deg); } }

.cz-pagination {
  margin-top: 12px;
  padding: 12px;
  background: var(--surface-sunk);
  border-radius: var(--radius-xs);
}
</style>

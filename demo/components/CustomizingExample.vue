<template>
  <div class="demo-controls">
    <div
      class="demo-control-group"
      role="group"
      aria-labelledby="cz-mode-label"
    >
      <span
        id="cz-mode-label"
        class="cz-mode-label"
      >Demo state</span>
      <div class="cz-mode-buttons">
        <button
          v-for="option in modes"
          :key="option.value"
          type="button"
          class="demo-btn"
          :class="{ 'is-active': mode === option.value }"
          :aria-pressed="mode === option.value"
          :data-mode="option.value"
          @click="mode = option.value"
        >
          {{ option.label }}
        </button>
      </div>
    </div>
  </div>

  <Grid
    :data-provider="provider"
    :columns="columns"
  >
    <template #empty>
      <div class="cz-empty">
        <div
          class="cz-empty__art"
          aria-hidden="true"
        >
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

    <template #loader>
      <div
        class="cz-loader"
        role="status"
      >
        <span
          class="cz-loader__spinner"
          aria-hidden="true"
        />
        <span>Crunching data…</span>
      </div>
    </template>

    <template #pagination="{ pagination, setPage }">
      <div class="cz-pagination">
        <PagePagination
          :current-page="pagination.currentPage"
          :total-pages="pagination.totalPages"
          :total-items="pagination.totalItems"
          :items-per-page="pagination.pageSize"
          show-summary
          @page-change="setPage"
        />
      </div>
    </template>
  </Grid>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  Grid,
  CallbackDataProvider,
  PagePagination,
  type Column,
  type LoadOptions,
} from '@einhasad-vue/datatable-vue'

interface Person {
  id: number
  name: string
  role: string
}

type Mode = 'data' | 'empty' | 'loading'

const modes: { value: Mode, label: string }[] = [
  { value: 'data', label: 'Show data' },
  { value: 'empty', label: 'Empty state' },
  { value: 'loading', label: 'Loading…' },
]

const allPeople: Person[] = Array.from({ length: 23 }, (_, i) => ({
  id: i + 1,
  name: `User ${String.fromCharCode(65 + (i % 26))}${i + 1}`,
  role: ['Engineer', 'Designer', 'PM', 'Analyst'][i % 4],
}))

const mode = ref<Mode>('data')
let finishLoading: (() => void) | null = null

function waitUntilModeChanges(): Promise<void> {
  return new Promise(resolve => {
    finishLoading = resolve
  })
}

function sortPeople(people: Person[], { sortField, sortOrder }: LoadOptions): Person[] {
  if (!sortField || !sortOrder) return people
  const field = sortField as keyof Person
  const direction = sortOrder === 'asc' ? 1 : -1
  return [...people].sort((a, b) => String(a[field]).localeCompare(String(b[field]), undefined, { numeric: true }) * direction)
}

const provider = new CallbackDataProvider<Person>({
  loadFn: async (options, _keyset, offset) => {
    if (mode.value === 'loading') await waitUntilModeChanges()
    const people = mode.value === 'empty' ? [] : sortPeople(allPeople, options)
    const pageSize = offset?.pageSize ?? 8
    const lastPage = Math.max(1, Math.ceil(people.length / pageSize))
    const page = Math.min(offset?.page ?? 1, lastPage)
    return {
      items: people.slice((page - 1) * pageSize, page * pageSize),
      pagination: { currentPage: page, pageSize, totalItems: people.length },
    }
  },
  offsetPaginationFn: () => {},
})
provider.setOffsetPagination({ page: 1, pageSize: 8 })

watch(mode, () => {
  finishLoading?.()
  finishLoading = null
  provider.refresh().catch(() => {})
})

const columns: Column<Person>[] = [
  { key: 'id', label: 'ID', sort: 'id' },
  { key: 'name', label: 'Name', sort: 'name' },
  { key: 'role', label: 'Role', sort: 'role' },
]
</script>

<style scoped>
.cz-mode-label {
  font-size: var(--fs-sm);
  font-weight: 500;
  color: var(--ink-2);
}

.cz-mode-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.demo-btn {
  font: inherit;
  font-size: 13px;
  min-height: 32px;
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

@media (prefers-reduced-motion: reduce) {
  .cz-loader__spinner { animation: none; }
}

.cz-pagination {
  margin-top: 12px;
  padding: 12px;
  background: var(--surface-sunk);
  border-radius: var(--radius-xs);
}
</style>

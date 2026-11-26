<template>
  <div class="mass-action-demo">
    <div class="mass-action-demo__toolbar">
      <span
        class="mass-action-demo__count"
        :class="{ 'is-empty': selectedIds.length === 0 }"
        role="status"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <polyline points="3,8 6.5,11.5 13,4.5" />
        </svg>
        {{ selectedIds.length }} selected
      </span>
      <div class="mass-action-demo__actions">
        <button
          type="button"
          class="ds-btn ds-btn--ghost ds-btn--sm"
          :disabled="selectedIds.length === 0"
          @click="onClearSelection"
        >
          Clear
        </button>
        <button
          type="button"
          class="ds-btn ds-btn--danger ds-btn--sm"
          :disabled="selectedIds.length === 0"
          @click="onDeleteSelected"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <polyline points="2.5,4 13.5,4" />
            <path d="M5 4V2.5a1 1 0 011-1h4a1 1 0 011 1V4" />
            <path d="M3.5 4l.7 9a1.5 1.5 0 001.5 1.4h4.6a1.5 1.5 0 001.5-1.4l.7-9" />
          </svg>
          Delete selected
        </button>
      </div>
    </div>
    <Grid
      :data-provider="provider"
      :columns="columns"
      :row-key="(item) => item.id"
      :row-state-provider="rowState"
      :row-options="rowOptionsFor"
    >
      <template #pagination="{ pagination, setPage }">
        <PagePagination
          :current-page="pagination.currentPage"
          :total-pages="pagination.totalPages"
          :total-items="pagination.totalItems"
          :items-per-page="pagination.pageSize"
          :max-visible-pages="5"
          show-summary
          @page-change="setPage"
        />
      </template>
    </Grid>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  ArrayDataProvider,
  Grid,
  InMemoryRowStateProvider,
  PagePagination,
  type Column,
  type RowContext,
  type RowOptions,
} from '@einhasad-vue/datatable-vue'

interface Row {
  id: string
  name: string
  email: string
  role: string
}

const roles = ['Admin', 'Editor', 'Viewer', 'Owner']

const initial: Row[] = Array.from({ length: 23 }, (_, i) => ({
  id: String(i + 1),
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  role: roles[i % roles.length],
}))

const provider = new ArrayDataProvider<Row>({ items: initial })
provider.setOffsetPagination({ page: 1, pageSize: 5 })
const rowState = new InMemoryRowStateProvider()

const selectionTick = ref(0)
const selectedIds = computed<string[]>(() => {
  void selectionTick.value
  return rowState.entries('selected').map(String)
})

const columns: Column<Row>[] = [
  {
    key: 'select',
    label: '',
    component: (item, _i, ctx?: RowContext) => ({
      is: 'input',
      props: {
        type: 'checkbox',
        class: 'mass-action-demo__checkbox',
        'aria-label': `Select ${item.name}`,
        checked: Boolean(ctx?.rowState.get('selected')),
      },
      events: {
        change: () => {
          ctx?.rowState.toggle('selected')
          selectionTick.value++
        },
      },
    }),
  },
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
]

function rowOptionsFor(item: Row): RowOptions {
  void selectionTick.value
  const isSelected = rowState.get(item.id, 'selected') === true
  return { class: isSelected ? 'mass-action-demo__row--selected' : '' }
}

function onDeleteSelected(): void {
  const ids = new Set(selectedIds.value)
  provider.setAllItems(provider.getAllItems().filter(row => !ids.has(row.id)))
  rowState.clear('selected')
  selectionTick.value++
}

function onClearSelection(): void {
  rowState.clear('selected')
  selectionTick.value++
}
</script>

<style scoped>
.mass-action-demo {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #ffffff;
  overflow: hidden;
}

.mass-action-demo__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 0.75rem;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.mass-action-demo__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-left: auto;
}

.mass-action-demo__count {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.8125rem;
  font-weight: 500;
  background: #dbeafe;
  color: #1d4ed8;
  transition: background-color 120ms ease-out, color 120ms ease-out;
}

.mass-action-demo__count.is-empty {
  background: #f1f5f9;
  color: #475569;
}

.mass-action-demo :deep(.mass-action-demo__checkbox) {
  appearance: none;
  -webkit-appearance: none;
  width: 24px;
  height: 24px;
  margin: 0;
  border: 1.5px solid #64748b;
  border-radius: 5px;
  background: #ffffff;
  cursor: pointer;
  position: relative;
  vertical-align: middle;
  transition: background-color 120ms ease-out, border-color 120ms ease-out;
}

.mass-action-demo :deep(.mass-action-demo__checkbox:hover) {
  border-color: #334155;
}

.mass-action-demo :deep(.mass-action-demo__checkbox:checked) {
  background: #2563eb;
  border-color: #2563eb;
}

.mass-action-demo :deep(.mass-action-demo__checkbox:checked::after) {
  content: '';
  position: absolute;
  inset: 0;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='white' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='3,8 6.5,11.5 13,4.5'/%3E%3C/svg%3E") center/16px no-repeat;
}

.mass-action-demo :deep(.mass-action-demo__checkbox:focus-visible) {
  outline: 2px solid #3b82f6;
  outline-offset: 1px;
}

.mass-action-demo :deep(.grid-table) {
  width: 100%;
  border-collapse: collapse;
}

.mass-action-demo :deep(.grid-row) {
  transition: background-color 120ms ease-out;
}

.mass-action-demo :deep(.grid-row:hover) {
  background-color: #f8fafc;
}

.mass-action-demo :deep(.mass-action-demo__row--selected) {
  background-color: #eff6ff;
}

.mass-action-demo :deep(.mass-action-demo__row--selected:hover) {
  background-color: #dbeafe;
}

.mass-action-demo :deep(.grid-cell) {
  padding: 0.55rem 0.85rem;
  border-bottom: 1px solid #f1f5f9;
}

.mass-action-demo :deep(.grid-pagination) {
  padding: 0.5rem 0.85rem;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
}
</style>

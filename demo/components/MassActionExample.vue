<template>
  <div>
    <div style="margin-bottom: 0.75rem; display: flex; gap: 0.5rem; align-items: center;">
      <button
        type="button"
        :disabled="selectedIds.length === 0"
        @click="onDeleteSelected"
      >
        Delete selected ({{ selectedIds.length }})
      </button>
      <button
        type="button"
        :disabled="selectedIds.length === 0"
        @click="onClearSelection"
      >
        Clear selection
      </button>
    </div>
    <Grid
      :data-provider="provider"
      :columns="columns"
      :row-key="(item) => item.id"
      :row-state-provider="rowState"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Grid, ArrayDataProvider, InMemoryRowStateProvider, type Column, type RowContext } from '@einhasad-vue/datatable-vue'

interface Row { id: string; name: string; email: string }

const initial: Row[] = [
  { id: '1', name: 'Alice', email: 'alice@example.com' },
  { id: '2', name: 'Bob', email: 'bob@example.com' },
  { id: '3', name: 'Carol', email: 'carol@example.com' },
]

const provider = new ArrayDataProvider<Row>({ items: initial })
const rowState = new InMemoryRowStateProvider()

const selectionTick = ref(0)
const selectedIds = computed<string[]>(() => {
  void selectionTick.value
  return rowState.entries('selected') as string[]
})

const columns: Column<Row>[] = [
  {
    key: 'select',
    label: '',
    component: (_item, _i, ctx?: RowContext) => ({
      is: 'input',
      props: { type: 'checkbox', checked: Boolean(ctx?.rowState.get('selected')) },
      events: {
        change: () => {
          ctx?.rowState.toggle('selected')
          selectionTick.value++
        },
      },
    }),
  },
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
]

function onDeleteSelected() {
  const ids = new Set(selectedIds.value)
  const remaining = provider.getCurrentItems().filter(r => !ids.has(r.id))
  provider.updateRows(remaining)
  rowState.clear('selected')
  selectionTick.value++
}

function onClearSelection() {
  rowState.clear('selected')
  selectionTick.value++
}
</script>

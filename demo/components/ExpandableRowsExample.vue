<template>
  <div class="expandable-demo">
    <Grid
      :data-provider="provider"
      :columns="columns"
      :row-key="(item) => item.id"
      children-field="children"
      :row-options="rowOptionsFor"
      @expand="handleExpand"
      @collapse="handleCollapse"
    >
      <template #pagination="{ pagination, setPage }">
        <PagePagination
          :current-page="pagination.currentPage"
          :total-pages="pagination.totalPages"
          :total-items="pagination.totalItems"
          :items-per-page="pagination.pageSize"
          :max-visible-pages="5"
          :show-summary="true"
          @page-change="setPage"
        />
      </template>
    </Grid>
  </div>
</template>

<script setup lang="ts">
import {
  ArrayDataProvider,
  Grid,
  PagePagination,
  type Column,
  type RowOptions,
} from '@einhasad-vue/datatable-vue'

interface Node {
  id: string
  name: string
  team: string
  size: number
  children?: Node[]
}

const teams = ['Platform', 'Growth', 'Search', 'Infra', 'Mobile', 'Data']

const tree: Node[] = Array.from({ length: 17 }, (_, i) => ({
  id: String(i + 1),
  name: `Department ${i + 1}`,
  team: teams[i % teams.length],
  size: 12 + ((i * 7) % 90),
}))

const provider = new ArrayDataProvider<Node>({ items: tree })
provider.setOffsetPagination({ page: 1, pageSize: 5 })

const columns: Column<Node>[] = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Department', expandToggle: true },
  { key: 'team', label: 'Team' },
  { key: 'size', label: 'Headcount' },
]

function rowOptionsFor(item: Node): RowOptions {
  const id = item.id
  const isNested = id.includes('.')
  return { class: isNested ? 'expandable-demo__row--nested' : 'expandable-demo__row--root' }
}

function fetchChildren(parent: Node): Promise<Node[]> {
  return new Promise(resolve =>
    setTimeout(() => {
      const count = 2 + (Number(parent.id.split('.').pop()!) % 3)
      resolve(
        Array.from({ length: count }, (_, i) => ({
          id: `${parent.id}.${i + 1}`,
          name: `${parent.name} · sub ${i + 1}`,
          team: parent.team,
          size: Math.max(2, Math.floor(parent.size / (count + 1))),
        }))
      )
    }, 250)
  )
}

async function handleExpand(item: Node) {
  const children = await fetchChildren(item)
  const current = provider.getCurrentItems()
  const updated = updateNode(current, item.id, n => ({ ...n, children }))
  provider.updateRows(updated)
}

function handleCollapse(item: Node) {
  const current = provider.getCurrentItems()
  const updated = updateNode(current, item.id, n => ({ ...n, children: undefined }))
  provider.updateRows(updated)
}

function updateNode(items: Node[], id: string, mapFn: (n: Node) => Node): Node[] {
  return items.map(it => {
    if (it.id === id) return mapFn(it)
    if (it.children) return { ...it, children: updateNode(it.children, id, mapFn) }
    return it
  })
}
</script>

<style scoped>
.expandable-demo {
  --grid-depth-indent: 1.5rem;
  --grid-chevron-color: #475569;
  --grid-chevron-hover-bg: rgba(15, 23, 42, 0.07);
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #ffffff;
  overflow: hidden;
}

.expandable-demo :deep(.grid-table) {
  border-collapse: collapse;
  width: 100%;
}

.expandable-demo :deep(.grid-row) {
  transition: background-color 120ms ease-out;
}

.expandable-demo :deep(.grid-row:hover) {
  background-color: #f8fafc;
}

.expandable-demo :deep(.grid-row[data-depth="0"]) {
  font-weight: 600;
}

.expandable-demo :deep(.grid-row[data-depth="1"]) {
  background-color: #fafbfc;
  color: #475569;
  font-weight: 400;
}

.expandable-demo :deep(.grid-row[data-depth="2"]) {
  background-color: #f1f5f9;
  color: #64748b;
}

.expandable-demo :deep(.grid-cell) {
  padding: 0.55rem 0.85rem;
  border-bottom: 1px solid #f1f5f9;
}

.expandable-demo :deep(.grid-pagination) {
  padding: 0.5rem 0.85rem;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
}
</style>
